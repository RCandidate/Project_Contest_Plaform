import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/shared/Spinner";
import { scoresApi } from "@/api/scores";
import { FinalCriterion, FinalCriterionScale } from "@/types";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/utils/apiError";

interface Props {
  applicationId: string;
}

const SCALE_ORDER: FinalCriterionScale[] = ["general", "business", "practice"];

const SCALE_TITLES: Record<FinalCriterionScale, string> = {
  general: "Общая шкала (для всех проектов)",
  business: "Шкала бизнес-проектов",
  practice: "Шкала практико-ориентированных проектов",
};

// Пустое поле = критерий не оценён. Иначе нужно целое число от 0 до максимума.
function fieldError(raw: string, max: number): string | null {
  const value = raw.trim();
  if (value === "") return null;
  if (!/^\d+$/.test(value) || Number(value) > max)
    return `Целое число от 0 до ${max}`;
  return null;
}

function toFields(items?: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(items ?? {}).map(([code, points]) => [code, String(points)]),
  );
}

export function FinalScoreForm({ applicationId }: Props) {
  const { showToast } = useToast();
  const [criteria, setCriteria] = useState<FinalCriterion[]>([]);
  const [conflict, setConflict] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [hasScore, setHasScore] = useState(false);
  const [editedByAdmin, setEditedByAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Критерии заявки (общая шкала + шкала её номинации) и моя ранее сохранённая оценка
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setError(null);
    scoresApi
      .getFinalForm(applicationId)
      .then((info) => {
        if (cancelled) return;
        setCriteria(info.criteria);
        setConflict(Boolean(info.conflict));
        setValues(toFields(info.score?.items));
        setHasScore(Boolean(info.score));
        setEditedByAdmin(Boolean(info.score?.editedByAdmin));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, retryKey]);

  const groups = useMemo(
    () =>
      SCALE_ORDER.map((scale) => ({
        scale,
        items: criteria.filter((c) => c.scale === scale),
      })).filter((g) => g.items.length > 0),
    [criteria],
  );

  const errors = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const c of criteria)
      map[c.code] = fieldError(values[c.code] ?? "", c.maxPoints);
    return map;
  }, [criteria, values]);

  const filledCount = criteria.filter(
    (c) => (values[c.code] ?? "").trim() !== "" && !errors[c.code],
  ).length;
  const hasInvalid = criteria.some((c) => errors[c.code]);
  const locked = conflict || saving;

  const save = async () => {
    if (hasInvalid) {
      setError(
        "Исправьте отмеченные поля: баллы — целые числа от 0 до максимума критерия",
      );
      return;
    }
    const items: Record<string, number> = {};
    for (const c of criteria) {
      const raw = (values[c.code] ?? "").trim();
      if (raw !== "") items[c.code] = Number(raw);
    }
    if (Object.keys(items).length === 0) {
      setError("Заполните хотя бы один критерий");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await scoresApi.upsertFinal({ applicationId, items });
      setValues(toFields(saved?.items ?? items));
      setHasScore(true);
      setEditedByAdmin(Boolean(saved?.editedByAdmin));
      showToast("Оценка очного этапа сохранена", "success");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Не удалось сохранить оценку. Попробуйте позже.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="font-semibold text-gray-900">Оценка 2-го этапа</h2>
        {!loading && !loadError && criteria.length > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filledCount === criteria.length
                ? "text-green-700 bg-green-100"
                : "text-gray-600 bg-gray-100"
            }`}
          >
            Заполнено {filledCount} из {criteria.length}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Баллы — целые числа. Можно заполнить не все критерии и вернуться позже.
      </p>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : loadError ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-3">
            Не удалось загрузить форму оценки очного этапа.
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Повторить
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {conflict && (
            <Alert variant="info">
              Вы указаны руководителем этого проекта, поэтому оценить его
              нельзя.
            </Alert>
          )}
          {editedByAdmin && !conflict && (
            <Alert variant="info">Оценка была изменена администратором.</Alert>
          )}
          {error && <Alert variant="error">{error}</Alert>}
          {criteria.length === 0 && (
            <Alert variant="info">Для этой заявки нет критериев оценки.</Alert>
          )}

          {groups.map((group) => (
            <div key={group.scale}>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {SCALE_TITLES[group.scale]}
              </p>
              <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                {group.items.map((c) => {
                  const err = errors[c.code];
                  return (
                    <div
                      key={c.code}
                      className="flex items-start justify-between gap-4 px-3 py-2.5"
                    >
                      <label
                        htmlFor={`final-${c.code}`}
                        className="text-sm text-gray-700 flex-1"
                      >
                        {c.title}
                      </label>
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <input
                            id={`final-${c.code}`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={c.maxPoints}
                            step={1}
                            value={values[c.code] ?? ""}
                            disabled={locked}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [c.code]: e.target.value,
                              }))
                            }
                            placeholder="—"
                            aria-invalid={Boolean(err)}
                            className={`w-20 px-3 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50 ${
                              err ? "border-red-400" : "border-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-400 w-12 text-left">
                            из {c.maxPoints}
                          </span>
                        </div>
                        {err && (
                          <p className="text-xs text-red-500 mt-1">{err}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!conflict && criteria.length > 0 && (
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? "Сохраняем..." : "Сохранить"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
