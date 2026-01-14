import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { ne } from "drizzle-orm";

export async function loadPeers(selfId: string) {
  return db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(ne(profiles.id, selfId));
}
