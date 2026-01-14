"use client";

import { useEffect, useState } from "react";

import KeyboardControls from "@/components/keyboard/KeyboardControls";
import ClientArea from "@/components/client/ClientArea";
import ObservationArea from "@/components/observation/ObservationArea";

import { PlaybackControls } from "@/lib/playback/playback.types";

import { useObservedEvents } from "@/lib/events/observed/useObservedEvents";
import { useAuth } from "@/context/AuthContext";
import { TraceEvent } from "@/server/lib/trace/sсhemas";
import { Marker } from "@/lib/trace/markers/Markers";

export default function Home() {
  const { accessToken, loading } = useAuth();

  const [mode, setMode] = useState<"live" | "replay">("live");
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const observedEvents = useObservedEvents(accessToken);

  const activeEvent: TraceEvent | null =
    mode === "live"
      ? observedEvents.at(-1) ?? null
      : observedEvents[replayIndex] ?? null;

  function addMarker(traceId: string) {
    setMarkers((prev) => {
      if (prev.some((m) => m.eventId === traceId)) return prev;
      return [...prev, { eventId: traceId, createdAt: new Date() }];
    });
  }

  function jumpToEvent(traceId: string) {
    if (mode !== "replay") return;
    const index = observedEvents.findIndex((e) => e.traceId === traceId);
    if (index !== -1) setReplayIndex(index);
  }

  useEffect(() => {
    if (!isPlaying || mode !== "replay") return;

    const interval = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= observedEvents.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 600 / replaySpeed);

    return () => clearInterval(interval);
  }, [isPlaying, mode, replaySpeed, observedEvents.length]);

  const playbackControls: PlaybackControls = {
    mode: () => {
      setIsPlaying(false);
      setMode((m) => (m === "live" ? "replay" : "live"));
    },
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () =>
      setReplayIndex((p) => Math.min(p + 1, observedEvents.length - 1)),
    prev: () => setReplayIndex((p) => Math.max(p - 1, 0)),
    setSpeed: setReplaySpeed,
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <main className="h-screen grid grid-cols-2">
      <div className="h-full flex flex-col border-r">
        <ClientArea />
      </div>

      <div className="h-full flex flex-col">
        <ObservationArea
          events={observedEvents}
          markers={markers}
          onJumpToEvent={jumpToEvent}
        />
      </div>

      <KeyboardControls
        mode={mode}
        isPlaying={isPlaying}
        replaySpeed={replaySpeed}
        activeEvent={activeEvent}
        controls={playbackControls}
        addMarker={addMarker}
      />
    </main>
  );
}
