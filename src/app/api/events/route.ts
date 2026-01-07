import { eventsStore } from "@/lib/MemoryStore";
import { systemEventShema } from "@/lib/shemas/systemEvent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = systemEventShema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const event = {
    ...parsed.data,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  eventsStore.push(event);

  return NextResponse.json({ ok: true });
}

export async function GET() {
    return NextResponse.json(eventsStore);
}