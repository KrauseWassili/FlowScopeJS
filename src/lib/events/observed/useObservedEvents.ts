import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { TraceEvent } from "@/lib/trace/sсhemas";

export function useObservedEvents(token: string | null) {
  const [events, setEvents] = useState<TraceEvent[]>([]);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:4000", {
      auth: { token },
    });

    // Получаем всю историю
    socket.on("system:history", (history: TraceEvent[]) => {
      console.log("Получена история (typeof):", typeof history);
      console.log("Получена история (полностью):", history);
      setEvents(history);
    });

    // Получаем новые события и добавляем, если их нет в массиве
    socket.on("system:event", (event: TraceEvent) => {
      setEvents((prev) => {
        // Дубликаты по traceId + node + timestamp
        const isDuplicate = prev.some(
          (e) =>
            e.traceId === event.traceId &&
            e.node === event.node &&
            e.timestamp === event.timestamp
        );
        if (isDuplicate) return prev;
        return [...prev, event];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return events;
}
