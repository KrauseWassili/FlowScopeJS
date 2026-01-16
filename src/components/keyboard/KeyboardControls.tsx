import { PlaybackControls } from "@/lib/playback/playback.types";
import { TraceEvent } from "@/lib/trace/sсhemas";
import { useEffect } from "react";

type KeyboardControlsProps = {
  mode: "live" | "replay";
  isPlaying: boolean;
  replaySpeed: number;
  activeEvent: TraceEvent | null;
  controls: PlaybackControls;
};
export default function KeyboardControls({
  mode,
  isPlaying,
  replaySpeed,
  activeEvent,
  controls,
}: KeyboardControlsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (mode !== "replay") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          controls.play_pause();
          break;

        case "ArrowRight":
          controls.next();
          break;

        case "ArrowLeft":
          controls.prev();
          break;

        case "ArrowUp":
          controls.setSpeed(Math.min(replaySpeed * 2, 4));
          break;

        case "ArrowDown":
          controls.setSpeed(Math.max(replaySpeed / 2, 0.25));
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, isPlaying, replaySpeed, activeEvent, controls]);

  return null;
}
