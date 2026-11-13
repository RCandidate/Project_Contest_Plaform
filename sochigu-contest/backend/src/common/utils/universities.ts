const UNIVERSITIES: string[][] = [
  [
    "Sochi State University",
    "Сочинский государственный университет",
    "СочиГУ",
    "СочиГу",
    "Сочигу",
    "СОЧИГУ",
    "SGU",
    "SGU Sochi",
    "SochiGU",
    "Sochi GU",
    "ФГБОУ ВО «Сочинский государственный университет»",
    "ФГБОУ ВО Сочинский государственный университет",
    "ФГБОУ ВО «СочиГУ»",
    "ФГБОУ ВО СочиГУ",
    "Федеральное государственное бюджетное образовательное учреждение высшего образования «Сочинский государственный университет»",
    "Федеральное государственное бюджетное образовательное учреждение высшего образования Сочинский государственный университет",
    "Сочинский гос. университет",
    "Сочинский госуниверситет",
    "СГУ Сочи",
    "СГУ",
  ],
];

function normalizeUniversityKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(
      /^(федеральное\s+государственное\s+(бюджетное|автономное)\s+образовательное\s+учреждение\s+(высшего\s+образования|профессионального\s+образования)?)\s*/i,
      "",
    )
    .replace(
      /^(фгбоу\s*во|фгаоу\s*во|фгбоу|фгаоу|фгбу|фгоу|гоу\s*впо|фгпоу|фгкоу|фгбоу\s*впо|фгбоу\s*спо)\s*/i,
      "",
    )
    .replace(/^(г\.?|гор\.?|город|university|uni|вуз)\s+/i, "")
    .replace(/[«»""„‟『』「」()\[\]]/g, " ")
    .replace(/[\s\-–—_.,'’`]+/g, " ")
    .trim();
}

const UNI_MAP = new Map<string, string>();
for (const [canon, ...variants] of UNIVERSITIES) {
  UNI_MAP.set(normalizeUniversityKey(canon), canon);
  for (const v of variants) {
    UNI_MAP.set(normalizeUniversityKey(v), canon);
  }
}

export function canonicalUniversity(raw: string): string {
  if (!raw?.trim()) return "";
  const key = normalizeUniversityKey(raw);
  return UNI_MAP.get(key) ?? raw.trim();
}
