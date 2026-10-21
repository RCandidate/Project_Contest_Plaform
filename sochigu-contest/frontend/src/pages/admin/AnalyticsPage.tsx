import { useState, useEffect, useMemo } from "react";
import { analyticsApi } from "@/api/analytics";
import { contestsApi } from "@/api/contests";
import { contactsApi } from "@/api/contacts";
import { Contest } from "@/types";
import {
  AnalyticsSummary,
  AnalyticsByNomination,
  AnalyticsTimeline,
  AnalyticsGeography,
  AnalyticsByStatus,
  AnalyticsActivityItem,
} from "@/types";
import { Spinner } from "@/components/shared/Spinner";
import { mergeGeography } from "@/utils/cities";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Палитра ─────────────────────────────────────────────────────────────────
// Строго 5 цветов, всегда в этом порядке. Цикл начинается с [0].
const PALETTE = [
  "#536B78",
  "#B5D2CB",
  "#CDA2AB",
  "#AC7B84",
  "#6C464F",
] as const;

// Фонные и вспомогательные токены
const C_MAIN = "#6C464F"; // основной текст
const C_SUB = "#AC7B84"; // второстепенный текст
const C_TRACK = "rgba(181,210,203,0.30)"; // трек баров
const C_CARD = "rgba(181,210,203,0.15)"; // фон карточек
const C_BORDER = "rgba(83,107,120,0.20)"; // рамки карточек

// Вычисленные color-mix (dark 3-цвета воронки + их попарные миксы)
// color-mix(in srgb, #536B78 50%, #AC7B84 50%)
const MIX_1_3 = "#80737E";
// color-mix(in srgb, #AC7B84 50%, #6C464F 50%)
const MIX_3_5 = "#8C616A";
// color-mix(in srgb, #6C464F 50%, #536B78 50%)
const MIX_5_1 = "#605964";

// Текст на баре: тёмный (#6C464F) на светлых заливках, белый на тёмных
function textColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 140 ? C_MAIN : "#ffffff";
}

// ─── Статус-лейблы ────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  submitted: "На проверке",
  accepted: "Принято",
  rejected: "Отклонено",
  admitted: "К очному этапу",
  winner: "Победитель",
  runner_up: "Призёр",
};

// ─── Хелперы ─────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const normalized = /Z|[+-]\d{2}:\d{2}$/.test(iso)
    ? iso
    : iso.replace(" ", "T") + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "только что";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин назад`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} ч назад`;
  return new Date(normalized).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Moscow",
  });
}

function safe(a: number, b: number): number {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

// ─── Тултип ───────────────────────────────────────────────────────────────────
function Tip({
  children,
  content,
  color,
}: {
  children: React.ReactNode;
  content: string;
  color?: string;
}) {
  const [show, setShow] = useState(false);
  const bg = color ?? C_MAIN;
  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          style={{ background: bg, color: "#fff" }}
        >
          {content}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: bg }}
          />
        </div>
      )}
    </div>
  );
}

