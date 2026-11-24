import { useEffect } from "react";
import { create } from "zustand";
import { applicationMessagesApi } from "@/api/applicationMessages";
import { UnreadMap } from "@/types";

// Событие «ветка прочитана»: useApplicationThread вызывает его после markRead,
// чтобы бейджи обновились сразу, не дожидаясь опроса.
export const MESSAGES_READ_EVENT = "application-messages:read";

const POLL_MS = 60_000;

interface UnreadState {
  map: UnreadMap;
  setMap: (map: UnreadMap) => void;
}

const useUnreadStore = create<UnreadState>((set) => ({
  map: {},
  setMap: (map) => set({ map }),
}));

async function refreshUnread() {
  try {
    useUnreadStore.getState().setMap(await applicationMessagesApi.unread());
  } catch {
    // бейджи не критичны: при ошибке оставляем прошлое значение
  }
}

const onVisible = () => {
  if (document.visibilityState === "visible") refreshUnread();
};

// Опрос один на всё приложение, сколько бы компонентов ни использовало хук
let subscribers = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function start() {
  refreshUnread();
  timer = setInterval(onVisible, POLL_MS);
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener(MESSAGES_READ_EVENT, refreshUnread);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onVisible);
  window.removeEventListener(MESSAGES_READ_EVENT, refreshUnread);
}

// enabled = false для ролей без доступа к переписке (например, работодатель)
export function useUnreadMessages(enabled = true) {
  const map = useUnreadStore((s) => s.map);

  useEffect(() => {
    if (!enabled) return;
    subscribers += 1;
    if (subscribers === 1) start();
    return () => {
      subscribers -= 1;
      if (subscribers === 0) stop();
    };
  }, [enabled]);

  const total = Object.values(map).reduce<number>((sum, n) => sum + n, 0);
  return { map, total, refresh: refreshUnread };
}
