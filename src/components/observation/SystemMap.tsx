import { useEffect, useState } from "react";
import EventFlow from "./EventFlow";
import { ObservedEvent } from "@/lib/events/observed/observedEvent.types";
import { EventStage } from "@/lib/events/stages/eventStages";
import { NODE_LABEL, STAGE_TO_NODE } from "@/lib/events/systemMap/systemMapConfig";
import { SystemNode } from "@/lib/events/systemMap/systemNodes";

type SystemMapProps = {
  activeEvent: ObservedEvent | null;
};

export default function SystemMap({ activeEvent }: SystemMapProps) {
  const [activeNodes, setActiveNodes] = useState<SystemNode[]>([]);

  useEffect(() => {
    if (!activeEvent) return;

    const nodes: SystemNode[] = [];

    for (const stage in activeEvent.stages) {
      const node = STAGE_TO_NODE[stage as EventStage];
      if (node) {
        nodes.push(node);
      }
    }

    setActiveNodes(nodes);

    const timer = setTimeout(() => setActiveNodes([]), 400);
    return () => clearTimeout(timer);
  }, [activeEvent]);

  if (!activeEvent) return null;

  const direction =
    activeEvent.stages["client:emit"] && !activeEvent.stages["client:received"]
      ? "forward"
      : "forward";

  return (
    <>
      <div className={activeNodes.includes("client") ? "bg-amber-300" : ""}>
        [{NODE_LABEL.client}]
      </div>

      <EventFlow active={activeNodes.length > 0} direction={direction} />

      <div className={activeNodes.includes("api") ? "bg-amber-300" : ""}>
        [{NODE_LABEL.api}]
      </div>

      <div className={activeNodes.includes("redis") ? "bg-amber-300" : ""}>
        [{NODE_LABEL.redis}]
      </div>
    </>
  );
}
