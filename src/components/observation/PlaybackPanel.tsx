type Props = {
  mode: "live" | "replay";
  isPlaying: boolean;
  replayIndex: number;
  controls: {
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    setSpeed: (v: number) => void;
    toggleMode: () => void;
  };
};

export function PlaybackPanel({
  mode,
  isPlaying,
  replayIndex,
  controls,
}: Props) {
  return (
    <div className="p-2 border-b">
      <div className="text-sm mb-2">
        Mode: <b>{mode}</b> · Event #{replayIndex} ·{" "}
        {isPlaying ? "Playing" : "Paused"}
      </div>

      <div className="flex gap-2 items-center">
        <button onClick={controls.toggleMode}>Toggle mode</button>
        <button onClick={controls.prev} disabled={mode === "live"}>⏮</button>
        <button onClick={controls.pause} disabled={mode === "live"}>⏸</button>
        <button onClick={controls.play} disabled={mode === "live"}>▶</button>
        <button onClick={controls.next} disabled={mode === "live"}>⏭</button>

        <button onClick={() => controls.setSpeed(0.5)}>0.5×</button>
        <button onClick={() => controls.setSpeed(1)}>1×</button>
        <button onClick={() => controls.setSpeed(2)}>2×</button>
      </div>
    </div>
  );
}
