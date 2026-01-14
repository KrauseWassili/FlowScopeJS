import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { TraceEvent } from "@/lib/trace/sсhemas";

export function useObservedEvents(token: string | null) {
  const [eventsByTrace, setEventsByTrace] = useState<Record<string, TraceEvent[]>>({});

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:4000", {
      auth: { token },
    });

    socket.on("system:event", (event: TraceEvent) => {
      setEventsByTrace(prev => {
        const arr = prev[event.traceId] ?? [];
        const isDuplicate = arr.some(
          (e) => e.node === event.node && e.timestamp === event.timestamp
        );
        if (isDuplicate) return prev;
        return {
          ...prev,
          [event.traceId]: [...arr, event],
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return Object.values(eventsByTrace).flat();
}
