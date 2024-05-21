import { pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"

export const roles = pgEnum("roles", ["user", "admin"])

export const users = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roles("role").notNull().default("user"),
})

export type User = typeof users.$inferSelect

export type Role = User["role"]

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    mode: "date",
  }).notNull(),
})

export type Session = typeof sessions.$inferSelect

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))
