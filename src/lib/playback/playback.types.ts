export type PlaybackControls = {
  toggleMode: () => void;
  play_pause: () => void;
  next: () => void;
  prev: () => void;
  setSpeed: (speed: number) => void;
};