// ─── KPI-карточка ─────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  subColor,
  valueColor,
  bg,
  labelColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  valueColor?: string;
  bg?: string;
  labelColor?: string;
}) {
  return (
    <div
      className="rounded-xl shadow-sm p-5 analytics-kpi"
      style={{ background: bg ?? "#fff", border: `1px solid ${C_BORDER}` }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-1"
        style={{ color: labelColor ?? C_SUB }}
      >
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: valueColor ?? C_MAIN }}>
        {value}
      </p>
      {sub && (
        <p
          className="text-xs font-semibold mt-1"
          style={{ color: subColor ?? C_SUB }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Карточка-секция ──────────────────────────────────────────────────────────
function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl shadow-sm p-5 analytics-card flex flex-col ${className}`}
      style={{ background: C_CARD, border: `1px solid ${C_BORDER}` }}
    >
      <h2
        className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: C_SUB }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Основной компонент ───────────────────────────────────────────────────────
export function AnalyticsPage() {
  useEffect(() => {
    document.title = "Аналитика — Конкурс СочиГУ";
  }, []);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byNomination, setByNomination] = useState<AnalyticsByNomination[]>([]);
  const [timeline, setTimeline] = useState<AnalyticsTimeline[]>([]);
  const [geography, setGeography] = useState<AnalyticsGeography[]>([]);
  const [byStatus, setByStatus] = useState<AnalyticsByStatus[]>([]);
  const [activity, setActivity] = useState<AnalyticsActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [pendingContacts, setPendingContacts] = useState(0);
  const [contests, setContests] = useState<Contest[]>([]);
  const [contestId, setContestId] = useState<string>("");

  useEffect(() => {
    contestsApi
      .getAll()
      .then((list) => {
        setContests(list);
        const active = list.find((c) => c.isActive);
        if (active) setContestId(active.id);
      })
      .catch(() => {});
  }, []);

  const fetchAll = (cid?: string) =>
    Promise.all([
      analyticsApi.getSummary(cid),
      analyticsApi.getByNomination(cid),
      analyticsApi.getTimeline(cid),
      analyticsApi.getGeography(cid),
      analyticsApi.getByStatus(cid),
      analyticsApi.getActivity(cid),
      contactsApi.getAll("pending"),
    ]).then(([s, n, t, g, bs, a, contacts]) => {
      setSummary(s);
      setByNomination(n);
      setTimeline(t);
      setGeography(g);
      setByStatus(bs);
      setActivity(a);
      setPendingContacts(contacts.length);
    });

  useEffect(() => {
    setLoading(true);
    setError(null);
    const cid = contestId || undefined;
    fetchAll(cid)
      .catch(() => setError("Ошибка при загрузке аналитики"))
      .finally(() => setLoading(false));

    const id = setInterval(() => {
      fetchAll(cid).catch(() => {});
    }, 15_000);
    return () => clearInterval(id);
  }, [retryKey, contestId]);

  // ── Вспомогательные вычисления ──────────────────────────────────────────────
  const statusCount = (s: string | string[]): number => {
    const arr = Array.isArray(s) ? s : [s];
    return arr.reduce(
      (acc, st) => acc + (byStatus.find((x) => x.status === st)?.count ?? 0),
      0,
    );
  };

  const total = summary?.totalApplications ?? 0;

  // Воронка: только тёмные цвета + их попарные миксы, текст белый
  const funnelSteps = [
    { label: "Все заявки", count: total, color: PALETTE[0] },
    { label: "Подано", count: total - statusCount("draft"), color: MIX_1_3 },
    {
      label: "На проверке",
      count: statusCount("submitted"),
      color: PALETTE[3],
    },
    { label: "Принято", count: statusCount("accepted"), color: MIX_3_5 },
    {
      label: "К очному этапу",
      count: statusCount("admitted"),
      color: PALETTE[4],
    },
    {
      label: "Победители",
      count: statusCount(["winner", "runner_up"]),
      color: MIX_5_1,
    },
  ];

  // Сетка статусов: цвета строго по заданию
  const statusGrid = [
    { label: "Принято", status: "accepted", color: PALETTE[0] },
    { label: "На проверке", status: "submitted", color: PALETTE[3] },
    { label: "Отклонено", status: "rejected", color: PALETTE[4] },
    { label: "Черновики", status: "draft", color: PALETTE[3] },
    { label: "К очному", status: "admitted", color: PALETTE[0] },
    {
      label: "Победители",
      statuses: ["winner", "runner_up"],
      color: PALETTE[4],
    },
  ];

  // Timeline с заполнением пропусков нулями
  const filledTimeline = useMemo(() => {
    if (timeline.length === 0) return [];
    const map = new Map(timeline.map((t) => [t.date.slice(0, 10), t.count]));
    const startKey = timeline[0].date.slice(0, 10);
    const lastDataKey = timeline[timeline.length - 1].date.slice(0, 10);
    const todayKey = new Date().toLocaleDateString("sv-SE");
    const endKey = lastDataKey > todayKey ? lastDataKey : todayKey;
    const result: { date: string; count: number }[] = [];
    const cur = new Date(startKey + "T12:00:00Z");
    const end = new Date(endKey + "T12:00:00Z");
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      result.push({ date: key, count: map.get(key) ?? 0 });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return result;
  }, [timeline]);

  // География: объединяем RU/EN написания и игнорируем регистр
  // (useMemo обязан стоять до ранних return — порядок хуков)
  const mergedGeography = useMemo(() => mergeGeography(geography), [geography]);

  const maxY =
    filledTimeline.length > 0
      ? Math.ceil(Math.max(...filledTimeline.map((t) => t.count)) * 1.2)
      : 5;

  const statusSum = byStatus.reduce((acc, s) => acc + s.count, 0);
  const integrityOk = total === 0 || statusSum === total;

  // ── Загрузка / ошибка ───────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  if (error)
    return (
      <div className="m-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-4">
        <span>{error}</span>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-100 transition-colors"
        >
          Повторить
        </button>
      </div>
    );

  // ── Рендер ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 analytics-page">
      {/* Шапка */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{ color: C_MAIN }}>
          Аналитика конкурса
        </h1>
        <div className="flex items-center gap-3 analytics-no-print">
          {contests.length > 0 && (
            <select
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Все конкурсы</option>
              {contests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? " (активный)" : ""}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
            style={{ background: PALETTE[0] }}
          >
            Экспорт PDF
          </button>
        </div>
      </div>

      {!integrityOk && (
        <div
          className="p-3 rounded-lg text-xs"
          style={{ background: "#fff3cd", color: "#856404" }}
        >
          ⚠ Сумма по статусам ({statusSum}) не совпадает с общим числом заявок (
          {total}) — возможна ошибка данных.
        </div>
      )}

      {/* KPI × 5 */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <KpiCard
            label="Всего заявок"
            value={total}
            sub={
              summary.newThisWeek > 0
                ? `+${summary.newThisWeek} за неделю`
                : "без изменений"
            }
            subColor={C_SUB}
          />
          <KpiCard
            label="Участников"
            value={summary.totalUsers}
            sub={`в ${total} заявках`}
          />
          <KpiCard
            label="Команд"
            value={summary.teamApplications}
            sub={`ср. ${summary.avgTeamSize} чел.`}
          />
          <KpiCard
            label="Вузов"
            value={summary.totalUniversities}
            sub={`городов: ${mergedGeography.length}`}
          />
          <KpiCard
            label="Обращения"
            value={pendingContacts}
            sub="ожидают ответа"
            bg="rgba(205,162,171,0.20)"
            labelColor={C_MAIN}
            valueColor={C_MAIN}
            subColor={C_MAIN}
          />
        </div>
      )}

      {/* Воронка + Статусы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 analytics-grid-2">
        <Card title="Воронка заявок" className="h-full">
          {total === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C_SUB }}>
              Данных пока нет
            </p>
          ) : (
            <div className="flex flex-col justify-between h-full gap-3">
              {funnelSteps.map((step, i) => {
                const barPct = total > 0 ? (step.count / total) * 100 : 0;
                const pct = safe(step.count, total);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="text-xs text-right shrink-0"
                      style={{ width: 130, color: C_MAIN }}
                    >
                      {step.label}
                    </span>
                    <Tip
                      content={`${step.label}: ${step.count} заявок (${pct}%)`}
                      color={step.color}
                    >
                      <div
                        className="relative rounded analytics-track"
                        style={{ height: 34, background: C_TRACK }}
                      >
                        <div
                          className="absolute left-0 top-0 h-full rounded flex items-center transition-all duration-500 analytics-bar"
                          style={{
                            width: `${Math.max(barPct, 0)}%`,
                            background: step.color,
                            minWidth: step.count > 0 ? 4 : 0,
                          }}
                        >
                          {barPct >= 14 && (
                            <span
                              className="pl-2 text-xs font-bold"
                              style={{ color: "#ffffff" }}
                            >
                              {step.count}
                            </span>
                          )}
                        </div>
                        {barPct < 14 && step.count > 0 && (
                          <span
                            className="absolute text-xs font-bold"
                            style={{
                              left: `calc(${barPct}% + 6px)`,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: C_MAIN,
                            }}
                          >
                            {step.count}
                          </span>
                        )}
                      </div>
                    </Tip>
                    <span
                      className="text-xs shrink-0 w-9 text-right font-medium"
                      style={{ color: C_SUB }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Статусы">
          {byStatus.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C_SUB }}>
              Данных пока нет
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {statusGrid.map((cell, i) => {
                const count =
                  "statuses" in cell
                    ? statusCount(cell.statuses!)
                    : statusCount(cell.status!);
                return (
                  <div
                    key={i}
                    className="rounded-lg p-4 flex flex-col gap-1 analytics-kpi"
                    style={{
                      background: cell.color + "22",
                      border: `1px solid ${cell.color}44`,
                    }}
                  >
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: cell.color }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: cell.color }}
                    >
                      {cell.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Номинации + География */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 analytics-grid-2">
        <Card title="Заявки по номинациям">
          {byNomination.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C_SUB }}>
              Данных пока нет
            </p>
          ) : (
            (() => {
              const top = byNomination.slice(0, 10);
              const maxCount = Math.max(...top.map((n) => n.count));
              const others = byNomination
                .slice(10)
                .reduce((acc, n) => acc + n.count, 0);
              return (
                <div
                  className="flex flex-col flex-1 gap-2"
                  style={{ minHeight: 0 }}
                >
                  {top.map((item, i) => {
                    const barPct =
                      maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const pct = safe(item.count, total);
                    const barColor = PALETTE[i % PALETTE.length];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 flex-1 min-h-0"
                      >
                        <div
                          className="text-xs text-right shrink-0"
                          style={{
                            width: 130,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: C_MAIN,
                          }}
                          title={item.nomination}
                        >
                          {item.nomination}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
                          <Tip
                            content={`${item.nomination}: ${item.count} заявок (${pct}%)`}
                            color={barColor}
                          >
                            <div
                              className="relative rounded analytics-track"
                              style={{
                                height: "100%",
                                background: C_TRACK,
                                width: "100%",
                              }}
                            >
                              <div
                                className="absolute left-0 top-0 h-full rounded transition-all duration-500 flex items-center analytics-bar"
                                style={{
                                  width: `${barPct}%`,
                                  background: barColor,
                                  minWidth: item.count > 0 ? 4 : 0,
                                }}
                              >
                                {barPct >= 16 && (
                                  <span
                                    className="pl-2 text-xs font-semibold"
                                    style={{ color: textColor(barColor) }}
                                  >
                                    {item.count}
                                  </span>
                                )}
                              </div>
                              {barPct < 16 && item.count > 0 && (
                                <span
                                  className="absolute text-xs font-semibold"
                                  style={{
                                    left: `calc(${barPct}% + 6px)`,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: C_MAIN,
                                  }}
                                >
                                  {item.count}
                                </span>
                              )}
                            </div>
                          </Tip>
                        </div>
                        <span
                          className="text-xs shrink-0 w-9 text-right font-medium"
                          style={{ color: C_SUB }}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                  {others > 0 && (
                    <div className="text-xs pt-1" style={{ color: C_SUB }}>
                      Другие: {others} заявок
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </Card>

        <Card title="География">
          {mergedGeography.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C_SUB }}>
              Данных пока нет
            </p>
          ) : (
            <div
              className="overflow-y-auto geo-scroll"
              style={{ maxHeight: 260, paddingRight: 6 }}
            >
              <table className="w-full text-sm">
                <thead
                  className="sticky top-0"
                  style={{ background: "#EFF6F5" }}
                >
                  <tr
                    className="text-left border-b"
                    style={{ borderColor: C_BORDER }}
                  >
                    <th
                      className="pb-2 font-medium text-xs"
                      style={{ color: C_SUB }}
                    >
                      Город
                    </th>
                    <th
                      className="pb-2 font-medium text-xs text-right"
                      style={{ color: C_SUB }}
                    >
                      Участников
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mergedGeography.map((g, i) => (
                    <tr
                      key={g.city}
                      className="border-b"
                      style={{ borderColor: "rgba(83,107,120,0.08)" }}
                    >
                      <td className="py-2 flex items-center gap-2">
                        <span
                          className="text-base leading-none"
                          style={{ color: PALETTE[i % PALETTE.length] }}
                        >
                          ●
                        </span>
                        <span style={{ color: C_MAIN }}>{g.city}</span>
                      </td>
                      <td
                        className="py-2 text-right font-semibold"
                        style={{
                          color:
                            textColor(PALETTE[i % PALETTE.length]) === C_MAIN
                              ? C_MAIN
                              : PALETTE[i % PALETTE.length],
                        }}
                      >
                        {g.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Динамика + Лента */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 analytics-grid-2">
        <Card title="Динамика подачи заявок">
          {filledTimeline.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C_SUB }}>
              Данных пока нет
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={filledTimeline}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={PALETTE[1]}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={PALETTE[1]}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C_TRACK} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("ru-RU", {
                      timeZone: "UTC",
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={[0, maxY]}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(d) =>
                    new Date(d).toLocaleDateString("ru-RU", { timeZone: "UTC" })
                  }
                  formatter={(v: number) => [v, "Заявок"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={PALETTE[0]}
                  strokeWidth={2.5}
                  fill="url(#areaFill)"
                  dot={{ fill: PALETTE[4], r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Последние события">
          {activity.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C_SUB }}>
              Событий пока нет
            </p>
          ) : (
            <div className="space-y-3">
              {(showAll ? activity : activity.slice(0, 5)).map((ev, i) => (
                <div key={ev.id ?? i} className="flex gap-3 items-start">
                  <span
                    className="mt-1 text-base leading-none shrink-0"
                    style={{ color: PALETTE[i % PALETTE.length] }}
                  >
                    ●
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: C_MAIN }}
                    >
                      {ev.userName} —{" "}
                      {STATUS_LABELS[ev.toStatus] ?? ev.toStatus}
                    </p>
                    <p className="text-xs truncate" style={{ color: C_SUB }}>
                      {relativeTime(ev.createdAt)} · {ev.nominationName}
                    </p>
                  </div>
                </div>
              ))}
              {activity.length > 5 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="text-xs font-medium mt-1 hover:underline"
                  style={{ color: PALETTE[2] }}
                >
                  {showAll ? "Свернуть" : `Показать ещё ${activity.length - 5}`}
                </button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
