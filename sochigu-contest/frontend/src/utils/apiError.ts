import { isAxiosError } from "axios";

// Сообщение бэкенда может быть строкой или массивом (ошибки валидации)
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback;
  const raw = err.response?.data?.message;
  if (Array.isArray(raw)) return raw[0] ?? fallback;
  return typeof raw === "string" ? raw : fallback;
}
