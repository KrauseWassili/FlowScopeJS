import { z } from "zod";
import { baseEventSchema } from "./baseEventSchema";

export const messageExchangeSchema = baseEventSchema.extend({
  type: z.literal("MESSAGE_EXCHANGE"),
  payload: z.object({
    text: z.string(),
  }),
});

export const userLoginSchema = baseEventSchema.extend({
  type: z.literal("USER_LOGIN"),
  payload: z.object({
    method: z.enum(["password", "oauth"]).optional(),
  }),
});

export const userRegisterSchema = baseEventSchema.extend({
  type: z.literal("USER_REGISTER"),
  payload: z.object({
    email: z.string().email().optional(),
  }),
});

export const userLogoutSchema = baseEventSchema.extend({
  type: z.literal("USER_LOGOUT"),
  payload: z.object({}).optional(),
});

export const eventSchemas = {
  MESSAGE_EXCHANGE: messageExchangeSchema,
  USER_LOGIN: userLoginSchema,
  USER_REGISTER: userRegisterSchema,
  USER_LOGOUT: userLogoutSchema,
} as const;

export type EventType = keyof typeof eventSchemas;

export type TraceEvent =
  | z.infer<typeof messageExchangeSchema>
  | z.infer<typeof userLoginSchema>
  | z.infer<typeof userRegisterSchema>
  | z.infer<typeof userLogoutSchema>;