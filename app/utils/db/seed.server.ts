import { getPasswordHash } from "../auth.server"
import { db } from "./index.server"
import { sessions, users } from "./schema"

// Clear database
await db.delete(sessions)
await db.delete(users)

await db.insert(users).values({
  email: "admin@admin.com",
  passwordHash: await getPasswordHash("admin"),
  role: "admin",
})

process.exit(0)
