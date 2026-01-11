
import EventTimeline from "./EventTimeline";
import SystemMap from "./SystemMap";
import { Marker } from "@/lib/markers";
import PlaybackPanel from "./PlaybackPanel";
import { PlaybackControls } from "@/lib/playback";
import { ObservedEvent } from "@/lib/events/observed/observedEvent.types";

type ObservationAreaProps = {
  controls: PlaybackControls;
  replayIndex: number;
  events: ObservedEvent[];
  activeEvent: ObservedEvent | null;
  isPlaying: boolean;
  mode: "live" | "replay";
  markers: Marker[];
  onJumpToEvent: (eventId: string) => void;
};


export default function ObservationArea({
  controls,
  replayIndex,
  events,
  activeEvent,
  isPlaying,
  mode,
  markers,
  onJumpToEvent,
}: ObservationAreaProps) {
  return (
    <div className="flex flex-col h-full">
      <div>
        <PlaybackPanel
          controls={controls}
          mode={mode}
          replayIndex={replayIndex}
          isPlaying={isPlaying}
        />
      </div>
      <div className="h-1/2 max-h-1/2 overflow-auto border-b">
        <SystemMap activeEvent={activeEvent} />
      </div>
      <div className="h-1/2 min-h-0 overflow-auto">
        <EventTimeline
          events={events}
          mode={mode}
          activeEvent={activeEvent}
          markers={markers}
          onJumpToEvent={onJumpToEvent}
        />
      </div>
    </div>
  );
}
