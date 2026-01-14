import { TraceEvent } from "./sсhemas";

export async function sendTraceEvent(
  event: TraceEvent,
  apiUrl = "http://host.docker.internal:3000/api/trace"
): Promise<void> {
  console.log("sendTraceEvent payload:", event);
  await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  });
}
