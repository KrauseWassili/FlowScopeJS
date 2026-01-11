export type EventStage =
  | "client:emit"
  | "api:received"
  | "redis:published"
  | "ws:emitted"
  | "client:received"
  | "db:stored";
