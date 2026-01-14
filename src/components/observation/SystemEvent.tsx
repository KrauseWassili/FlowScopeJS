import { cn } from "@/lib/utils/cn";
import { EventNode } from "@/lib/events/nodes/systemNodes";
import { SYSTEM_NODE_ICON } from "./SystemNodeIcons";

type Props = {
  node: EventNode;
  participated: boolean;
  outcome: "success" | "error" | null;
  highlight?: boolean;
  onClick?: () => void;
};

export function SystemEvent({ node, participated, outcome, onClick }: Props) {
  const Icon = SYSTEM_NODE_ICON[node];

  let colorClass = "text-inactive";

  if (outcome === "error") {
    colorClass = "text-error";
  } else if (outcome === "success") {
    colorClass = "text-success";
  }

  return (
    <div className="flex flex-col items-center min-w-[72px]">
      <span className="text-[10px] text-gray-400 mb-1">
        {node.toUpperCase()}
      </span>

      <div
        onClick={onClick}
        className={cn(
          "transition-all",
          onClick && "cursor-pointer hover:scale-110"
        )}
        title={onClick ? "Click to inspect event" : undefined}
      >
        <Icon
          className={cn(
            "w-12 h-12",
            colorClass,
            colorClass !== "text-inactive" && "scale-110"
          )}
          stroke="currentColor"
        />
      </div>

      <span className="text-[10px] text-gray-500 min-h-[16px] mt-1">
        {!participated ? "–" : outcome ?? "ok"}
      </span>
    </div>
  );
}
