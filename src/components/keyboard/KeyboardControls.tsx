import { PlaybackControls } from "@/lib/playback/playback.types";
import { TraceEvent } from "@/server/lib/trace/sсhemas";
import { useEffect } from "react";

type KeyboardControlsProps = {
  mode: "live" | "replay";
  isPlaying: boolean;
  replaySpeed: number;
  activeEvent: TraceEvent | null;
  controls: PlaybackControls;
  addMarker: (eventId: string) => void;
};
export default function KeyboardControls({
  mode,
  isPlaying,
  replaySpeed,
  activeEvent,
  controls,
  addMarker,
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
          isPlaying ? controls.pause() : controls.play();
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

        case "m":
        case "M":
          if (activeEvent) {
            addMarker(activeEvent.traceId);
          }
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, isPlaying, replaySpeed, activeEvent, controls, addMarker]);

  return null;
}
