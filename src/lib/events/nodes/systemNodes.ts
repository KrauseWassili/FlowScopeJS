export const SYSTEM_NODES = [
  "client_1",
  "ws",
  "redis",
  "client_2",
  "api",
  "db",
] as const;

export type EventNode = typeof SYSTEM_NODES[number];
