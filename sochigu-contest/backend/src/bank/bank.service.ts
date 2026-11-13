import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { BankTopic } from "./entities/bank-topic.entity";
import { BankOffer } from "./entities/bank-offer.entity";
import { BankComment } from "./entities/bank-comment.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { ApplicationStatus } from "../common/enums/application-status.enum";
import { BankTopicStatus, OfferStatus } from "../common/enums/bank.enum";
import { Role } from "../common/enums/role.enum";
import { GetBankProjectsDto } from "./dto/get-bank-projects.dto";
import { CreateTopicDto } from "./dto/create-topic.dto";
import { UpdateTopicDto } from "./dto/update-topic.dto";
import { UpdateTopicStatusDto } from "./dto/update-topic-status.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferStatusDto } from "./dto/update-offer-status.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";

// Заявки с этими статусами попадают в «Банк работ»
const BANK_STATUSES = [
  ApplicationStatus.ADMITTED,
  ApplicationStatus.WINNER,
  ApplicationStatus.RUNNER_UP,
];

const SUMMARY_LENGTH = 300;

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    @InjectRepository(BankTopic) private topicRepo: Repository<BankTopic>,
    @InjectRepository(BankOffer) private offerRepo: Repository<BankOffer>,
    @InjectRepository(BankComment) private commentRepo: Repository<BankComment>,
  ) {}

  // ─── Проекты (из заявок) ────────────────────────────────────────────────────

  private projectQuery() {
    return this.applicationRepo
      .createQueryBuilder("a")
      .leftJoin("a.nomination", "n")
      .leftJoin("a.contest", "c")
      .select([
        "a.id",
        "a.projectTitle",
        "a.projectDescription",
        "a.keywords",
        "a.teamMembers",
        "a.status",
        "a.createdAt",
        "n.id",
        "n.name",
        "n.shortName",
        "c.id",
        "c.name",
      ])
      .where("a.status IN (:...statuses)", { statuses: BANK_STATUSES });
  }

  // Явно собранный объект: без пользователя, email, телефонов, файлов, имён участников
  private toProject(a: Application, full = false) {
    const description = a.projectDescription ?? "";
    const summary =
      description.length > SUMMARY_LENGTH
        ? `${description.slice(0, SUMMARY_LENGTH - 1).trimEnd()}…`
        : description;
    const project = {
      id: a.id,
      title: a.projectTitle,
      summary,
      keywords: a.keywords ?? [],
      nomination: a.nomination
        ? {
            id: a.nomination.id,
            name: a.nomination.name,
            shortName: a.nomination.shortName,
          }
        : null,
      contest: a.contest ? { id: a.contest.id, name: a.contest.name } : null,
      status: a.status,
      teamSize: a.teamMembers?.length ?? 0,
      createdAt: a.createdAt,
    };
    return full ? { ...project, description } : project;
  }

  async findProjects(dto: GetBankProjectsDto) {
    const { page = 1, limit = 20, nominationId, contestId, search } = dto;
    const qb = this.projectQuery();

    if (nominationId)
      qb.andWhere("a.nominationId = :nid", { nid: nominationId });
    if (contestId) qb.andWhere("a.contestId = :cid", { cid: contestId });
    if (search) {
      const escaped = search.replace(/[\\%_]/g, "\\$&");
      qb.andWhere(
        "(a.projectTitle ILIKE :s OR a.projectDescription ILIKE :s)",
        {
          s: `%${escaped}%`,
        },
      );
    }

    const [rows, total] = await qb
      .orderBy("a.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows.map((a) => this.toProject(a)), total, page, limit };
  }

  async findProject(id: string) {
    const app = await this.projectQuery()
      .andWhere("a.id = :id", { id })
      .getOne();
    if (!app) throw new NotFoundException("Проект не найден");
    return this.toProject(app, true);
  }

  // ─── Темы ──────────────────────────────────────────────────────────────────

  findPublishedTopics() {
    return this.topicRepo.find({
      where: { status: In([BankTopicStatus.PUBLISHED, BankTopicStatus.TAKEN]) },
      select: {
        id: true,
        title: true,
        description: true,
        organization: true,
        status: true,
        createdAt: true,
      },
      order: { createdAt: "DESC" },
      take: 200,
    });
  }

  createTopic(user: User, dto: CreateTopicDto) {
    const topic = this.topicRepo.create({
      ...dto,
      authorId: user.id,
      status:
        user.role === Role.EMPLOYER
          ? BankTopicStatus.PENDING
          : BankTopicStatus.PUBLISHED,
    });
    return this.topicRepo.save(topic);
  }

  findMyTopics(userId: string) {
    return this.topicRepo.find({
      where: { authorId: userId },
      order: { createdAt: "DESC" },
    });
  }

  findAllTopics(status?: BankTopicStatus) {
    const qb = this.topicRepo
      .createQueryBuilder("t")
      .leftJoin("t.author", "u")
      .addSelect(["u.id", "u.firstName", "u.lastName", "u.email"])
      .orderBy("t.createdAt", "DESC");
    if (status) qb.andWhere("t.status = :status", { status });
    return qb.getMany();
  }

  private async findTopic(id: string) {
    const topic = await this.topicRepo.findOne({ where: { id } });
    if (!topic) throw new NotFoundException("Тема не найдена");
    return topic;
  }

  async updateTopic(id: string, dto: UpdateTopicDto) {
    const topic = await this.findTopic(id);
    Object.assign(topic, dto);
    return this.topicRepo.save(topic);
  }

  async updateTopicStatus(id: string, dto: UpdateTopicStatusDto) {
    if (dto.status === BankTopicStatus.REJECTED && !dto.moderationComment) {
      throw new BadRequestException("Укажите причину отклонения");
    }
    const topic = await this.findTopic(id);
    topic.status = dto.status;
    topic.moderationComment = dto.moderationComment ?? null;
    return this.topicRepo.save(topic);
  }

  async removeTopic(id: string) {
    const result = await this.topicRepo.delete(id);
    if (!result.affected) throw new NotFoundException("Тема не найдена");
    return { success: true };
  }

  // ─── Предложения ───────────────────────────────────────────────────────────

  private isStaff(user: User) {
    return user.role === Role.ADMIN || user.role === Role.MODERATOR;
  }

  // Контакты работодателя автор проекта видит только после принятия предложения,
  // admin и moderator — всегда. Работодатель свои данные получает в findMyOffers.
  private toOfferView(offer: BankOffer, staff: boolean) {
    const contactsVisible = staff || offer.status === OfferStatus.ACCEPTED;
    return {
      id: offer.id,
      applicationId: offer.applicationId,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      contactEmail: contactsVisible ? offer.contactEmail : null,
      contactPhone: contactsVisible ? offer.contactPhone : null,
      application: offer.application
        ? {
            id: offer.application.id,
            projectTitle: offer.application.projectTitle,
          }
        : undefined,
      employer: offer.employer
        ? {
            id: offer.employer.id,
            firstName: offer.employer.firstName,
            lastName: offer.employer.lastName,
            ...(staff ? { email: offer.employer.email } : {}),
          }
        : undefined,
    };
  }

  async createOffer(
    employer: User,
    applicationId: string,
    dto: CreateOfferDto,
  ) {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId, status: In(BANK_STATUSES) },
      select: { id: true },
    });
    if (!app) throw new NotFoundException("Проект не найден в банке работ");

    const offer = await this.offerRepo.save(
      this.offerRepo.create({
        applicationId: app.id,
        employerId: employer.id,
        message: dto.message,
        // если email не указан, используем email аккаунта работодателя
        contactEmail: dto.contactEmail ?? employer.email,
        contactPhone: dto.contactPhone,
      }),
    );
    return {
      id: offer.id,
      applicationId: offer.applicationId,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
    };
  }

  // Работодатель видит свои предложения и свои контакты
  findMyOffers(employerId: string) {
    return this.offerRepo
      .createQueryBuilder("o")
      .leftJoin("o.application", "a")
      .addSelect(["a.id", "a.projectTitle"])
      .where("o.employerId = :employerId", { employerId })
      .orderBy("o.createdAt", "DESC")
      .getMany();
  }

  // Предложения к заявкам, автором которых является участник
  async findOffersForMe(userId: string) {
    const offers = await this.offerRepo
      .createQueryBuilder("o")
      .innerJoin("o.application", "a")
      .addSelect(["a.id", "a.projectTitle"])
      .leftJoin("o.employer", "e")
      .addSelect(["e.id", "e.firstName", "e.lastName"])
      .where("a.userId = :userId", { userId })
      .orderBy("o.createdAt", "DESC")
      .getMany();
    return offers.map((o) => this.toOfferView(o, false));
  }

  // Предложения к одному проекту: автор заявки (свои) или admin и moderator (любые)
  async findProjectOffers(user: User, applicationId: string) {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId },
      select: { id: true, userId: true },
    });
    if (!app) throw new NotFoundException("Проект не найден");

    const staff = this.isStaff(user);
    if (!staff && app.userId !== user.id) {
      throw new ForbiddenException("Нет доступа к предложениям этого проекта");
    }

    const qb = this.offerRepo
      .createQueryBuilder("o")
      .leftJoin("o.employer", "e")
      .addSelect(["e.id", "e.firstName", "e.lastName"])
      .where("o.applicationId = :applicationId", { applicationId })
      .orderBy("o.createdAt", "DESC");
    if (staff) qb.addSelect("e.email");

    const offers = await qb.getMany();
    return offers.map((o) => this.toOfferView(o, staff));
  }

  async findOffers(status?: OfferStatus) {
    const qb = this.offerRepo
      .createQueryBuilder("o")
      .leftJoin("o.application", "a")
      .addSelect(["a.id", "a.projectTitle"])
      .leftJoin("o.employer", "e")
      .addSelect(["e.id", "e.firstName", "e.lastName", "e.email"])
      .orderBy("o.createdAt", "DESC");
    if (status) qb.andWhere("o.status = :status", { status });
    const offers = await qb.getMany();
    return offers.map((o) => this.toOfferView(o, true));
  }

  // Статус меняет автор проекта (только по своим предложениям) или admin и moderator
  async updateOfferStatus(user: User, id: string, dto: UpdateOfferStatusDto) {
    const offer = await this.offerRepo
      .createQueryBuilder("o")
      .leftJoin("o.application", "a")
      .addSelect(["a.id", "a.userId", "a.projectTitle"])
      .where("o.id = :id", { id })
      .getOne();
    if (!offer) throw new NotFoundException("Предложение не найдено");

    const staff = this.isStaff(user);
    if (!staff) {
      if (offer.application?.userId !== user.id) {
        throw new ForbiddenException("Нет доступа к этому предложению");
      }
      if (dto.status === OfferStatus.NEW) {
        throw new BadRequestException(
          "Можно отметить предложение просмотренным, принять или отклонить",
        );
      }
    }

    offer.status = dto.status;
    const saved = await this.offerRepo.save(offer);
    return this.toOfferView(saved, staff);
  }
  // ─── Комментарии ───────────────────────────────────────────────────────────

  // Обсуждение проекта видят работодатели, автор заявки, admin и moderator.
  // Писать можно только к проектам из банка.
  private async getCommentableApplication(
    user: User,
    applicationId: string,
    forWrite: boolean,
  ) {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId },
      select: { id: true, userId: true, status: true },
    });
    if (!app) throw new NotFoundException("Проект не найден");

    const inBank = BANK_STATUSES.includes(app.status);
    if (user.role === Role.EMPLOYER) {
      if (!inBank)
        throw new NotFoundException("Проект не найден в банке работ");
    } else if (!this.isStaff(user) && app.userId !== user.id) {
      throw new ForbiddenException("Нет доступа к обсуждению этого проекта");
    }
    if (forWrite && !inBank) {
      throw new BadRequestException(
        "Комментировать можно только проекты из банка работ",
      );
    }
    return app;
  }

  private toCommentView(comment: BankComment, ownerId: string) {
    const author = comment.author;
    let authorKind: "employer" | "owner" | "staff" | "unknown" = "unknown";
    if (author) {
      if (author.role === Role.ADMIN || author.role === Role.MODERATOR)
        authorKind = "staff";
      else if (author.role === Role.EMPLOYER) authorKind = "employer";
      else if (author.id === ownerId) authorKind = "owner";
    }
    return {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      author: author
        ? {
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,
          }
        : null,
      authorKind,
    };
  }

  async findComments(user: User, applicationId: string) {
    const app = await this.getCommentableApplication(
      user,
      applicationId,
      false,
    );
    const rows = await this.commentRepo
      .createQueryBuilder("c")
      .leftJoin("c.author", "u")
      .addSelect(["u.id", "u.firstName", "u.lastName", "u.role"])
      .where("c.applicationId = :applicationId", { applicationId })
      .orderBy("c.createdAt", "ASC")
      .take(500)
      .getMany();
    return rows.map((c) => this.toCommentView(c, app.userId));
  }

  async createComment(
    user: User,
    applicationId: string,
    dto: CreateCommentDto,
  ) {
    const app = await this.getCommentableApplication(user, applicationId, true);
    const saved = await this.commentRepo.save(
      this.commentRepo.create({
        applicationId,
        authorId: user.id,
        text: dto.text,
      }),
    );
    saved.author = user;
    return this.toCommentView(saved, app.userId);
  }

  async removeComment(id: string) {
    const result = await this.commentRepo.delete(id);
    if (!result.affected) throw new NotFoundException("Комментарий не найден");
    return { success: true };
  }
}
