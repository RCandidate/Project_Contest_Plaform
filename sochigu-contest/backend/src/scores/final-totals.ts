import {
  FINAL_SCORING_RULES,
  criteriaForNomination,
  scaleForNomination,
} from "./score-criteria";

export interface ExpertFinalTotals {
  general: number;
  nomination: number | null;
  total: number;
  filled: number;
  of: number;
}

type NominationLike = { shortName?: string | null; name?: string | null };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function expertFinalTotals(
  items: Record<string, number> | null | undefined,
  nomination?: NominationLike | null,
): ExpertFinalTotals {
  const criteria = criteriaForNomination(nomination);
  const hasNominationScale = scaleForNomination(nomination) !== null;

  let general = 0;
  let nominationSum = 0;
  let generalFilled = 0;
  let nominationFilled = 0;
  for (const c of criteria) {
    const value = items?.[c.code];
    if (typeof value !== "number") continue;
    if (c.scale === "general") {
      general += value;
      generalFilled++;
    } else {
      nominationSum += value;
      nominationFilled++;
    }
  }

  let total: number;
  switch (FINAL_SCORING_RULES.scalesCombine) {
    case "general_only":
      total = general;
      break;
    case "average": {
      const scales = (generalFilled > 0 ? 1 : 0) + (nominationFilled > 0 ? 1 : 0);
      total = scales > 0 ? (general + nominationSum) / scales : 0;
      break;
    }
    default:
      total = general + nominationSum;
  }

  return {
    general,
    nomination: hasNominationScale ? nominationSum : null,
    total: round2(total),
    filled: generalFilled + nominationFilled,
    of: criteria.length,
  };
}

export function projectFinalTotal(expertTotals: number[]): number | null {
  if (expertTotals.length === 0) return null;
  const sum = expertTotals.reduce((a, b) => a + b, 0);
  return round2(
    FINAL_SCORING_RULES.expertsCombine === "sum"
      ? sum
      : sum / expertTotals.length,
  );
  <div className="flex max-w-[260px] items-center gap-1.5">
                  {showPlace && p.place ? <PlaceBadge place={p.place} /> : null}
                  <span className="truncate" title={p.projectTitle}>
                    {p.projectTitle}
                  </span>
                </div>
export function rankRows<
  T extends { projectTitle: string; nomination: string | null; total: number | null },
>(
  rows: T[],
  scope: "overall" | "by_nomination",
): (T & { rank: number | null })[] {
  const groupOf = (r: T) => (scope === "by_nomination" ? (r.nomination ?? "") : "");
  const sorted = [...rows].sort((a, b) => {
    const g = groupOf(a).localeCompare(groupOf(b), "ru");
    if (g !== 0) return g;
    if (a.total === null && b.total !== null) return 1;
    if (a.total !== null && b.total === null) return -1;
    if (a.total !== null && b.total !== null && a.total !== b.total)
      return b.total - a.total;
    return a.projectTitle.localeCompare(b.projectTitle, "ru");
  });

  let group: string | null = null;
  let position = 0;
  let prevTotal: number | null = null;
  let prevRank = 0;
  return sorted.map((r) => {
    const g = groupOf(r);
    if (g !== group) {
      group = g;
      position = 0;
      prevTotal = null;
      prevRank = 0;
    }
    if (r.total === null) return { ...r, rank: null };
    position++;
    const rank = r.total === prevTotal ? prevRank : position;
    prevTotal = r.total;
    prevRank = rank;
    return { ...r, rank };
  });
}
}
