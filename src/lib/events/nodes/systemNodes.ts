export const SYSTEM_NODES = [
  "client_emit",
  "ws",
  "redis",
  "client_receive",
  "api",
  "db",
] as const;

export type EventNode = typeof SYSTEM_NODES[number];
