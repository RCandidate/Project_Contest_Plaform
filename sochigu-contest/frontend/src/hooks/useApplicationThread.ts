import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { applicationMessagesApi } from "@/api/applicationMessages";
import { ApplicationMessage } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { usePolling } from "./usePolling";
import { MESSAGES_READ_EVENT } from "./useUnreadMessages";

const POLL_MS = 30_000;

// Добавляет отправленное сообщение по id, сохраняя хронологический порядок
function mergeMessages(
  prev: ApplicationMessage[],
  incoming: ApplicationMessage[],
) {
  const byId = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function useApplicationThread(applicationId: string | undefined) {
  const [messages, setMessages] = useState<ApplicationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 403/404: ветка недоступна, опрос останавливаем
  const [unavailable, setUnavailable] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // id последнего чужого сообщения, для которого уже отправлен markRead
  const lastMarkedRef = useRef<string | null>(null);
  const activeIdRef = useRef<string | undefined>(applicationId);
  activeIdRef.current = applicationId;

  const markRead = useCallback(async (id: string) => {
    try {
      await applicationMessagesApi.markRead(id);
      window.dispatchEvent(new Event(MESSAGES_READ_EVENT));
    } catch {
      // не критично: попробуем при следующем обновлении
    }
  }, []);

  const load = useCallback(
    async (initial = false) => {
      const id = applicationId;
      if (!id) return;
      try {
        const list = await applicationMessagesApi.list(id);
        if (activeIdRef.current !== id) return; // успели переключить заявку
        // Список с сервера считаем источником истины (так пропадают и удалённые сообщения)
        setMessages(list);
        setError(null);

        // Отмечаем прочитанным, если есть чужие сообщения, которых ещё не отмечали
        const lastOther = [...list].reverse().find((m) => !m.isMine);
        if (
          lastOther &&
          lastOther.id !== lastMarkedRef.current &&
          document.visibilityState === "visible"
        ) {
          lastMarkedRef.current = lastOther.id;
          markRead(id);
        }
      } catch (err) {
        if (activeIdRef.current !== id) return;
        if (
          isAxiosError(err) &&
          [403, 404].includes(err.response?.status ?? 0)
        ) {
          setUnavailable(true);
        } else if (initial) {
          setError("Не удалось загрузить переписку");
        }
        // ошибки фонового опроса игнорируем: на экране остаётся прошлое состояние
      } finally {
        if (initial && activeIdRef.current === id) setLoading(false);
      }
    },
    [applicationId, markRead],
  );

  // Первичная загрузка и сброс при смене заявки
  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setError(null);
    setUnavailable(false);
    setSendError(null);
    lastMarkedRef.current = null;
    if (applicationId) load(true);
  }, [applicationId, load]);

  usePolling(() => load(false), POLL_MS, !!applicationId && !unavailable);

  const send = useCallback(
    async (text: string, isInternal = false): Promise<boolean> => {
      if (!applicationId) return false;
      const value = text.trim();
      if (!value) {
        setSendError("Напишите сообщение");
        return false;
      }
      setSending(true);
      setSendError(null);
      try {
        const created = await applicationMessagesApi.send(
          applicationId,
          value,
          isInternal,
        );
        setMessages((prev) => mergeMessages(prev, [created]));
        return true;
      } catch (err) {
        setSendError(
          getApiErrorMessage(
            err,
            "Не удалось отправить сообщение. Попробуйте позже.",
          ),
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [applicationId],
  );

  // Удаление сообщения (admin и moderator). Возвращает текст ошибки или null.
  const remove = useCallback(async (id: string): Promise<string | null> => {
    try {
      await applicationMessagesApi.remove(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      return null;
    } catch (err) {
      return getApiErrorMessage(err, "Не удалось удалить сообщение");
    }
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    return load(true);
  }, [load]);

  return {
    messages,
    loading,
    error,
    unavailable,
    sending,
    sendError,
    send,
    remove,
    reload,
  };
}
