import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { Score, ScoreMatrix } from "@/types";

export type MatrixExpert = ScoreMatrix["experts"][number];
export type MatrixProject = ScoreMatrix["projects"][number];

interface Props {
  experts: MatrixExpert[];
  projects: MatrixProject[];
  scores: Score[];
  onCellClick: (
    project: MatrixProject,
    expert: MatrixExpert,
    score: Score,
  ) => void;
}

const cellKey = (applicationId: string, expertId: string) =>
  `${applicationId}:${expertId}`;

export function ScoreMatrixTable({
  experts,
  projects,
  scores,
  onCellClick,
}: Props) {
  const scoreMap = useMemo(() => {
    const map = new Map<string, Score>();
    for (const s of scores) map.set(cellKey(s.applicationId, s.expertId), s);
    return map;
  }, [scores]);

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500">
            <th className="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-100 px-4 py-3 font-medium min-w-[220px]">
              Проект
            </th>
            <th className="border-b border-gray-100 px-4 py-3 font-medium min-w-[160px]">
              Номинация
            </th>
            {experts.map((e) => (
              <th
                key={e.id}
                className="border-b border-gray-100 px-4 py-3 font-medium text-center whitespace-nowrap"
              >
                {e.lastName} {e.firstName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="group">
              <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-b border-r border-gray-100 px-4 py-3 font-medium text-gray-800">
                {p.projectTitle}
              </td>
              <td className="border-b border-gray-100 px-4 py-3 text-gray-600">
                {p.nomination ?? "—"}
              </td>
              {experts.map((e) => {
                const score = scoreMap.get(cellKey(p.id, e.id));
                return (
                  <td
                    key={e.id}
                    className="border-b border-gray-100 px-4 py-3 text-center whitespace-nowrap"
                  >
                    {score ? (
                      <button
                        type="button"
                        onClick={() => onCellClick(p, e, score)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-primary-900 hover:bg-primary-50 transition-colors"
                      >
                        {score.points}%
                        {(score.qualities.length > 0 ||
                          score.specialOpinion) && (
                          <MessageSquare
                            size={12}
                            className="text-gray-400"
                            aria-label="Есть качества или особое мнение"
                          />
                        )}
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
