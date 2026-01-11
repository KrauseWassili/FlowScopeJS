"use client";

import KeyboardControls from "@/components/KeyboardControls";
import ClientArea from "@/components/client/ClientArea";
import ObservationArea from "@/components/observation/ObservationArea";
import { useObservedEvents } from "@/hooks/useObservedEvents";
import { Marker } from "@/lib/markers";
import { PlaybackControls } from "@/lib/playback";
import { useEffect, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const { observedList } = useObservedEvents();

  const activeEvent =
    mode === "live"
      ? observedList.at(-1) ?? null
      : observedList[replayIndex] ?? null;

  function addMarker(traceId: string) {
    setMarkers((prev) => {
      if (prev.some((m) => m.eventId === traceId)) return prev;
      return [...prev, { eventId: traceId, createdAt: new Date() }];
    });
  }

  function jumpToEvent(traceId: string) {
    if (mode !== "replay") return;
    const index = observedList.findIndex((e) => e.traceId === traceId);
    if (index !== -1) setReplayIndex(index);
  }

  useEffect(() => {
    if (!isPlaying || mode !== "replay") return;

    const interval = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= observedList.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 600 / replaySpeed);

    return () => clearInterval(interval);
  }, [isPlaying, mode, replaySpeed, observedList.length]);

  const playbackControls: PlaybackControls = {
    mode: () => {
      setIsPlaying(false);
      setMode((m) => (m === "live" ? "replay" : "live"));
    },
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () =>
      setReplayIndex((p) => Math.min(p + 1, observedList.length - 1)),
    prev: () => setReplayIndex((p) => Math.max(p - 1, 0)),
    setSpeed: setReplaySpeed,
  };

  return (
    <main className="h-screen grid grid-cols-2">
      <div className="h-full flex flex-col border-r">
        <ClientArea />
      </div>

      <div className="h-full flex flex-col">
        <ObservationArea
          replayIndex={replayIndex}
          controls={playbackControls}
          events={observedList}
          mode={mode}
          isPlaying={isPlaying}
          activeEvent={activeEvent}
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
