import { SYSTEM_NODES, EventNode } from "@/lib/events/nodes/systemNodes";
import { SystemEvent } from "./SystemEvent";
import { TraceEvent } from "@/lib/trace/sсhemas";

type Props = {
  mode: "live" | "replay";
  events: TraceEvent[];
  activeNode?: string | null;
  onNodeClick: (params: { traceId: string; node: string }) => void;
};

export function SystemMap({ mode, events, activeNode, onNodeClick }: Props) {
  const lastEventByNode = new Map<EventNode, TraceEvent>();
  for (const event of events) {
    if (!event.node) continue;
    lastEventByNode.set(event.node as EventNode, event);
  }

  return (
    <div className="relative w-full py-8">
      {/* НОДЫ */}
      <div className="flex justify-between px-6">
        {SYSTEM_NODES.map((node) => {
          const participated =
            mode === "live" ? lastEventByNode.has(node) : activeNode === node;

          const outcome =
            mode === "live"
              ? lastEventByNode.get(node)?.outcome ?? null
              : activeNode === node
              ? events.find((e) => e.node === node)?.outcome ?? null
              : null;

          return (
            <div key={node} className="flex flex-col items-center">
              <SystemEvent
                node={node}
                participated={participated}
                outcome={outcome}
                onClick={() => {
                  const lastEvent = lastEventByNode.get(node);
                  if (lastEvent) {
                    onNodeClick({
                      traceId: lastEvent.traceId,
                      node,
                    });
                  }
                }}
              />
              <div
                className={[
                  "w-1 h-6 mt-2 transition-colors",
                  participated
                    ? outcome === "error"
                      ? "bg-timeline-error"
                      : "bg-timeline-success"
                    : "bg-gray-300 opacity-30",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>

      <div className="relative mt-0">
        <div className="h-1 rounded mx-4 bg-gray-300" />
      </div>
    </div>
  );
}
