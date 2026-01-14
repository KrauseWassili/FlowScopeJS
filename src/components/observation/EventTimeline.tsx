import { cn } from "@/lib/utils/cn";
import { formatTimeMs } from "@/lib/utils/formatTimeMs";
import { SYSTEM_NODES } from "@/lib/events/nodes/systemNodes";
import { TraceEvent } from "@/lib/trace/sсhemas";
import { Marker } from "@/lib/trace/markers/Markers";

type EventTimelineProps = {
  events: TraceEvent[];
  mode: "live" | "replay";
  activeEvent: TraceEvent | null;
  markers: Marker[];
  onJumpToEvent: (traceId: string) => void;
};

function getLampStates(events: TraceEvent[]) {
  const state: Record<
    string,
    {
      wasActive: boolean;
      lastOutcome?: string;
      lastTimestamp?: number;
      hadError?: boolean;
    }
  > = {};
  for (const event of events) {
    if (!event.node || typeof event.timestamp !== "number") continue;
    const prev = state[event.node] || { wasActive: false, hadError: false };
    state[event.node] = {
      wasActive: true,
      lastOutcome: event.outcome ?? prev.lastOutcome,
      lastTimestamp: event.timestamp ?? prev.lastTimestamp,
      hadError: prev.hadError || event.outcome === "error",
    };
  }
  return state;
}

function PipelineRail({
  events,
  activeNode,
}: {
  events: TraceEvent[];
  activeNode?: string | null;
}) {
  const nodeState = getLampStates(events);
  const traceId = events[0]?.traceId;

  return (
    <div className="flex items-end gap-3 min-h-[56px]">
      {SYSTEM_NODES.map((node) => {
        const s = nodeState[node];
        const isActive = s?.wasActive;
        let colorClass = "bg-inactive";
        if (s?.hadError) colorClass = "bg-error";
        else if (isActive) colorClass = "bg-success";

        const isActiveLamp = activeNode && activeNode === node;

        return (
          <div key={node} className="flex flex-col items-center min-w-[56px]">
            <span className="text-[10px] text-gray-400 mb-1">
              {node.toUpperCase()}
            </span>

            <span
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                colorClass,
                isActiveLamp && "ring-2 ring-amber-400 scale-125"
              )}
            />

            <span className="text-[10px] text-gray-500 min-h-[16px] mt-1">
              {s?.lastTimestamp ? formatTimeMs(s.lastTimestamp) : "–"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EventTimeline({
  events,
  mode,
  activeEvent,
  markers,
  onJumpToEvent,
}: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-center">
        Нет событий для этого трейса.
      </div>
    );
  }

  const eventsByTrace = events.reduce<Record<string, TraceEvent[]>>(
    (acc, e) => {
      acc[e.traceId] ??= [];
      acc[e.traceId].push(e);
      return acc;
    },
    {}
  );

  return (
    <ul className="overflow-auto max-h-full divide-y divide-gray-200">
      {Object.entries(eventsByTrace).map(([traceId, traceEvents]) => {
        const isActiveRow =
          mode === "replay" && activeEvent?.traceId === traceId;

        const activeNode = isActiveRow ? activeEvent?.node ?? null : null;

        const isMarked = markers.some((m) => m.eventId === traceId);

        return (
          <li
            key={traceId}
            className={cn(
              "px-2 py-2 transition-colors",
              isMarked &&
                mode === "replay" &&
                "cursor-pointer hover:bg-amber-100",
              isActiveRow && "bg-amber-200",
              isMarked && "border-l-4 border-amber-500"
            )}
            onClick={() => {
              if (isMarked && mode === "replay") {
                onJumpToEvent(traceId);
              }
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-xs text-gray-500">{traceId}</span>
              <span className="text-xs font-semibold">
                {traceEvents[0]?.type}
              </span>
            </div>

            {/* ✅ Pipeline восстановлен */}
            <PipelineRail events={traceEvents} activeNode={activeNode} />
          </li>
        );
      })}
    </ul>
  );
}
