import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Score } from "./entities/score.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { ApplicationStatus } from "../common/enums/application-status.enum";
import { Role } from "../common/enums/role.enum";
import { SCORE_QUALITIES } from "./score-qualities";
import { UpsertScoreDto } from "./dto/upsert-score.dto";

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === "23505" || e?.driverError?.code === "23505";
}

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score) private scoreRepo: Repository<Score>,
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  getQualities() {
    return SCORE_QUALITIES;
  }

  private toView(score: Score) {
    return {
      applicationId: score.applicationId,
      expertId: score.expertId,
      points: score.points,
      qualities: score.qualities ?? [],
      specialOpinion: score.specialOpinion ?? null,
    };
  }

  // Создать или обновить мою оценку заявки: одна оценка на пару (заявка, эксперт)
  async upsertMine(expertId: string, dto: UpsertScoreDto) {
    // черновики оценивать нельзя; существование черновика не раскрываем
    const app = await this.applicationRepo.findOne({
      where: { id: dto.applicationId, status: Not(ApplicationStatus.DRAFT) },
      select: { id: true },
    });
    if (!app)
      throw new NotFoundException("Заявка не найдена или ещё не подана");

    // пустые качества и пустое мнение сохраняем как null
    const values = {
      points: dto.points,
      qualities: dto.qualities?.length ? dto.qualities : null,
      specialOpinion: dto.specialOpinion?.trim() || null,
    };

    // два одновременных запроса: проигравший повторяет попытку как обновление
    for (let attempt = 0; attempt < 2; attempt++) {
      const existing = await this.scoreRepo.findOne({
        where: { applicationId: app.id, expertId },
      });
      const score = existing
        ? Object.assign(existing, values)
        : this.scoreRepo.create({ applicationId: app.id, expertId, ...values });
      try {
        return this.toView(await this.scoreRepo.save(score));
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
      }
    }
    throw new ConflictException(
      "Не удалось сохранить оценку, повторите попытку",
    );
  }

  async findMine(expertId: string) {
    const scores = await this.scoreRepo.find({
      where: { expertId },
      order: { updatedAt: "DESC" },
    });
    return scores.map((s) => this.toView(s));
  }

  // Сводная таблица (только admin): эксперты, проекты и оценки плоскими списками
  async getMatrix(contestId?: string) {
    const experts = await this.userRepo.find({
      where: { role: Role.EXPERT },
      select: { id: true, firstName: true, lastName: true },
      order: { lastName: "ASC", firstName: "ASC" },
    });

    const projectsQb = this.applicationRepo
      .createQueryBuilder("a")
      .leftJoin("a.nomination", "n")
      .select(["a.id", "a.projectTitle", "n.name"])
      .where("a.status != :draft", { draft: ApplicationStatus.DRAFT });
    if (contestId)
      projectsQb.andWhere("a.contestId = :contestId", { contestId });
    const applications = await projectsQb
      .orderBy("a.projectTitle", "ASC")
      .getMany();

    const scoresQb = this.scoreRepo
      .createQueryBuilder("s")
      .innerJoin("s.application", "a")
      .innerJoin("s.expert", "e")
      .where("a.status != :draft", { draft: ApplicationStatus.DRAFT })
      .andWhere("e.role = :role", { role: Role.EXPERT });
    if (contestId) scoresQb.andWhere("a.contestId = :contestId", { contestId });
    const scores = await scoresQb.getMany();

    return {
      experts,
      projects: applications.map((a) => ({
        id: a.id,
        projectTitle: a.projectTitle,
        nomination: a.nomination?.name ?? null,
      })),
      scores: scores.map((s) => this.toView(s)),
    };
  }
}
