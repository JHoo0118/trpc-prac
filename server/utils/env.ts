import { z } from "zod";

import "dotenv/config";

const envSchema = z.object({
  CLIENT_BASE_URL: z.string(),
  SERVER_BASE_URL: z.string(),
  AUTH_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
