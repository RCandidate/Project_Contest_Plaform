import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { useApplicationThread } from "@/hooks/useApplicationThread";
import { useAuthStore } from "@/store/auth.store";
import { ApplicationMessage, MESSAGE_MAX_LENGTH } from "@/types";

interface Props {
  applicationId: string;
  // false — только чтение (например, заявка ещё черновик у участника)
  canWrite?: boolean;
  readOnlyReason?: string;
}

function formatDateTime(str: string) {
  return new Date(str).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

function authorTitle(m: ApplicationMessage, isStaffViewer: boolean) {
  if (m.isMine) return "Вы";
  // Имя автора видит только персонал; участнику приходит лишь подпись роли
  if (isStaffViewer && m.authorName)
    return `${m.authorName} · ${m.authorLabel}`;
  return m.authorLabel;
}

function MessageItem({
  m,
  isStaffViewer,
  canDelete,
  onDelete,
}: {
  m: ApplicationMessage;
  isStaffViewer: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  if (m.kind === "status") {
    return (
      <li className="mx-auto max-w-[92%] rounded-lg border border-border bg-card px-3 py-2 text-center text-xs text-muted-foreground">
        <p className="whitespace-pre-line break-words">{m.text}</p>
        <p className="mt-1 opacity-70">{formatDateTime(m.createdAt)}</p>
      </li>
    );
  }

  const bubble = m.isInternal
    ? "border border-dashed border-yellow-400 bg-yellow-50 text-yellow-900"
    : m.isMine
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-foreground";

  return (
    <li className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 ${bubble}`}>
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs opacity-80">
          <span className="font-semibold">{authorTitle(m, isStaffViewer)}</span>
          {m.isInternal && (
            <span className="rounded-full bg-yellow-200 px-2 py-0.5 font-medium text-yellow-900">
              Внутренняя заметка
            </span>
          )}
          <span>{formatDateTime(m.createdAt)}</span>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(m.id)}
              aria-label="Удалить сообщение"
              className="ml-auto opacity-70 transition-opacity hover:opacity-100"
            >
              <Trash2 size={13} aria-hidden />
            </button>
          )}
        </div>
        <p className="whitespace-pre-line break-words text-sm">{m.text}</p>
      </div>
    </li>
  );
}

export function ApplicationThread({
  applicationId,
  canWrite = true,
  readOnlyReason,
}: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const isStaffViewer =
    role === "expert" || role === "moderator" || role === "admin";
  const canDelete = role === "admin" || role === "moderator";

  const { showToast } = useToast();
  const {
    messages,
    loading,
    error,
    unavailable,
    sending,
    sendError,
    send,
    remove,
    reload,
  } = useApplicationThread(applicationId);

  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);

  // Автопрокрутка вниз: при первой загрузке, после своей отправки
  // и при новых сообщениях, если пользователь уже находится внизу ленты
  const listRef = useRef<HTMLUListElement>(null);
  const stickRef = useRef(true);
  const prevCountRef = useRef(0);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const grew = messages.length > prevCountRef.current;
    const last = messages[messages.length - 1];
    if (
      prevCountRef.current === 0 ||
      (grew && (stickRef.current || last?.isMine))
    ) {
      el.scrollTop = el.scrollHeight;
      stickRef.current = true;
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  // При смене заявки поле ввода очищается
  useEffect(() => {
    setText("");
    setInternal(false);
    prevCountRef.current = 0;
  }, [applicationId]);

  const handleSend = async () => {
    const ok = await send(text, isStaffViewer && internal);
    if (ok) {
      setText("");
      setInternal(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить сообщение?")) return;
    const err = await remove(id);
    if (err) showToast(err, "error");
  };

  // Ветка недоступна (нет прав или заявки нет): блок не показываем
  if (unavailable) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 font-semibold text-foreground">
        {isStaffViewer
          ? "Переписка с участником"
          : "Переписка с организаторами"}
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        {isStaffViewer
          ? "Участник видит ваши ответы без имени, как «Эксперт» или «Организатор». Внутренние заметки видны только персоналу."
          : "Здесь можно задать вопрос организаторам и экспертам. Ответы приходят на почту и появляются в этом блоке."}
      </p>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="ml-auto h-12 w-2/3" />
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Повторить
          </button>
        </div>
      ) : (
        <>
          {messages.length === 0 ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Сообщений пока нет.
            </p>
          ) : (
            <ul
              ref={listRef}
              onScroll={onScroll}
              aria-live="polite"
              className="mb-4 max-h-[480px] space-y-3 overflow-y-auto pr-1"
            >
              {messages.map((m) => (
                <MessageItem
                  key={m.id}
                  m={m}
                  isStaffViewer={isStaffViewer}
                  canDelete={canDelete}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}

          {canWrite ? (
            <div className="space-y-2">
              {sendError && <Alert variant="error">{sendError}</Alert>}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.ctrlKey || e.metaKey) &&
                    !sending
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={3}
                maxLength={MESSAGE_MAX_LENGTH}
                aria-label="Новое сообщение"
                placeholder="Напишите сообщение (Ctrl+Enter — отправить)"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {text.length}/{MESSAGE_MAX_LENGTH}
                  </span>
                  {isStaffViewer && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={internal}
                        onChange={(e) => setInternal(e.target.checked)}
                      />
                      Внутренняя заметка (участник не увидит)
                    </label>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !text.trim()}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {sending && <Spinner size="sm" />}
                  Отправить
                </button>
              </div>
            </div>
          ) : (
            readOnlyReason && (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                {readOnlyReason}
              </p>
            )
          )}
        </>
      )}
    </section>
  );
}
