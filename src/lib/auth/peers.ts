import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { ne } from "drizzle-orm";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

export async function loadPeers(selfId: string, traceId: string) {
  try {
    const users = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .where(ne(profiles.id, selfId));

    return users;
  } catch (err) {
    sendTraceEvent({
      traceId,
      type: "USER_SELECT",
      node: "db",
      actorId: selfId,
      event: "DB: Error select peers",
      error: { message: err instanceof Error ? err.message : String(err) },
      outcome: "error",
      timestamp: Date.now(),
    });

    throw err;
  }
}
