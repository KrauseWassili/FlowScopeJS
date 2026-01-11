import { NextResponse } from "next/server";
import { loadPeers } from "@/lib/peers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const selfId = searchParams.get("selfId");

  if (!selfId) {
    return NextResponse.json(
      { error: "selfId is required" },
      { status: 400 }
    );
  }

  const users = await loadPeers(selfId);
  return NextResponse.json(users);
}
