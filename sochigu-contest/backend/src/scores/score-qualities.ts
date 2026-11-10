export interface ScoreQuality {
  code: string;
  label: string;
}

// Черновой справочник качеств (будет заменён). В БД хранятся только коды:
// русская подпись с запятой сломала бы simple-array.
export const SCORE_QUALITIES: ScoreQuality[] = [
  { code: "creative_approach", label: "Креативный подход" },
  { code: "catchy_design", label: "Цепляющий дизайн" },
  { code: "relevance", label: "Актуальность" },
  { code: "practical_value", label: "Практическая применимость" },
  { code: "depth", label: "Глубина проработки" },
  { code: "clear_presentation", label: "Чёткая презентация" },
  { code: "teamwork", label: "Командная работа" },
];

export const SCORE_QUALITY_CODES: string[] = SCORE_QUALITIES.map((q) => q.code);
