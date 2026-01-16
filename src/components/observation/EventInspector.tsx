import { TraceEvent } from "@/lib/trace/sсhemas";
import { eventSchemas } from "@/lib/trace/sсhemas";
import { formatTimeMs } from "@/lib/utils/formatTimeMs";
import { baseEventSchema } from "@/lib/trace/sсhemas/baseEventSchema";

type Props = {
  event: TraceEvent;
  node: string;
};

function renderValue(key: string, value: unknown) {
  if (value == null) return "—";
  if (key === "timestamp" && typeof value === "number") {
    return formatTimeMs(value);
  }
  if (typeof value === "object") {
    return (
      <pre className="max-h-32 overflow-auto rounded bg-gray-100 p-2 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
}

export function EventInspector({ event }: Props) {
  const exclude = ["event", "meta"];
  const keys = Object.keys(event).filter((k) => !exclude.includes(k));

  return (
    <div className="text-sm min-w-60 max-w-full">
      <div className="p-3 space-y-2 border-border  border-b">
        <div className="grid grid-cols-[120px_1fr] gap-2 font-semibold">
          <div className="text-title  text-right pr-2">{event.type}</div>
          <div className="text-value">@{event.node}</div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {keys.map((key) => (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-title  text-right pr-2">{key}</div>
            <div className="text-value">
              {renderValue(key, (event as any)[key])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
