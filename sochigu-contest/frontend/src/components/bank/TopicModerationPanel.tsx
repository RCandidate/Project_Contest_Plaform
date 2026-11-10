import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { bankApi } from "@/api/bank";
import { BankTopic, BankTopicStatus, BANK_TOPIC_STATUS_LABELS } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";

interface Props {
  topic: BankTopic;
  onUpdated: (topic: BankTopic) => void;
}

const STATUSES = Object.keys(BANK_TOPIC_STATUS_LABELS) as BankTopicStatus[];

export function TopicModerationPanel({ topic, onUpdated }: Props) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<BankTopicStatus>(
    topic.status ?? "pending",
  );
  const [comment, setComment] = useState(topic.moderationComment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(topic.status ?? "pending");
    setComment(topic.moderationComment ?? "");
    setError(null);
  }, [topic.id, topic.status, topic.moderationComment]);

  const save = async () => {
    if (status === "rejected" && !comment.trim()) {
      setError("Укажите причину отклонения");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await bankApi.updateTopicStatus(topic.id, {
        status,
        moderationComment: status === "rejected" ? comment.trim() : undefined,
      });
      showToast("Статус темы обновлён", "success");
      onUpdated(updated);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Не удалось изменить статус. Попробуйте позже.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-3 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Модерация</p>
      {error && <Alert variant="error">{error}</Alert>}

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as BankTopicStatus)}
        aria-label="Статус темы"
        className="select-custom w-full pl-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {BANK_TOPIC_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {status === "rejected" && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Причина отклонения (увидит работодатель)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      )}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-60"
      >
        {saving && <Spinner size="sm" />}
        Сохранить
      </button>
    </div>
  );
}
