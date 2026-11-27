// Конфликт интересов (п. 5.5 Положения): член Экспертного совета не может
// оценивать проект, которым он руководит.
//
// Правило: фамилия эксперта ищется целым словом во всей строке «руководитель»
// заявки, без учёта регистра, «ё» = «е». Слова делятся по пробелам, дефисам и
// любым знакам препинания. «Иванов» не совпадёт с «Иванова», «Петров» не
// совпадёт с «Петровский». Фамилия через дефис («Салтыков-Щедрин») считается
// найденной, если в строке есть все её части.

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

// Строка «руководитель» заявки: ФИО руководителя из поля supervisor
export function supervisorText(
  supervisor?: { name?: string | null } | null,
): string {
  return typeof supervisor?.name === "string" ? supervisor.name : "";
}

export function isSupervisorConflict(
  expertLastName: string | null | undefined,
  supervisor: string | null | undefined,
): boolean {
  if (typeof expertLastName !== "string" || typeof supervisor !== "string")
    return false;
  const surname = words(expertLastName);
  if (surname.length === 0) return false;
  const present = new Set(words(supervisor));
  return surname.every((w) => present.has(w));
}
