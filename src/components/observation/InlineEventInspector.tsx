import { TraceEvent } from "@/lib/trace/sсhemas";
import { eventSchemas } from "@/lib/trace/sсhemas";
import { formatTimeMs } from "@/lib/utils/formatTimeMs";
import { baseEventSchema } from "@/lib/trace/sсhemas/baseEventSchema";

type Props = {
  event: TraceEvent;
  node: string;
  onClose: () => void;
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

export function InlineEventInspector({ event, node, onClose }: Props) {
  const exclude = ["event", "meta"];
  const keys = Object.keys(event).filter((k) => !exclude.includes(k));

  return (
    <div className="mt-3 rounded border bg-white shadow-sm text-sm">
      <div className="flex justify-between items-center px-3 py-2 border-b">
        <div className="font-semibold">
          {event.type}
          <span className="ml-2 text-xs text-gray-500">@{event.node}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <div className="p-3 space-y-2">
        {keys.map((key) => (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-gray-500">{key}</div>
            <div className="font-mono text-xs">
              {renderValue(key, (event as any)[key])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
