import { eventSchemas, EventType } from "../sсhemas";


export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && value in eventSchemas;
}
