import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().trim().min(1).optional(),
  PORT: z.coerce.number().int().nonnegative().default(3001),
  OPENAI_API_KEY: z.string().trim().min(1).optional(),
  GEMINI_API_KEY: z.string().trim().min(1).optional(),
  MISTRAL_API_KEY: z.string().trim().min(1).optional(),
  OLLAMA_BASE_URL: z
    .string()
    .trim()
    .url('OLLAMA_BASE_URL must be a valid URL')
    .default('http://localhost:11434'),
  NEXUS_BASE_URL: z
    .string()
    .trim()
    .url('NEXUS_BASE_URL must be a valid URL')
    .default('http://localhost:3000'),
  NEXUS_WEB_URL: z
    .string()
    .trim()
    .url('NEXUS_WEB_URL must be a valid URL')
    .default('http://localhost:3000'),
  JWT_SECRET: z.string().trim().min(1).optional(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;
export type NodeEnv = EnvConfig['NODE_ENV'];
export type LogLevel = EnvConfig['LOG_LEVEL'];

export interface EnvSource {
  [key: string]: string | undefined;
}

export function loadConfig(env: EnvSource = process.env): EnvConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return result.data;
}

export const config: EnvConfig = loadConfig();

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';

export function isLogLevelEnabled(level: LogLevel): boolean {
  const order = ['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];
  const configured = order.indexOf(config.LOG_LEVEL);
  const requested = order.indexOf(level);
  return configured >= 0 && requested <= configured;
}