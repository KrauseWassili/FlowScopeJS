import { SystemEvent } from "@/lib/events";
import { useEffect, useState } from "react";

type SystemMapProps = {
  events: SystemEvent[];
};

export default function SystemMap({ events }: SystemMapProps) {
  const [activeNodes, setActiveNodes] = useState<String[]>([]);

  const lastEvent = events.at(-1);

  useEffect(() => {
    if (!lastEvent) return;

    setActiveNodes([lastEvent.from, lastEvent.to]);

    const timer = setTimeout(() => {
      setActiveNodes([]);
    }, 400);

    return () => clearTimeout(timer);
  }, [events.length]);

  if (!lastEvent || lastEvent.type !== "MESSAGE_SENT") {
    return null;
  }

  const isUserActive = activeNodes.includes("User");
  const isMessengerActive = activeNodes.includes("Messenger_Window");

  return (
    <div className="flex gap-4">
      <div className={isUserActive ? "bg-amber-300" : ""}>
        [{lastEvent.from}]
      </div>
      <div className={isMessengerActive ? "bg-amber-300" : ""}>
        [{lastEvent.to}]
      </div>
    </div>
  );
}
