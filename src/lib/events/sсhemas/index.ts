import { z } from "zod";

export const messageExchangeSchema = z.object({
  type: z.literal("MESSAGE_EXCHANGE"),
  from: z.string(),
  to: z.string(),
  payload: z.object({
    text: z.string(),
  }),
});

export const userLoginSchema = z.object({
  type: z.literal("USER_LOGIN"),
  userId: z.string(),
  method: z.enum(["password", "oauth"]),
});

export const userRegisterSchema = z.object({
  type: z.literal("USER_REGISTER"),
  userId: z.string(),
  email: z.string().email(),
});

export const userLogoutSchema = z.object({
  type: z.literal("USER_LOGOUT"),
  userId: z.string(),
});

export const eventSchemas = {
  MESSAGE_EXCHANGE: messageExchangeSchema,
  USER_LOGIN: userLoginSchema,
  USER_REGISTER: userRegisterSchema,
  USER_LOGOUT: userLogoutSchema,
} as const;

export type EventType = keyof typeof eventSchemas;
