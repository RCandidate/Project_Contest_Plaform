import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import * as ExcelJS from "exceljs";
import { FinalScore } from "./entities/final-score.entity";
import { Score } from "./entities/score.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { ApplicationStatus } from "../common/enums/application-status.enum";
import { Role } from "../common/enums/role.enum";
import { SCORE_QUALITIES } from "./score-qualities";
import {
  FINAL_CRITERIA,
  FINAL_RATING_RULES,
  FINAL_SCORING_RULES,
  criteriaForNomination,
} from "./score-criteria";
import { expertFinalTotals, projectFinalTotal, rankRows } from "./final-totals";
import { isSupervisorConflict, supervisorText } from "./conflict";
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
    @InjectRepository(FinalScore)
    private finalScoreRepo: Repository<FinalScore>,
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
      .select(["a.id", "a.projectTitle", "a.place", "n.name"])
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
        place: a.place ?? null,
      })),
      // оценок второго этапа в системе пока нет — отдаём пустой список
      scores: stage === 2 ? [] : scores.map((s) => this.toView(s)),
    };
  }
  async getRating(contestId?: string) {
    const experts = await this.userRepo.find({
      where: { role: Role.EXPERT },
      select: { id: true, lastName: true },
    });
    const expertById = new Map(experts.map((e) => [e.id, e]));

    // те же проекты, что на вкладке «2 этап»
    const appsQb = this.applicationRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.nomination", "n")
      .where("a.status IN (:...stage2Statuses)", {
        stage2Statuses: STAGE2_STATUSES,
      });
    if (contestId) appsQb.andWhere("a.contestId = :contestId", { contestId });
    const applications = await appsQb.getMany();
    const ids = applications.map((a) => a.id);

    const finals = ids.length
      ? await this.finalScoreRepo.find({ where: { applicationId: In(ids) } })
      : [];
    const finalsByApp = new Map<string, FinalScore[]>();
    for (const f of finals) {
      const list = finalsByApp.get(f.applicationId) ?? [];
      list.push(f);
      finalsByApp.set(f.applicationId, list);
    }

    // баллы 1 этапа нужны, только если задан вес
    const stage1ByApp = new Map<string, number[]>();
    if (FINAL_RATING_RULES.stage1Weight > 0 && ids.length) {
      const stage1 = await this.scoreRepo.find({
        where: { applicationId: In(ids) },
      });
      for (const s of stage1) {
        const list = stage1ByApp.get(s.applicationId) ?? [];
        list.push(s.points);
        stage1ByApp.set(s.applicationId, list);
      }
    }

    const rows = applications.map((a) => {
      const expertTotals: number[] = [];
      for (const f of finalsByApp.get(a.id) ?? []) {
        const expert = expertById.get(f.expertId);
        // if (!expert || hasConflictOfInterest(expert.lastName, a.supervisor?.name))
        //   continue;
        const t = expertFinalTotals(f.items, a.nomination);
        if (t.filled > 0) expertTotals.push(t.total);
      }
      const base = projectFinalTotal(expertTotals);
      const points = stage1ByApp.get(a.id) ?? [];
      const stage1Average = points.length
        ? Math.round((points.reduce((x, y) => x + y, 0) / points.length) * 100) / 100
        : null;
      const total =
        base === null
          ? null
          : Math.round((base + FINAL_RATING_RULES.stage1Weight * (stage1Average ?? 0)) * 100) / 100;
      return {
        applicationId: a.id,
        projectTitle: a.projectTitle,
        nomination: a.nomination?.name ?? null,
        place: a.place ?? null,
        expertsCount: expertTotals.length,
        stage1Average,
        total,
      };
    });

    return { rows: rankRows(rows, FINAL_RATING_RULES.scope), rules: FINAL_RATING_RULES };
  }
  // Экспорт сводной таблицы в Excel (только admin): лист «Оценки» — матрица,
  // лист «Подробно» — по строке на каждую оценку с качествами и особым мнением
  async exportMatrixToExcel(
    contestId?: string,
    stage: 1 | 2 = 1,
  ): Promise<ArrayBuffer> {
    if (stage === 2) return this.exportFinalToExcel(contestId);

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

private async exportFinalToExcel(contestId?: string): Promise<ArrayBuffer> {
    const experts = await this.userRepo.find({
      where: { role: Role.EXPERT },
      select: { id: true, firstName: true, lastName: true },
      order: { lastName: "ASC", firstName: "ASC" },
    });

    // те же заявки, что показывает вкладка «2 этап»
    const appsQb = this.applicationRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.nomination", "n")
      .where("a.status IN (:...stage2Statuses)", {
        stage2Statuses: STAGE2_STATUSES,
      });
    if (contestId) appsQb.andWhere("a.contestId = :contestId", { contestId });
    const applications = await appsQb
      .orderBy("a.projectTitle", "ASC")
      .getMany();

    const finals = applications.length
      ? await this.finalScoreRepo.find({
          where: { applicationId: In(applications.map((a) => a.id)) },
        })
      : [];
    const finalMap = new Map(
      finals.map((f) => [`${f.applicationId}:${f.expertId}`, f]),
    );
    const expertName = (e: { lastName: string; firstName: string }) =>
      `${e.lastName} ${e.firstName}`.trim();
    const grey = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } } as const;
    const yellow = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } } as const;
    const styleHeader = (ws: ExcelJS.Worksheet, height: number) => {
      const h = ws.getRow(1);
      h.font = { bold: true };
      h.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      h.height = height;
      h.eachCell((c) => {
        c.fill = grey;
      });
      ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: ws.columnCount },
      };
    };

    const workbook = new ExcelJS.Workbook();

    // --- Лист 1: итоги (матрица «проект × эксперт»)
    const FIRST_EXPERT_COL = 5;
    const sheet = workbook.addWorksheet("Итоги", {
      views: [{ state: "frozen", xSplit: 4, ySplit: 1 }],
    });
    sheet.columns = [
      { header: "№", key: "num", width: 5 },
      { header: "Проект", key: "title", width: 40 },
      { header: "Номинация", key: "nomination", width: 24 },
      { header: "Место", key: "place", width: 8 },
      ...experts.map((e) => ({
        header: expertName(e),
        key: `e_${e.id}`,
        width: 16,
      })),
      { header: "Оценок", key: "count", width: 10 },
      { header: "Итог", key: "total", width: 12 },
    ];

    // --- Лист 2: подробно, по строке на каждого эксперта и проект
    const detail = workbook.addWorksheet("Подробно", {
      views: [{ state: "frozen", xSplit: 3, ySplit: 1 }],
    });
    detail.columns = [
      { header: "Проект", key: "title", width: 40 },
      { header: "Номинация", key: "nomination", width: 24 },
      { header: "Эксперт", key: "expert", width: 26 },
      ...FINAL_CRITERIA.map((c) => ({
        header: `${c.title} (из ${c.maxPoints})`,
        key: c.code,
        width: 22,
      })),
      { header: "Итог общей шкалы", key: "general", width: 14 },
      { header: "Итог шкалы номинации", key: "nominationTotal", width: 14 },
      { header: "Итог эксперта", key: "total", width: 14 },
      { header: "Заполнено критериев", key: "filled", width: 14 },
      { header: "Изменено админом", key: "edited", width: 14 },
    ];

    applications.forEach((a, i) => {
      const row: Record<string, string | number | null> = {
        num: i + 1,
        title: a.projectTitle,
        nomination: a.nomination?.name ?? "",
        place: a.place ?? "",
      };
      const expertTotals: number[] = [];
      const marks: { col: number; kind: "conflict" | "admin" | "incomplete"; note?: string }[] = [];
      const applicable = new Set(
        criteriaForNomination(a.nomination).map((c) => c.code),
      );

      experts.forEach((e, idx) => {
        const key = `e_${e.id}`;
        const col = FIRST_EXPERT_COL + idx;
        if (isSupervisorConflict(e.lastName, supervisorText(a.supervisor))) {
          row[key] = "конфликт";
          marks.push({ col, kind: "conflict" });
          return;
        }
        const f = finalMap.get(`${a.id}:${e.id}`);
        const t = f ? expertFinalTotals(f.items, a.nomination) : null;
        if (!f || !t || t.filled === 0) {
          row[key] = null;
          return;
        }
        row[key] = t.total;
        expertTotals.push(t.total);
        const byAdmin = !!f.editedByUserId && f.editedByUserId !== f.expertId;
        if (byAdmin) {
          marks.push({ col, kind: "admin", note: "Изменено администратором" });
        } else if (t.filled < t.of) {
          marks.push({ col, kind: "incomplete", note: `Заполнено ${t.filled} из ${t.of}` });
        }

        const detailRow: Record<string, string | number | null> = {
          title: a.projectTitle,
          nomination: a.nomination?.name ?? "",
          expert: expertName(e),
          general: t.general,
          nominationTotal: t.nomination,
          total: t.total,
          filled: `${t.filled} из ${t.of}`,
          edited: byAdmin ? "да" : "",
        };
        for (const c of FINAL_CRITERIA) {
          const v = f.items?.[c.code];
          detailRow[c.code] = applicable.has(c.code) && typeof v === "number" ? v : null;
        }
        detail.addRow(detailRow);
      });

      row.count = expertTotals.length;
      row.total = projectFinalTotal(expertTotals);
      const r = sheet.addRow(row);
      for (const m of marks) {
        const cell = r.getCell(m.col);
        if (m.kind === "conflict") {
          cell.font = { italic: true, color: { argb: "FF9CA3AF" } };
        } else if (m.kind === "admin") {
          cell.fill = yellow;
        } else {
          cell.font = { italic: true };
        }
        if (m.note) cell.note = m.note;
      }
    });

    styleHeader(sheet, 45);
    sheet.eachRow((r, n) => {
      if (n === 1) return;
      r.eachCell((c, col) => {
        if (col > 3) c.alignment = { horizontal: "center" };
      });
    });
    styleHeader(detail, 110);
    detail.eachRow((r, n) => {
      if (n > 1) r.alignment = { vertical: "top", horizontal: "center" };
    });

    // --- Лист 3: пояснение
    const rules = workbook.addWorksheet("Как считали");
    rules.columns = [
      { header: "Параметр", key: "k", width: 34 },
      { header: "Значение", key: "v", width: 90 },
    ];
    const scalesText = {
      sum: "сумма баллов общей шкалы и шкалы номинации (максимум 200)",
      average: "среднее двух шкал, считаются шкалы, где внесён хотя бы один балл (максимум 100)",
      general_only: "только общая шкала (максимум 100)",
    }[FINAL_SCORING_RULES.scalesCombine];
    const expertsText = {
      average: "среднее по экспертам, оценившим проект",
      sum: "сумма по экспертам, оценившим проект",
    }[FINAL_SCORING_RULES.expertsCombine];
    rules.addRows([
      { k: "Итог эксперта", v: scalesText },
      { k: "Итог проекта", v: expertsText },
      { k: "Неполная оценка", v: "считается по внесённым критериям; ячейка выделена курсивом, в примечании указано, сколько критериев заполнено" },
      { k: "Жёлтая ячейка", v: "оценку последним менял администратор" },
      { k: "«конфликт»", v: "эксперт указан руководителем проекта и не оценивает его (п. 5.5 Положения)" },
      { k: "Пустая ячейка", v: "эксперт проект не оценивал" },
      { k: "Место", v: "проставляется администратором вручную (1, 2 или 3)" },
    ]);
    styleHeader(rules, 24);
    rules.eachRow((r) => {
      r.alignment = { vertical: "top", wrapText: true };
    });

    return workbook.xlsx.writeBuffer();
  }
}
