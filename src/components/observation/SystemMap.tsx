import { SYSTEM_NODES, EventNode } from "@/lib/events/nodes/systemNodes";
import { SystemEvent } from "./SystemEvent";
import { TraceEvent } from "@/lib/trace/sсhemas";
import { cn } from "@/lib/utils/cn";

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
    <div className="relative w-full py-8 border-border border-b">
      {/* NODES */}
      <div className="flex justify-center gap-8 px-6">
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
                style={{ boxShadow: "-1px 1px 1px 0 rgba(0,0,0,0.65)" }}
                className={cn(
                  "w-1 h-6 rounded-t-md mt-2 transition-colors",
                  participated
                    ? outcome === "error"
                      ? "bg-error"
                      : "bg-success"
                    : "bg-gray-300"
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="relative mt-0">
        <div 
        style={{ boxShadow: "-1px 1px 1px 0 rgba(0,0,0,0.65)" }}
        className="h-2 rounded mx-4 bg-gray-300" />
      </div>
    </div>
  );
}
