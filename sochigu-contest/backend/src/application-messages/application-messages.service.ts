import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApplicationMessage } from "./entities/application-message.entity";
import { ApplicationThreadRead } from "./entities/application-thread-read.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { Role } from "../common/enums/role.enum";
import { MessageKind } from "../common/enums/message-kind.enum";
import { ApplicationStatus } from "../common/enums/application-status.enum";
import { CreateMessageDto, MESSAGE_MAX_LENGTH } from "./dto/create-message.dto";
import { MessageView, UnreadMap } from "./types/message-view";
import { MailService } from "../mail/mail.service";

const STAFF_ROLES: Role[] = [Role.EXPERT, Role.MODERATOR, Role.ADMIN];

export const MAX_PARTICIPANT_STREAK = 3;

const EMAIL_THROTTLE_MINUTES = 10;

const THREAD_LIMIT = 500;

@Injectable()
export class ApplicationMessagesService {
  private readonly logger = new Logger(ApplicationMessagesService.name);

  constructor(
    @InjectRepository(ApplicationMessage)
    private msgRepo: Repository<ApplicationMessage>,
    @InjectRepository(ApplicationThreadRead)
    private readRepo: Repository<ApplicationThreadRead>,
    @InjectRepository(Application)
    private appRepo: Repository<Application>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  private isStaff(user: User): boolean {
    return STAFF_ROLES.includes(user.role);
  }

  // Участник — только автор заявки, персонал (эксперт, модератор, админ) — любая заявка.
  // Остальные роли (в том числе работодатель) доступа не имеют.
  private async assertAccess(user: User, applicationId: string) {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      select: { id: true, userId: true, status: true, projectTitle: true },
    });
    if (!app) throw new NotFoundException("Заявка не найдена");
    if (!this.isStaff(user) && app.userId !== user.id) {
      throw new ForbiddenException("Нет доступа к переписке по этой заявке");
    }
    return app;
  }

  private toView(msg: ApplicationMessage, viewer: User): MessageView {
    const viewerIsStaff = this.isStaff(viewer);

    let authorKind: MessageView["authorKind"];
    let authorLabel: string;
    if (msg.kind === MessageKind.STATUS) {
      authorKind = "system";
      authorLabel = "Статус заявки";
    } else if (msg.authorRole === Role.PARTICIPANT) {
      authorKind = "participant";
      authorLabel = "Участник";
    } else {
      authorKind = "staff";
      authorLabel = msg.authorRole === Role.EXPERT ? "Эксперт" : "Организатор";
    }

    const view: MessageView = {
      id: msg.id,
      text: msg.text,
      kind: msg.kind,
      createdAt: msg.createdAt,
      authorKind,
      authorLabel,
      isMine: msg.kind === MessageKind.MESSAGE && msg.authorId === viewer.id,
    };

    // Имя автора и признак внутренней заметки видит только персонал
    if (viewerIsStaff) {
      view.isInternal = msg.isInternal;
      view.authorName = msg.author
        ? `${msg.author.lastName} ${msg.author.firstName}`.trim()
        : null;
    }
    return view;
  }

  async findMessages(
    user: User,
    applicationId: string,
  ): Promise<MessageView[]> {
    await this.assertAccess(user, applicationId);

    const qb = this.msgRepo
      .createQueryBuilder("m")
      .leftJoin("m.author", "u")
      .addSelect(["u.id", "u.firstName", "u.lastName"])
      .where("m.applicationId = :applicationId", { applicationId })
      .andWhere("m.deletedAt IS NULL");

    if (!this.isStaff(user)) qb.andWhere("m.isInternal = false");

    const rows = await qb
      .orderBy("m.createdAt", "DESC")
      .take(THREAD_LIMIT)
      .getMany();
    rows.reverse();

    return rows.map((m) => this.toView(m, user));
  }

  async create(
    user: User,
    applicationId: string,
    dto: CreateMessageDto,
  ): Promise<MessageView> {
    const app = await this.assertAccess(user, applicationId);
    const staff = this.isStaff(user);

    if (!staff) {
      if (dto.isInternal) {
        throw new ForbiddenException("Внутренние заметки недоступны участнику");
      }
      if (app.status === ApplicationStatus.DRAFT) {
        throw new BadRequestException(
          "Переписка откроется после подачи заявки",
        );
      }
      await this.assertParticipantStreak(applicationId);
    }

    const saved = await this.msgRepo.save(
      this.msgRepo.create({
        applicationId,
        authorId: user.id,
        authorRole: user.role,
        kind: MessageKind.MESSAGE,
        text: dto.text,
        isInternal: staff ? !!dto.isInternal : false,
      }),
    );
    saved.author = user;

    if (!saved.isInternal) {
      this.notifyRecipient(app, user, staff).catch((err) =>
        this.logger.error("Ошибка отправки письма о новом сообщении:", err),
      );
    }

    return this.toView(saved, user);
  }

  private async notifyRecipient(
    app: Pick<Application, "id" | "userId" | "projectTitle">,
    sender: User,
    senderIsStaff: boolean,
  ) {
    if (!this.mailService.isReady) return;

    let recipientId: string | null = null;
    if (senderIsStaff) {
      recipientId = app.userId;
    } else {
      const rows: { authorId: string }[] = await this.msgRepo.query(
        `SELECT author_id AS "authorId"
           FROM application_messages
          WHERE application_id = $1
            AND "authorRole" <> 'participant'
            AND author_id IS NOT NULL
            AND "deletedAt" IS NULL
          ORDER BY "createdAt" DESC
          LIMIT 1`,
        [app.id],
      );
      recipientId = rows[0]?.authorId ?? null;
    }
    if (!recipientId || recipientId === sender.id) return;

    const recipient = await this.userRepo.findOne({
      where: { id: recipientId },
      select: { id: true, email: true, firstName: true, isActive: true },
    });
    if (!recipient || !recipient.isActive || !recipient.email) return;

    const claimed: unknown[] = await this.readRepo.query(
      `INSERT INTO application_thread_reads (application_id, user_id, "lastReadAt", "lastEmailAt")
       VALUES ($1, $2, 'epoch'::timestamp, now())
       ON CONFLICT (application_id, user_id)
       DO UPDATE SET "lastEmailAt" = now()
       WHERE application_thread_reads."lastEmailAt" IS NULL
          OR application_thread_reads."lastEmailAt" < now() - ($3::int * interval '1 minute')
       RETURNING 1`,
      [app.id, recipient.id, EMAIL_THROTTLE_MINUTES],
    );
    if (!claimed.length) return;

    await this.mailService.sendThreadMessage(
      { email: recipient.email, firstName: recipient.firstName },
      { id: app.id, projectTitle: app.projectTitle },
      senderIsStaff,
    );
  }


  private async assertParticipantStreak(applicationId: string) {
    const rows: { n: number }[] = await this.msgRepo.query(
      `SELECT COUNT(*)::int AS n
         FROM application_messages m
        WHERE m.application_id = $1
          AND m."authorRole" = 'participant'
          AND m."deletedAt" IS NULL
          AND m."createdAt" > COALESCE(
                (SELECT MAX(s."createdAt")
                   FROM application_messages s
                  WHERE s.application_id = $1
                    AND s."authorRole" <> 'participant'
                    AND s."isInternal" = false
                    AND s."deletedAt" IS NULL),
                '-infinity'::timestamp)`,
      [applicationId],
    );
    if ((rows[0]?.n ?? 0) >= MAX_PARTICIPANT_STREAK) {
      throw new BadRequestException(
        "Вы отправили несколько сообщений подряд. Дождитесь ответа организаторов.",
      );
    }
  }

  // Отметить ветку прочитанной (время берём из БД, как и createdAt сообщений)
  async markRead(user: User, applicationId: string) {
    await this.assertAccess(user, applicationId);
    await this.readRepo.query(
      `INSERT INTO application_thread_reads (application_id, user_id, "lastReadAt")
       VALUES ($1, $2, now())
       ON CONFLICT (application_id, user_id)
       DO UPDATE SET "lastReadAt" = now()`,
      [applicationId, user.id],
    );
    return { success: true };
  }

  // Число непрочитанных сообщений по заявкам: { [applicationId]: count }.
  // Участник — по своим заявкам, без внутренних заметок.
  // Персонал — по всем заявкам, только обычные сообщения (без системных о статусе).
  async unreadMap(user: User): Promise<UnreadMap> {
    const staff = this.isStaff(user);

    const rows: { applicationId: string; count: number }[] =
      await this.msgRepo.query(
        `SELECT m.application_id AS "applicationId", COUNT(*)::int AS "count"
           FROM application_messages m
           JOIN applications a ON a.id = m.application_id
           LEFT JOIN application_thread_reads r
                  ON r.application_id = m.application_id AND r.user_id = $1
          WHERE m."deletedAt" IS NULL
            AND m.author_id IS DISTINCT FROM $1
            AND (r."lastReadAt" IS NULL OR m."createdAt" > r."lastReadAt")
            AND ${
              staff
                ? `m.kind = 'message'`
                : `m."isInternal" = false AND a.user_id = $1`
            }
          GROUP BY m.application_id`,
        [user.id],
      );

    const map: UnreadMap = {};
    for (const r of rows) map[r.applicationId] = r.count;
    return map;
  }

  // Мягкое удаление (admin и moderator, права проверяются в контроллере)
  async remove(id: string) {
    const msg = await this.msgRepo.findOne({
      where: { id },
      select: { id: true, deletedAt: true },
    });
    if (!msg || msg.deletedAt)
      throw new NotFoundException("Сообщение не найдено");
    await this.msgRepo.update(id, { deletedAt: new Date() });
    return { success: true };
  }

  // Системное сообщение о смене статуса (используется в ApplicationsService, шаг B3)
  async postSystemStatusMessage(
    applicationId: string,
    authorId: string,
    text: string,
  ) {
    const author = await this.userRepo.findOne({
      where: { id: authorId },
      select: { id: true, role: true },
    });
    await this.msgRepo.save(
      this.msgRepo.create({
        applicationId,
        authorId,
        authorRole: author?.role ?? Role.ADMIN,
        kind: MessageKind.STATUS,
        text: text.slice(0, MESSAGE_MAX_LENGTH),
        isInternal: false,
      }),
    );
  }
}
