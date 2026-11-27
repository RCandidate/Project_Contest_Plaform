import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { FinalScore } from "./entities/final-score.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { ApplicationStatus } from "../common/enums/application-status.enum";
import { Role } from "../common/enums/role.enum";
import {
  FINAL_CRITERIA_BY_CODE,
  FINAL_MAX_TOTAL,
  ScoreCriterion,
  criteriaForNomination,
  scaleForNomination,
} from "./score-criteria";
import { isSupervisorConflict, supervisorText } from "./conflict";

// Статусы, при которых оценку очного этапа можно ставить и менять
// (правка после присвоения места разрешена)
export const FINAL_SCORE_STATUSES = [
  ApplicationStatus.ADMITTED,
  ApplicationStatus.WINNER,
  ApplicationStatus.RUNNER_UP,
];

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === "23505" || e?.driverError?.code === "23505";
}

@Injectable()
export class FinalScoresService {
  constructor(
    @InjectRepository(FinalScore)
    private finalRepo: Repository<FinalScore>,
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Заявка без черновиков; существование черновика не раскрываем
  private async loadApplication(applicationId: string) {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId, status: Not(ApplicationStatus.DRAFT) },
      relations: { nomination: true },
    });
    if (!app)
      throw new NotFoundException("Заявка не найдена или ещё не подана");
    return app;
  }

  private async loadExpert(expertId: string) {
    const user = await this.userRepo.findOne({
      where: { id: expertId },
      select: { id: true, firstName: true, lastName: true, role: true },
    });
    if (!user || user.role !== Role.EXPERT)
      throw new NotFoundException("Эксперт не найден");
    return user;
  }

  private hasConflict(app: Application, expert: User): boolean {
    return isSupervisorConflict(
      expert.lastName,
      supervisorText(app.supervisor),
    );
  }

  private toView(record: FinalScore, criteria: ScoreCriterion[]) {
    const items: Record<string, number> = {};
    for (const c of criteria) {
      const v = record.items?.[c.code];
      if (typeof v === "number") items[c.code] = v;
    }
    return {
      applicationId: record.applicationId,
      expertId: record.expertId,
      items,
      filledCount: Object.keys(items).length,
      criteriaCount: criteria.length,
      editedByAdmin:
        !!record.editedByUserId && record.editedByUserId !== record.expertId,
      updatedAt: record.updatedAt,
    };
  }

  async getFormData(applicationId: string, expertId: string) {
    const app = await this.loadApplication(applicationId);
    const expert = await this.loadExpert(expertId);
    const criteria = criteriaForNomination(app.nomination);
    const conflict = this.hasConflict(app, expert);
    const record = await this.finalRepo.findOne({
      where: { applicationId: app.id, expertId: expert.id },
    });
    return {
      applicationId: app.id,
      projectTitle: app.projectTitle,
      status: app.status,
      canScore: FINAL_SCORE_STATUSES.includes(app.status) && !conflict,
      nominationScale: scaleForNomination(app.nomination),
      conflict,
      criteria: criteria.map((c) => ({
        code: c.code,
        scale: c.scale,
        title: c.title,
        maxPoints: c.maxPoints,
        order: c.order,
      })),
      score: record ? this.toView(record, criteria) : null,
    };
  }

  saveMine(expertId: string, applicationId: string, items: unknown) {
    return this.save(expertId, expertId, applicationId, items);
  }

  saveByAdmin(
    adminId: string,
    expertId: string,
    applicationId: string,
    items: unknown,
  ) {
    return this.save(expertId, adminId, applicationId, items);
  }

  private async save(
    expertId: string,
    actorId: string,
    applicationId: string,
    items: unknown,
  ) {
    const app = await this.loadApplication(applicationId);
    const expert = await this.loadExpert(expertId);

    if (!FINAL_SCORE_STATUSES.includes(app.status))
      throw new BadRequestException(
        "Оценивать можно только заявки со статусом «Допущена к очному этапу», «Победитель» или «Призёр»",
      );
    if (this.hasConflict(app, expert))
      throw new ForbiddenException(
        "Вы указаны руководителем этого проекта и не можете его оценивать",
      );

    const criteria = criteriaForNomination(app.nomination);
    const clean = this.validateItems(items, criteria);

    if (Object.keys(clean).length === 0) {
      await this.finalRepo.delete({ applicationId: app.id, expertId });
      return {
        applicationId: app.id,
        expertId,
        items: {},
        filledCount: 0,
        criteriaCount: criteria.length,
        editedByAdmin: false,
        updatedAt: null,
      };
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      const existing = await this.finalRepo.findOne({
        where: { applicationId: app.id, expertId },
      });
      const record = existing
        ? Object.assign(existing, { items: clean, editedByUserId: actorId })
        : this.finalRepo.create({
            applicationId: app.id,
            expertId,
            items: clean,
            editedByUserId: actorId,
          });
      try {
        return this.toView(await this.finalRepo.save(record), criteria);
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
      }
    }
    throw new ConflictException(
      "Не удалось сохранить оценку, повторите попытку",
    );
  }

  private validateItems(
    items: unknown,
    criteria: ScoreCriterion[],
  ): Record<string, number> {
    if (!items || typeof items !== "object" || Array.isArray(items))
      throw new BadRequestException(
        "Баллы должны быть объектом вида { код критерия: баллы }",
      );
    const allowed = new Map(criteria.map((c) => [c.code, c]));
    const clean: Record<string, number> = {};
    for (const [code, raw] of Object.entries(items)) {
      const criterion = allowed.get(code);
      if (!criterion) {
        const known = FINAL_CRITERIA_BY_CODE[code];
        throw new BadRequestException(
          known
            ? `Критерий «${known.title}» не относится к шкале этого проекта`
            : `Неизвестный критерий: ${code}`,
        );
      }
      if (raw === null || raw === undefined) continue;
      if (typeof raw !== "number" || !Number.isInteger(raw))
        throw new BadRequestException(
          `«${criterion.title}»: баллы должны быть целым числом`,
        );
      if (raw < 0 || raw > criterion.maxPoints)
        throw new BadRequestException(
          `«${criterion.title}»: баллы от 0 до ${criterion.maxPoints}`,
        );
      clean[code] = raw;
    }
    const sum = Object.values(clean).reduce((a, b) => a + b, 0);
    if (sum > FINAL_MAX_TOTAL)
      throw new BadRequestException(
        `Сумма баллов по всем критериям не может быть больше ${FINAL_MAX_TOTAL}`,
      );
    return clean;
  }
}
