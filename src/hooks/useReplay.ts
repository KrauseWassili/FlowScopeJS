import { useEffect, useState } from "react";
import { TraceEvent } from "@/lib/trace/sсhemas";

export function useReplay(events: TraceEvent[]) {
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [index, setIndex] = useState(0);

  const playedEvents = events.slice(0, index);

  const activeEvent =
    mode === "replay" && index > 0
      ? events[index - 1]
      : null;

  useEffect(() => {
    if (mode !== "replay" || !isPlaying) return;
    if (index >= events.length) return;

    const delay = 300 / speed;

    const id = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, events.length));
    }, delay);

    return () => clearTimeout(id);
  }, [mode, isPlaying, speed, index, events.length]);

  const controls = {
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),

    next: () =>
      setIndex((i) => Math.min(i + 1, events.length)),

    prev: () =>
      setIndex((i) => Math.max(i - 1, 0)),

    setSpeed,

    toggleMode: () => {
      setMode((m) => (m === "live" ? "replay" : "live"));
      setIsPlaying(false);
      setIndex(0); 
    },
  };

  return {
    mode,
    isPlaying,
    speed,
    index,

    playedEvents, 
    activeEvent,  

    controls,
  };
}
