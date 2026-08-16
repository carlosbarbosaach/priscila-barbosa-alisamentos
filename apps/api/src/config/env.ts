import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const envPath = fileURLToPath(
  new URL("../../.env", import.meta.url),
);

config({
  path: envPath,
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .max(65535)
    .default(3333),

  HOST: z
    .string()
    .min(1)
    .default("0.0.0.0"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Variáveis de ambiente inválidas:",
    parsedEnv.error.issues,
  );

  process.exit(1);
}

export const env = parsedEnv.data;