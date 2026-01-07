import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    from: text("from").notNull(),
    to: text("to").notNull(),
    payload: jsonb("payload").notNull(),
    timestamp: timestamp("timestamp", {withTimezone: true}).notNull().defaultNow(),
})