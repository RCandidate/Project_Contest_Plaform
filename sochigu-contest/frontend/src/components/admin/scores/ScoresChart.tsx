import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Score } from "@/types";
import {
  MatrixExpert,
  MatrixProject,
} from "@/components/admin/scores/ScoreMatrixTable";

interface Props {
  experts: MatrixExpert[];
  projects: MatrixProject[];
  scores: Score[];
}

const ALL = "all";
const GROUP_LIMIT = 6; // при большем числе экспертов по умолчанию показываем одного

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#dc2626",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#65a30d",
];

const fullName = (e: MatrixExpert) => `${e.lastName} ${e.firstName}`;
const shorten = (s: string, max = 28) =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;
const cellKey = (applicationId: string, expertId: string) =>
  `${applicationId}:${expertId}`;

export function ScoreChart({ experts, projects, scores }: Props) {
  const scoreMap = useMemo(() => {
    const map = new Map<string, Score>();
    for (const s of scores) map.set(cellKey(s.applicationId, s.expertId), s);
    return map;
  }, [scores]);

  const [selection, setSelection] = useState<string>(() => {
    if (experts.length <= GROUP_LIMIT) return ALL;
    const withScores = experts.find((e) =>
      scores.some((s) => s.expertId === e.id),
    );
    return (withScores ?? experts[0])?.id ?? ALL;
  });

  // если после смены конкурса выбранного эксперта в списке нет, возвращаемся к «Все эксперты»
  const current =
    selection === ALL || experts.some((e) => e.id === selection)
      ? selection
      : ALL;
  const expert = experts.find((e) => e.id === current) ?? null;

  // Данные для одного эксперта: нет оценки — нет ключа points, столбец не рисуется
  const singleData = useMemo(() => {
    if (!expert) return [];
    return projects.map((p) => {
      const s = scoreMap.get(cellKey(p.id, expert.id));
      return {
        id: p.id,
        title: p.projectTitle,
        ...(s ? { points: s.points } : {}),
      };
    });
  }, [expert, projects, scoreMap]);

  // Данные для всех экспертов: ключ строки — id эксперта
  const groupData = useMemo(
    () =>
      projects.map((p) => {
        const row: Record<string, string | number> = {
          id: p.id,
          title: p.projectTitle,
        };
        for (const e of experts) {
          const s = scoreMap.get(cellKey(p.id, e.id));
          if (s) row[e.id] = s.points;
        }
        return row;
      }),
    [experts, projects, scoreMap],
  );

  const ratedCount = singleData.filter((r) => "points" in r).length;
  const height = expert
    ? Math.max(240, projects.length * 36 + 70)
    : Math.max(320, projects.length * (experts.length * 16 + 18) + 80);

  const tooltipFormatter = (value: any, name: any) => [`${value}%`, name];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Эксперт
          <select
            value={current}
            onChange={(e) => setSelection(e.target.value)}
            className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value={ALL}>Все эксперты</option>
            {experts.map((e) => (
              <option key={e.id} value={e.id}>
                {fullName(e)}
              </option>
            ))}
          </select>
        </label>
        {expert && (
          <span className="text-sm text-gray-500">
            Оценено {ratedCount} из {projects.length} проектов
          </span>
        )}
      </div>

      {expert && ratedCount === 0 ? (
        <div className="py-10 text-center text-gray-500">
          Этот эксперт пока не оценил ни одного проекта
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div style={{ height, minWidth: 520 }}>
            <ResponsiveContainer width="100%" height="100%">
              {expert ? (
                <BarChart
                  data={singleData}
                  layout="vertical"
                  margin={{ top: 8, right: 48, bottom: 8, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={190}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: string) => shorten(v)}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar
                    dataKey="points"
                    name={fullName(expert)}
                    fill={COLORS[0]}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  >
                    <LabelList
                      dataKey="points"
                      position="right"
                      formatter={(v: any) => `${v}%`}
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={groupData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={190}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: string) => shorten(v)}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Legend />
                  {experts.map((e, i) => (
                    <Bar
                      key={e.id}
                      dataKey={e.id}
                      name={fullName(e)}
                      fill={COLORS[i % COLORS.length]}
                      radius={[0, 3, 3, 0]}
                      barSize={12}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
