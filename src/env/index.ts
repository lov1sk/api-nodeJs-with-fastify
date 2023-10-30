import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test", override: true });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3434),
});

const provisoryEnv = envSchema.safeParse(process.env);

if (provisoryEnv.success === false) {
  throw new Error(
    `Invalid environment variables ${JSON.stringify(
      provisoryEnv.error.format()
    )}`
  );
}

export const env = provisoryEnv.data;
