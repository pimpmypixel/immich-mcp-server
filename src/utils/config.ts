import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration schema with validation
const ConfigSchema = z.object({
  IMMICH_API_KEY: z.string().min(1, 'Immich API key is required'),
  IMMICH_INSTANCE_URL: z.string().url('Valid Immich instance URL is required'),
  PORT: z.coerce.number().default(8000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CACHE_TTL: z.coerce.number().default(300), // 5 minutes default
});

export type Config = z.infer<typeof ConfigSchema>;

// Parse and validate configuration
export const config: Config = ConfigSchema.parse({
  IMMICH_API_KEY: process.env.IMMICH_API_KEY,
  IMMICH_INSTANCE_URL: process.env.IMMICH_INSTANCE_URL,
  PORT: process.env.PORT,
  LOG_LEVEL: process.env.LOG_LEVEL,
  CACHE_TTL: process.env.CACHE_TTL,
});

// Validate configuration on module load
try {
  ConfigSchema.parse(config);
} catch (error) {
  console.error('Configuration validation failed:', error);
  process.exit(1);
}