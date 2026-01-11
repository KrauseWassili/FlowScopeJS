import { useEffect, useMemo, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { SystemEvent } from "@/lib/events/system/systemEvent.type";
import { ObservedEvent } from "@/lib/events/observed/observedEvent.types";

export function useObservedEvents() {
  const { socket } = useSocket();
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handler = (event: SystemEvent) => {
      console.log("[UI] system:event", event);
      setSystemEvents((prev) => [...prev, event]);
    };

    socket.on("system:event", handler);
    return () => {
      socket.off("system:event", handler);
    };
  }, [socket]);

  const observedList = useMemo(() => {
    const map = new Map<string, ObservedEvent>();

    for (const e of systemEvents) {
      if (!map.has(e.traceId)) {
        map.set(e.traceId, {
          traceId: e.traceId,
          type: e.type,
          stages: {},
        });
      }
      map.get(e.traceId)!.stages[e.stage] = e.timestamp;
    }

    return Array.from(map.values());
  }, [systemEvents]);

  return { observedList };
}
