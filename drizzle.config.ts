import { defineConfig } from "drizzle-kit";
import { env } from "~/utils/env";

export default defineConfig({
  schema: "./app/utils/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  out: "drizzle",
  verbose: true,
  strict: true,
});
