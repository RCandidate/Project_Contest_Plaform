import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/shared/Spinner";
import { ScoreInput } from "@/components/admin/scores/ScoreInput";
import { scoresApi } from "@/api/scores";
import { ScoreQuality } from "@/types";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/utils/apiError";

interface Props {
  applicationId: string;
  // черновики оценивать нельзя
  isDraft: boolean;
}

const OPINION_MAX = 50;

export function MyScoreForm({ applicationId, isDraft }: Props) {
  const { showToast } = useToast();
  const [qualityList, setQualityList] = useState<ScoreQuality[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [qualities, setQualities] = useState<string[]>([]);
  const [opinion, setOpinion] = useState("");
  const [hasScore, setHasScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Справочник качеств и моя ранее выставленная оценка этой заявки
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setError(null);
    Promise.all([scoresApi.getQualities(), scoresApi.getMy()])
      .then(([list, mine]) => {
        if (cancelled) return;
        setQualityList(list);
        const current = mine.find((s) => s.applicationId === applicationId);
        setHasScore(Boolean(current));
        setPoints(current ? current.points : null);
        setQualities(current?.qualities ?? []);
        setOpinion(current?.specialOpinion ?? "");
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

  const toggleQuality = (code: string) =>
    setQualities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  const save = async () => {
    if (points === null) {
      setError("Укажите баллы от 0 до 100");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await scoresApi.upsert({
        applicationId,
        points,
        qualities,
        specialOpinion: opinion.trim() || undefined,
      });
      setHasScore(true);
      showToast("Оценка сохранена", "success");
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-semibold text-gray-900">Моя оценка</h2>
        {hasScore && (
          <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            Оценка выставлена
          </span>
        )}
      </div>

      {isDraft ? (
        <Alert variant="info">
          Заявка ещё не подана (черновик): оценить её нельзя.
        </Alert>
      ) : loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : loadError ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-3">
            Не удалось загрузить форму оценки.
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
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Баллы (0–100)
            </p>
            <ScoreInput value={points} onChange={setPoints} disabled={saving} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Качества</p>
            <div className="flex flex-wrap gap-2">
              {qualityList.map((q) => {
                const active = qualities.includes(q.code);
                return (
                  <button
                    key={q.code}
                    type="button"
                    aria-pressed={active}
                    disabled={saving}
                    onClick={() => toggleQuality(q.code)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors disabled:opacity-60 ${
                      active
                        ? "bg-primary-700 border-primary-700 text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="score-opinion"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Особое мнение (одно-два слова)
            </label>
            <input
              id="score-opinion"
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              maxLength={OPINION_MAX}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {opinion.length}/{OPINION_MAX}
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      )}
    </div>
  );
}
