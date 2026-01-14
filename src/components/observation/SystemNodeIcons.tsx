import { EventNode } from "@/lib/events/nodes/systemNodes";
import {
  Monitor,
  RadioTower,
  Server,
  Database,
  HardDrive,
} from "lucide-react";


export const SYSTEM_NODE_ICON: Record<EventNode, React.ElementType> = {
  client_emit: Monitor,
  ws: RadioTower,
  api: Server,
  redis: HardDrive,
  db: Database,
  client_receive: Monitor,
};
