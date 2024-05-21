import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  COOKIE_SECRET: z.string(),
  HONEYPOT_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)
