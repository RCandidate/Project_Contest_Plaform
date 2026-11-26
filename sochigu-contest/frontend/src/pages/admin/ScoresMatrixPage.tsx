import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { scoresApi } from "@/api/scores";
import { contestsApi } from "@/api/contests";
import { Contest, Score, ScoreMatrix, ScoreQuality } from "@/types";
import { Spinner } from "@/components/shared/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  ScoreMatrixTable,
  MatrixExpert,
  MatrixProject,
} from "@/components/admin/scores/ScoreMatrixTable";
import { ScoreChart } from "@/components/admin/scores/ScoresChart";

interface Selected {
  project: MatrixProject;
  expert: MatrixExpert;
  score: Score;
}

export function ScoresMatrixPage() {
  useEffect(() => {
    document.title = "Оценки — Конкурс СочиГУ";
  }, []);

  const [contests, setContests] = useState<Contest[]>([]);
  const [contestId, setContestId] = useState("");
  const [contestsReady, setContestsReady] = useState(false);
  const [qualities, setQualities] = useState<ScoreQuality[]>([]);
  const [matrix, setMatrix] = useState<ScoreMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [view, setView] = useState<"table" | "chart">("table");
  const [stage, setStage] = useState<1 | 2>(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await scoresApi.exportExcel(contestId || undefined, stage);
    } catch (err) {
      setExportError(getApiErrorMessage(err, "Не удалось выгрузить таблицу"));
    } finally {
      setExporting(false);
    }
  };

  // Список конкурсов (по умолчанию активный) и справочник качеств для подписей
  useEffect(() => {
    contestsApi
      .getAll()
      .then((list) => {
        setContests(list);
        const active = list.find((c) => c.isActive);
        if (active) setContestId(active.id);
      })
      .catch(() => {})
      .finally(() => setContestsReady(true));
    scoresApi
      .getQualities()
      .then(setQualities)
      .catch(() => {});
  }, []);

  // Матрица грузится только после списка конкурсов, чтобы не было двух запросов подряд
  useEffect(() => {
    if (!contestsReady) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    scoresApi
      .getMatrix(contestId || undefined, stage)
      .then((data) => {
        if (!cancelled) setMatrix(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Ошибка при загрузке оценок"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contestsReady, contestId, stage, retryKey]);

  const qualityLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of qualities) map.set(q.code, q.label);
    return map;
  }, [qualities]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary-900">
          Сводная таблица оценок
        </h1>
        {contests.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Конкурс
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
          </label>
        )}
      </div>

      <div className="space-y-2">
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-gray-200 bg-white p-1"
        >
          {(
            [
              [1, "1 этап"],
              [2, "2 этап (очный)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={stage === key}
              onClick={() => setStage(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                stage === key
                  ? "bg-primary-700 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {stage === 2 && (
          <p className="text-sm text-gray-500">
            Проекты со статусом «Допущена к очному этапу», «Победитель» и
            «Призёр». Оценки второго этапа пока не подключены.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="space-y-3">
          <Alert variant="error">{error}</Alert>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
          >
            Повторить
          </button>
        </div>
      ) : !matrix ||
        (stage === 1
          ? matrix.scores.length === 0
          : matrix.projects.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-500">
          {stage === 1
            ? "Оценок пока нет"
            : "Нет проектов, допущенных к очному этапу"}
        </div>
      ) : (
        <>
          {exportError && <Alert variant="error">{exportError}</Alert>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              className="inline-flex rounded-lg border border-gray-200 bg-white p-1"
            >
              {(
                [
                  ["table", "Таблица"],
                  ["chart", "График"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={view === key}
                  onClick={() => setView(key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === key
                      ? "bg-primary-700 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Download size={16} />
              {exporting ? "Выгрузка…" : "Экспорт в Excel"}
            </button>
          </div>

          {view === "table" ? (
            <ScoreMatrixTable
              experts={matrix.experts}
              projects={matrix.projects}
              scores={matrix.scores}
              onCellClick={(project, expert, score) =>
                setSelected({ project, expert, score })
              }
            />
          ) : (
            <ScoreChart
              experts={matrix.experts}
              projects={matrix.projects}
              scores={matrix.scores}
            />
          )}
        </>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Оценка эксперта"
      >
        {selected && (
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-32 flex-shrink-0">Эксперт</dt>
              <dd className="text-gray-800 font-medium">
                {selected.expert.lastName} {selected.expert.firstName}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-32 flex-shrink-0">Проект</dt>
              <dd className="text-gray-800 font-medium">
                {selected.project.projectTitle}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-32 flex-shrink-0">Баллы</dt>
              <dd className="text-gray-800 font-medium">
                {selected.score.points}%
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-32 flex-shrink-0">Качества</dt>
              <dd className="text-gray-800">
                {selected.score.qualities.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selected.score.qualities.map((code) => (
                      <span
                        key={code}
                        className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {qualityLabels.get(code) ?? code}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-32 flex-shrink-0">
                Особое мнение
              </dt>
              <dd className="text-gray-800">
                {selected.score.specialOpinion || "—"}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
