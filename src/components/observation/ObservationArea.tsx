import { useMemo, useState } from "react";
import EventTimeline from "./EventTimeline";
import { SystemMap } from "./SystemMap";
import { PlaybackPanel } from "./PlaybackPanel";
import { InlineEventInspector } from "./InlineEventInspector";
import { TraceEvent } from "@/lib/trace/sсhemas";
import { useReplay } from "@/hooks/useReplay";
import { Marker } from "@/lib/trace/markers/Markers";

type ObservationAreaProps = {
  events: TraceEvent[];
  markers: Marker[];
  onJumpToEvent: (traceId: string) => void;
};

function findTraceEventForNode(
  traceId: string,
  node: string,
  events: TraceEvent[]
): TraceEvent | null {
  const allForNode = events.filter(
    (e) => e.traceId === traceId && e.node === node
  );
  return allForNode.length ? allForNode[allForNode.length - 1] : null;
}

export default function ObservationArea({
  events,
  markers,
  onJumpToEvent,
}: ObservationAreaProps) {
  const replay = useReplay(events);

  const currentTraceId =
    replay.mode === "replay"
      ? replay.activeEvent?.traceId
      : events.length > 0
      ? events[events.length - 1].traceId
      : null;

  const eventsForCurrentTrace = currentTraceId
    ? events.filter((e) => e.traceId === currentTraceId)
    : [];

  const [inspectedEvent, setInspectedEvent] = useState<{
    event: TraceEvent;
    node: string;
  } | null>(null);

  return (
    <div className="flex flex-col h-full">
      <PlaybackPanel
        mode={replay.mode}
        isPlaying={replay.isPlaying}
        replayIndex={replay.index}
        controls={replay.controls}
      />

      <div className="h-1/2 overflow-auto border-b">
        <SystemMap
          mode={replay.mode}
          events={eventsForCurrentTrace}
          activeNode={
            replay.mode === "replay"
              ? replay.activeEvent?.node ?? null
              : undefined
          }
          onNodeClick={({ traceId, node }) => {
            const e = events
              .filter((e) => e.traceId === traceId && e.node === node)
              .at(-1);
            if (e) {
              setInspectedEvent({ event: e, node });
            }
          }}
        />
      </div>

      {inspectedEvent && (
        <InlineEventInspector
          event={inspectedEvent.event}
          node={inspectedEvent.node}
          onClose={() => setInspectedEvent(null)}
        />
      )}
      <div className="h-1/2 min-h-0 overflow-auto">
        <EventTimeline
          events={events}
          mode={replay.mode}
          activeEvent={replay.activeEvent}
          markers={markers}
          onJumpToEvent={onJumpToEvent}
        />
      </div>
    </div>
  );
}
