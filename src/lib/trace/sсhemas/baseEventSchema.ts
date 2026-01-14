import { z } from "zod";

export const baseEventSchema = z.object({
  traceId: z.string().uuid(),
  type: z.string(),
  actorId: z.string(),
  dialogId: z.string().optional(), 
  node: z.string(),     
  event: z.string().optional(),   
  timestamp: z.number(),
  outcome: z.enum(["success", "error"]).optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
    })
    .optional(),
  payload: z.record(z.string(), z.unknown()).optional(), 
});
