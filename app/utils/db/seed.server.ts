import { getPasswordHash } from "../auth.server"
import { db } from "./index.server"
import { sessions, users } from "./schema"
import chalk from "chalk"

/**
 * Reset database
 */
await db.delete(sessions)
await db.delete(users)

console.log(chalk.yellow("✔ Database reseted"))

/**
 * Create users
 */
await db.insert(users).values([
  {
    email: "admin@admin.com",
    passwordHash: await getPasswordHash("admin"),
    role: "admin",
  },
  {
    email: "user@user.com",
    passwordHash: await getPasswordHash("user"),
    role: "user",
  },
])

console.log(chalk.yellow("✔ Users created"))

console.log(chalk.green("✔ Database seeded"))

process.exit(0)
