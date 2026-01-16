import { NextResponse } from "next/server";
import Redis from "ioredis";
import { isEventType } from "@/lib/events/guards/isEventType";
import { eventSchemas } from "@/lib/trace/sсhemas";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});

const STREAM = "system-events";

export async function POST(req: Request) {
  const body: unknown = await req.json();

  if (typeof body !== "object" || body === null || !("type" in body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rawType = (body as any).type;
  if (!isEventType(rawType)) {
    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  }

  const schema = eventSchemas[rawType];
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const { traceId, type, node } = parsed.data;

  console.log("TRACE INGEST:", traceId, type);

  await redis.xadd(
  STREAM,
  "*",
  "event",
  JSON.stringify(parsed.data)
);


  return NextResponse.json({ ok: true, traceId });
}
