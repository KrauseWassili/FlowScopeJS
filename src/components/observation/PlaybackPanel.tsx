import { cn } from "@/lib/utils/cn";

type Props = {
  mode: "live" | "replay";
  isPlaying: boolean;
  replayIndex: number;
  speed: number;
  controls: {
    toggleMode: () => void;
    play_pause: () => void;
    next: () => void;
    prev: () => void;
    setSpeed: (v: number) => void;    
  };
  clearEvents: () => void;
};

export function PlaybackPanel({
  mode,
  isPlaying,
  replayIndex,
  speed,
  controls,
  clearEvents
}: Props) {
  return (
    <div className="p-4 border-border border-b bg-panel">
      <div className="flex gap-2 justify-center">
        <button onClick={controls.toggleMode} className="btn">
          {mode.toUpperCase()}
        </button>
        <button
          onClick={controls.prev}
          disabled={mode === "live"}
          className="btn"
        >
          ⏮
        </button>
        <button
          onClick={controls.play_pause}
          disabled={mode === "live"}
          className={cn("btn", isPlaying && "bg-active!")}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={controls.next}
          disabled={mode === "live"}
          className="btn"
        >
          ⏭
        </button>

        <button
          onClick={() => controls.setSpeed(0.5)}
          className={cn("btn", speed === 0.5 && "bg-active!")}
        >
          0.5×
        </button>
        <button
          onClick={() => controls.setSpeed(1)}
          className={cn("btn", speed === 1 && "bg-active!")}
        >
          1×
        </button>
        <button
          onClick={() => controls.setSpeed(2)}
          className={cn("btn", speed === 2 && "bg-active!")}
        >
          2×
        </button>
        <div className="pl-10">
          <button
            onClick={clearEvents}
            className="btn w-30! border-attention!"
          >
            Clear events
          </button>
        </div>
      </div>
    </div>
  );
}
