import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),          
  email: text("email").notNull(),      
  fullName: text("full_name"),          
  avatarUrl: text("avatar_url"),        
  createdAt: timestamp("created_at").defaultNow(),
});


export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    from: text("from").notNull(),
    to: text("to").notNull(),
    payload: jsonb("payload").notNull(),
    timestamp: timestamp("timestamp", {withTimezone: true}).notNull().defaultNow(),
})