// Критерии итоговой оценки очного этапа (п. 4.6 Положения о Конкурсе).
// Меняются только здесь, в коде: в БД хранятся лишь коды критериев и баллы.

export type CriterionScale = "general" | "business" | "practice";

export interface ScoreCriterion {
  code: string;
  scale: CriterionScale;
  title: string;
  maxPoints: number;
  order: number;
}

export const FINAL_CRITERIA: ScoreCriterion[] = [
  // 4.6.1 Общие (5 × 20 = 100)
  {
    code: "general_elaboration",
    scale: "general",
    title: "Проработанность проекта и обоснованность предлагаемых решений",
    maxPoints: 20,
    order: 1,
  },
  {
    code: "general_presentation",
    scale: "general",
    title: "Уровень презентации и полнота ответов на вопросы",
    maxPoints: 20,
    order: 2,
  },
  {
    code: "general_team",
    scale: "general",
    title: "Профессионализм участников и сплочённость команды",
    maxPoints: 20,
    order: 3,
  },
  {
    code: "general_contribution",
    scale: "general",
    title: "Вклад каждого участника проектной команды в развитие проекта",
    maxPoints: 20,
    order: 4,
  },
  {
    code: "general_potential",
    scale: "general",
    title: "Актуальность, потенциал и возможность реализации проекта",
    maxPoints: 20,
    order: 5,
  },
  // 4.6.2 Бизнес (4 × 25 = 100)
  {
    code: "business_relevance",
    scale: "business",
    title: "Актуальность для потребителей",
    maxPoints: 25,
    order: 1,
  },
  {
    code: "business_commercialization",
    scale: "business",
    title: "Возможность коммерциализации",
    maxPoints: 25,
    order: 2,
  },
  {
    code: "business_investors",
    scale: "business",
    title: "Привлекательность для инвесторов",
    maxPoints: 25,
    order: 3,
  },
  {
    code: "business_prospects",
    scale: "business",
    title: "Перспективы дальнейшего развития",
    maxPoints: 25,
    order: 4,
  },
  // 4.6.3 Практико-ориентированные (30 + 70 = 100)
  {
    code: "practice_education",
    scale: "practice",
    title:
      "Актуальность для образовательных программ СочиГУ, соответствующих теме проекта, и возможность использовать материалы проекта в этих программах",
    maxPoints: 30,
    order: 1,
  },
  {
    code: "practice_business_transform",
    scale: "practice",
    title: "Возможность и перспективы дальнейшей трансформации в бизнес-проект",
    maxPoints: 70,
    order: 2,
  },
];

export const FINAL_CRITERIA_BY_CODE: Record<string, ScoreCriterion> =
  Object.fromEntries(FINAL_CRITERIA.map((c) => [c.code, c]));

export const FINAL_MAX_TOTAL = 200;

export const FINAL_SCORING_RULES: {
  expertsCombine: "average" | "sum";
} = {
  expertsCombine: "sum",
};

export function scaleForNomination(
  nomination?: { shortName?: string | null; name?: string | null } | null,
): CriterionScale | null {
  if (!nomination) return null;
  const short = (nomination.shortName ?? "").trim().toLowerCase();
  if (short === "business") return "business";
  if (short === "practical") return "practice";
  const name = (nomination.name ?? "").trim().toLowerCase();
  if (name.includes("бизнес")) return "business";
  if (name.includes("практик")) return "practice";
  return null;
}

const SCALE_ORDER: CriterionScale[] = ["general", "business", "practice"];

// Эксперт видит все критерии всех направлений, номинация не влияет
export function criteriaForNomination(
  _nomination?: { shortName?: string | null; name?: string | null } | null,
): ScoreCriterion[] {
  return [...FINAL_CRITERIA].sort((a, b) => {
    if (a.scale !== b.scale)
      return SCALE_ORDER.indexOf(a.scale) - SCALE_ORDER.indexOf(b.scale);
    return a.order - b.order;
  });
}
export const FINAL_RATING_RULES: {
  scope: "overall" | "by_nomination";
  stage1Weight: number;
} = {
  scope: "overall",
  stage1Weight: 0,
};
