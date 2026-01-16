"use client";

import { useEffect, useState } from "react";

import KeyboardControls from "@/components/keyboard/KeyboardControls";
import ClientArea from "@/components/client/ClientArea";
import ObservationArea from "@/components/observation/ObservationArea";

import { PlaybackControls } from "@/lib/playback/playback.types";

import { useObservedEvents } from "@/lib/events/observed/useObservedEvents";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/auth/supabaseClient";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";
import Header from "@/components/header/Header";

export default function Home() {
  const { accessToken, loading } = useAuth();

  const observedEvents = useObservedEvents(accessToken);

  // function jumpToEvent(traceId: string) {
  //   if (mode !== "replay") return;
  //   const index = observedEvents.findIndex((e) => e.traceId === traceId);
  //   if (index !== -1) setReplayIndex(index);
  // }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const method: "password" | "oauth" =
        session?.user.app_metadata?.provider === "google"
          ? "oauth"
          : "password";

      if (event === "SIGNED_IN" && session?.user) {
        sendTraceEvent({
          traceId: crypto.randomUUID(),
          type: "USER_LOGIN",
          node: "client_1",
          actorId: session.user.id,
          event: session.user.email
            ? "login success"
            : "login success (no email)",
          payload: {
            method,
            email: session.user.email,
          },
          outcome: "success",
          timestamp: Date.now(),
        });
      }
      if (event === "SIGNED_OUT") {
        sendTraceEvent({
          traceId: crypto.randomUUID(),
          type: "USER_LOGOUT",
          node: "client_1",
          actorId: session?.user?.id ?? "",
          event: "logout",
          outcome: "success",
          timestamp: Date.now(),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-[1fr_2fr] min-h-0">
        <div className="flex flex-col border-border border-r min-w-160 min-h-0">
          <ClientArea />
        </div>

        <div className="h-full flex flex-col min-h-0 min-w-190">
          <ObservationArea events={observedEvents} />
        </div>
      </main>
    </div>
  );
}
