import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { bankApi } from "@/api/bank";
import { BankComment, BANK_COMMENT_AUTHOR_LABELS } from "@/types";
import { formatDate } from "@/utils/formatDate";
import { getApiErrorMessage } from "@/utils/apiError";

interface Props {
  applicationId: string;
  // admin и moderator могут удалять комментарии
  canDelete: boolean;
}

const MAX_LENGTH = 1000;

export function CommentBlock({ applicationId, canDelete }: Props) {
  const { showToast } = useToast();
  const [comments, setComments] = useState<BankComment[] | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    setForbidden(false);
    bankApi
      .getComments(applicationId)
      .then((list) => {
        if (!cancelled) setComments(list);
      })
      .catch((err) => {
        if (cancelled) return;
        // участник, не являющийся автором проекта, обсуждения не видит
        if (isAxiosError(err) && err.response?.status === 403)
          setForbidden(true);
        else setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, retryKey]);

  const send = async () => {
    const value = text.trim();
    if (!value) {
      setSendError("Напишите комментарий");
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const created = await bankApi.createComment(applicationId, value);
      setComments((prev) => [...(prev ?? []), created]);
      setText("");
    } catch (err) {
      setSendError(
        getApiErrorMessage(
          err,
          "Не удалось отправить комментарий. Попробуйте позже.",
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Удалить комментарий?")) return;
    try {
      await bankApi.deleteComment(id);
      setComments((prev) => (prev ?? []).filter((c) => c.id !== id));
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Не удалось удалить комментарий"),
        "error",
      );
    }
  };

  if (forbidden) return null;

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h2 className="font-bold text-gray-900 mb-1">Обсуждение</h2>
      <p className="text-xs text-gray-400 mb-4">
        Комментарии видят авторы проекта, работодатели и модераторы. Не
        публикуйте личные контакты.
      </p>

      {loadError ? (
        <div className="text-center py-6">
          <p className="text-sm text-red-500 mb-3">
            Не удалось загрузить комментарии.
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Повторить
          </button>
        </div>
      ) : comments === null ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">Комментариев пока нет.</p>
          ) : (
            <ul className="space-y-3 mb-5">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 break-words min-w-0">
                      {c.author
                        ? `${c.author.lastName} ${c.author.firstName}`
                        : "Пользователь удалён"}
                      {BANK_COMMENT_AUTHOR_LABELS[c.authorKind] && (
                        <span className="ml-2 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                          {BANK_COMMENT_AUTHOR_LABELS[c.authorKind]}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(c.createdAt)}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => remove(c.id)}
                          aria-label="Удалить комментарий"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} aria-hidden />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line break-words">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            {sendError && <Alert variant="error">{sendError}</Alert>}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={MAX_LENGTH}
              aria-label="Новый комментарий"
              placeholder="Задайте вопрос или ответьте"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                {text.length}/{MAX_LENGTH}
              </span>
              <button
                onClick={send}
                disabled={sending}
                className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-60"
              >
                {sending && <Spinner size="sm" />}
                Отправить
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
