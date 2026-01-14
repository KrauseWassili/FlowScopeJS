import { TraceEvent } from "@/lib/trace/sсhemas";
import { useEffect, useState} from "react";

export function useTraceEvents(traceId: string) {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  useEffect(() => {
    if (!traceId) return;
    fetch(`/api/trace/${traceId}`)
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((data) => {
        if (data && Array.isArray(data.events)) setEvents(data.events);
        else setEvents([]);
      })
      .catch(() => setEvents([]));
  }, [traceId]);
  return { events };
}
