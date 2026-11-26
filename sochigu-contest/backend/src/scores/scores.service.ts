import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import * as ExcelJS from "exceljs";
import { Score } from "./entities/score.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { ApplicationStatus } from "../common/enums/application-status.enum";
import { Role } from "../common/enums/role.enum";
import { SCORE_QUALITIES } from "./score-qualities";
import { UpsertScoreDto } from "./dto/upsert-score.dto";

// Статусы заявок, которые находятся на очном этапе или уже прошли его
const STAGE2_STATUSES = [
  ApplicationStatus.ADMITTED,
  ApplicationStatus.WINNER,
  ApplicationStatus.RUNNER_UP,
];

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
  async getMatrix(contestId?: string, stage: 1 | 2 = 1) {
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
    if (stage === 2)
      projectsQb.andWhere("a.status IN (:...stage2Statuses)", {
        stage2Statuses: STAGE2_STATUSES,
      });
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
      // оценок второго этапа в системе пока нет — отдаём пустой список
      scores: stage === 2 ? [] : scores.map((s) => this.toView(s)),
    };
  }

  // Экспорт сводной таблицы в Excel (только admin): лист «Оценки» — матрица,
  // лист «Подробно» — по строке на каждую оценку с качествами и особым мнением
  async exportMatrixToExcel(
    contestId?: string,
    stage: 1 | 2 = 1,
  ): Promise<ArrayBuffer> {
    const { experts, projects, scores } = await this.getMatrix(
      contestId,
      stage,
    );
    const labels = new Map(SCORE_QUALITIES.map((q) => [q.code, q.label]));
    const scoreMap = new Map(
      scores.map((s) => [`${s.applicationId}:${s.expertId}`, s]),
    );
    const expertName = (e: { lastName: string; firstName: string }) =>
      `${e.lastName} ${e.firstName}`.trim();

    const workbook = new ExcelJS.Workbook();

    // --- Лист 1: матрица
    const sheet = workbook.addWorksheet("Оценки", {
      views: [{ state: "frozen", xSplit: 3, ySplit: 1 }],
    });
    sheet.columns = [
      { header: "№", key: "num", width: 5 },
      { header: "Проект", key: "title", width: 40 },
      { header: "Номинация", key: "nomination", width: 24 },
      ...experts.map((e) => ({
        header: expertName(e),
        key: `e_${e.id}`,
        width: 16,
      })),
      { header: "Оценок", key: "count", width: 10 },
      { header: "Сумма баллов", key: "sum", width: 14 },
      // { header: "Средний балл", key: "avg", width: 14 },
    ];

    projects.forEach((p, i) => {
      const row: Record<string, string | number | null> = {
        num: i + 1,
        title: p.projectTitle,
        nomination: p.nomination ?? "",
      };
      const points: number[] = [];
      for (const e of experts) {
        const s = scoreMap.get(`${p.id}:${e.id}`);
        row[`e_${e.id}`] = s ? s.points : null;
        if (s) points.push(s.points);
      }
      row.count = points.length;
      row.sum = points.length ? points.reduce((a, b) => a + b, 0) : null;
      row.avg = points.length
        ? Math.round(
            (points.reduce((a, b) => a + b, 0) / points.length) * 100,
          ) / 100
        : null;
      sheet.addRow(row);
    });

    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    header.height = 45;
    header.eachCell((c) => {
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE5E7EB" },
      };
    });
    sheet.eachRow((r, n) => {
      if (n === 1) return;
      r.eachCell((c, col) => {
        if (col > 3) c.alignment = { horizontal: "center" };
      });
    });
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount },
    };

    // --- Лист 2: подробно
    const detail = workbook.addWorksheet("Подробно", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    detail.columns = [
      { header: "Проект", key: "title", width: 40 },
      { header: "Номинация", key: "nomination", width: 24 },
      { header: "Эксперт", key: "expert", width: 28 },
      { header: "Баллы", key: "points", width: 10 },
      { header: "Качества", key: "qualities", width: 45 },
      { header: "Особое мнение", key: "opinion", width: 40 },
    ];
    const projectMap = new Map(projects.map((p) => [p.id, p]));
    const expertMap = new Map(experts.map((e) => [e.id, e]));
    for (const p of projects) {
      for (const e of experts) {
        const s = scoreMap.get(`${p.id}:${e.id}`);
        if (!s) continue;
        detail.addRow({
          title: projectMap.get(p.id)?.projectTitle,
          nomination: p.nomination ?? "",
          expert: expertName(expertMap.get(e.id)!),
          points: s.points,
          qualities: s.qualities.map((c) => labels.get(c) ?? c).join(", "),
          opinion: s.specialOpinion ?? "",
        });
      }
    }
    detail.getRow(1).font = { bold: true };
    detail.getRow(1).eachCell((c) => {
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE5E7EB" },
      };
    });
    detail.eachRow((r) => {
      r.alignment = { vertical: "top", wrapText: true };
    });
    detail.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: detail.columnCount },
    };

    return workbook.xlsx.writeBuffer();
  }
}
