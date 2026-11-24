import { useEffect, useRef } from "react";

// Вызывает callback раз в intervalMs, пока вкладка видима,
// и сразу при возврате на вкладку.
export function usePolling(
  callback: () => void,
  intervalMs: number,
  enabled = true,
) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const run = () => {
      if (document.visibilityState === "visible") ref.current();
    };
    const id = setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", run);
    };
  }, [intervalMs, enabled]);
}
