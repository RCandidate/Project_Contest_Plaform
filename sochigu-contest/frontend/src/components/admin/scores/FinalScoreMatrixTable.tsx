import { useMemo, useState } from "react";
import { FinalMatrixCell, ScoreMatrix } from "@/types";
import { PlaceBadge } from "@/components/admin/scores/PlaceBadge";

export type FinalMatrixExpert = ScoreMatrix["experts"][number];
export type FinalMatrixProject = ScoreMatrix["projects"][number];

const SCALE_ORDER = ["general", "business", "practice"];
const SCALE_TITLES: Record<string, string> = {
  general: "Общие критерии",
  business: "Критерии бизнес-проектов",
  practice: "Критерии практико-ориентированных проектов",
};

const fmt = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
const cellKey = (applicationId: string, expertId: string) =>
  `${applicationId}:${expertId}`;

// Баллы эксперта по критериям, сгруппированные по направлениям
export function FinalBreakdown({
  project,
  cell,
}: {
  project: FinalMatrixProject;
  cell: FinalMatrixCell;
}) {
  const criteria = project.criteria ?? [];
  const groups = SCALE_ORDER.map((scale) => {
    const items = criteria.filter((c) => c.scale === scale);
    return {
      scale,
      items,
      sum: items.reduce((a, c) => a + (cell.items[c.code] ?? 0), 0),
      max: items.reduce((a, c) => a + c.maxPoints, 0),
    };
  }).filter((g) => g.items.some((c) => typeof cell.items[c.code] === "number"));

  return (
    <div className="space-y-3 text-xs">
      {groups.map((g) => (
        <div key={g.scale}>
          <div className="flex justify-between gap-4 font-semibold text-gray-800">
            <span>{SCALE_TITLES[g.scale] ?? g.scale}</span>
            <span className="whitespace-nowrap">
              {fmt(g.sum)} из {g.max}
            </span>
          </div>
          <ul className="mt-1 space-y-0.5">
            {g.items.map((c) => {
              const v = cell.items[c.code];
              return (
                <li
                  key={c.code}
                  className="flex justify-between gap-4 text-gray-600"
                >
                  <span>{c.title}</span>
                  <span className="whitespace-nowrap font-medium text-gray-800">
                    {typeof v === "number" ? v : "—"} / {c.maxPoints}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 font-semibold text-gray-900">
        <span>Итого</span>
        <span className="whitespace-nowrap">
          {cell.total != null ? fmt(cell.total) : "—"}
          {project.maxTotal != null ? ` из ${project.maxTotal}` : ""}
        </span>
      </div>
      {cell.editedByAdmin && (
        <p className="text-gray-500">Оценка изменена администратором</p>
      )}
    </div>
  );
}

interface Props {
  experts: FinalMatrixExpert[];
  projects: FinalMatrixProject[];
  cells: FinalMatrixCell[];
  conflicts: { applicationId: string; expertId: string }[];
  onCellClick: (
    project: FinalMatrixProject,
    expert: FinalMatrixExpert,
    cell: FinalMatrixCell,
  ) => void;
}

interface Tip {
  left: number;
  top?: number;
  bottom?: number;
  project: FinalMatrixProject;
  cell: FinalMatrixCell;
}

export function FinalScoreMatrixTable({
  experts,
  projects,
  cells,
  conflicts,
  onCellClick,
}: Props) {
  const [tip, setTip] = useState<Tip | null>(null);

  const cellMap = useMemo(
    () => new Map(cells.map((c) => [cellKey(c.applicationId, c.expertId), c])),
    [cells],
  );
  const conflictSet = useMemo(
    () => new Set(conflicts.map((c) => cellKey(c.applicationId, c.expertId))),
    [conflicts],
  );

  const showTip = (
    el: HTMLElement,
    project: FinalMatrixProject,
    cell: FinalMatrixCell,
  ) => {
    const r = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(r.left + r.width / 2, 190),
      window.innerWidth - 190,
    );
    // в нижней половине экрана подсказка раскрывается вверх
    if (r.bottom > window.innerHeight * 0.55)
      setTip({ left, bottom: window.innerHeight - r.top + 6, project, cell });
    else setTip({ left, top: r.bottom + 6, project, cell });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500">
            <th className="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-100 px-3 py-2 font-medium min-w-[180px]">
              Проект
            </th>
            <th className="border-b border-gray-100 px-3 py-2 font-medium min-w-[110px]">
              Номинация
            </th>
            {experts.map((e) => (
              <th
                key={e.id}
                className="border-b border-gray-100 px-1 py-2 font-medium text-center align-bottom"
              >
                <div className="mx-auto whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">
                  {e.lastName} {e.firstName}
                </div>
              </th>
            ))}
            <th className="border-b border-l border-gray-100 px-3 py-2 font-medium text-center whitespace-nowrap">
              Оценок
            </th>
            <th className="border-b border-gray-100 px-3 py-2 font-medium text-center whitespace-nowrap">
              Итог
              <div className="text-[10px] font-normal text-gray-400">
                сумма по экспертам
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="group">
              <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-b border-r border-gray-100 px-3 py-1.5 font-medium text-gray-800">
                <div className="flex max-w-[260px] items-center gap-1.5">
                  {p.place ? <PlaceBadge place={p.place} /> : null}
                  <span className="truncate" title={p.projectTitle}>
                    {p.projectTitle}
                  </span>
                </div>
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 text-gray-600">
                <div
                  className="max-w-[150px] truncate"
                  title={p.nomination ?? undefined}
                >
                  {p.nomination ?? "—"}
                </div>
              </td>
              {experts.map((e) => {
                const k = cellKey(p.id, e.id);
                const cell = cellMap.get(k);
                const conflict = conflictSet.has(k) || cell?.conflict;
                return (
                  <td
                    key={e.id}
                    className="border-b border-gray-100 px-1 py-1.5 text-center whitespace-nowrap"
                  >
                    {conflict ? (
                      <span
                        className="italic text-gray-400"
                        title="Эксперт указан руководителем проекта"
                      >
                        конфликт
                      </span>
                    ) : cell && cell.total != null ? (
                      <button
                        type="button"
                        onClick={() => onCellClick(p, e, cell)}
                        onMouseEnter={(ev) =>
                          showTip(ev.currentTarget, p, cell)
                        }
                        onMouseLeave={() => setTip(null)}
                        onFocus={(ev) => showTip(ev.currentTarget, p, cell)}
                        onBlur={() => setTip(null)}
                        className={`rounded px-1.5 py-0.5 font-semibold text-primary-900 hover:bg-primary-50 transition-colors ${
                          cell.editedByAdmin ? "bg-amber-100" : ""
                        }`}
                      >
                        {fmt(cell.total)}
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                );
              })}
              <td className="border-b border-l border-gray-100 px-3 py-1.5 text-center text-gray-600">
                {p.expertsCount ?? 0}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 text-center font-semibold text-gray-800 whitespace-nowrap">
                {p.total != null ? fmt(p.total) : "—"}
                {p.total != null && p.maxTotal != null && (
                  <span className="font-normal text-gray-400">
                    {" "}
                    / {p.maxTotal * (p.expertsCount ?? 0)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
        В ячейке сумма баллов эксперта по всем критериям (не больше 200).
        Наведите на ячейку, чтобы увидеть баллы по критериям, нажмите, чтобы
        открыть подробно. Жёлтая ячейка: оценку менял администратор.
      </p>

      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 w-[380px] max-w-[92vw] -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          style={{ left: tip.left, top: tip.top, bottom: tip.bottom }}
        >
          <FinalBreakdown project={tip.project} cell={tip.cell} />
        </div>
      )}
    </div>
  );
}
