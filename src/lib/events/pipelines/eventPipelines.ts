import { EventType } from "../sсhemas";
import { EventStage } from "../stages/eventStages";

export const EVENT_PIPELINES: Record<EventType, EventStage[]> = {
  MESSAGE_EXCHANGE: [
    "client:emit",
    "api:received",
    "redis:published",
    "ws:emitted",
    "client:received",
  ],

  USER_REGISTER: [
    "client:emit",
    "api:received",
    "db:stored",
    "client:received",
  ],

  USER_LOGIN: [
    "client:emit",
    "api:received",
    "db:stored",
    "client:received",
  ],

  USER_LOGOUT: [
    "client:emit",
    "api:received",
    "client:received",
  ],
};
