import { TraceEvent } from "./sсhemas";



export async function sendTraceEvent(
  event: TraceEvent,
): Promise<void> {
  console.log("sendTraceEvent payload:", event);
  const apiUrl =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/trace`
    : "/api/trace";
  await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  });
}
