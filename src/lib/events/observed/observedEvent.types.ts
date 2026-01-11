
import { EventType } from "../sсhemas";
import { EventStage } from "../stages/eventStages";

export type ObservedEvent = {
  traceId: string;
  type: EventType; 
  stages: Partial<Record<EventStage, number>>;
};
