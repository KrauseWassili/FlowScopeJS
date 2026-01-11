import { NextResponse } from "next/server";
import { EVENT_PIPELINES } from "@/lib/events/pipelines/eventPipelines";
import { isEventType } from "@/lib/events/guards/isEventType";
import Redis from "ioredis";
import { eventSchemas } from "@/lib/events/sсhemas";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});

export async function POST(req: Request) {
  const body: unknown = await req.json();

  if (
    typeof body !== "object" ||
    body === null ||
    !("type" in body)
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { type } = body as { type: unknown };

  if (!isEventType(type)) {
    return NextResponse.json(
      { error: "Unknown event type" },
      { status: 400 }
    );
  }

  const schema = eventSchemas[type];
  const pipeline = EVENT_PIPELINES[type];

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const traceId = crypto.randomUUID();

  await redis.publish(
    "system-events",
    JSON.stringify({
      traceId,
      type,
      stage: "api:received",
      timestamp: Date.now(),
      payload: parsed.data,
    })
  );

  return NextResponse.json({ traceId });
}
