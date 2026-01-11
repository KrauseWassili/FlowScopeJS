import { EventStage } from "../stages/eventStages";

export const STAGE_LABELS: Record<EventStage, string> = {
  "client:emit": "Emit",
  "api:received": "API",
  "redis:published": "Redis",
  "ws:emitted": "WS",
  "client:received": "Recv",
  "db:stored": "DB",
};
