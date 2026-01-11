import { EventStage } from "../stages/eventStages";
import { SystemNode } from "./systemNodes";

export const STAGE_TO_NODE: Partial<Record<EventStage, SystemNode>>
 = {
  "client:emit": "client",
  "api:received": "api",
  "redis:published": "redis",
  "db:stored": "db",
  "client:received": "client",
};

export const NODE_LABEL: Record<SystemNode, string> = {
  client: "Client",
  api: "API",
  redis: "Redis",
  db: "DB",
  ws: "WS",
  infra: "Infra",
};
