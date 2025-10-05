import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('Configuration', () => {
  it('should have required environment variables', () => {
    expect(config.IMMICH_API_KEY).toBeTruthy();
    expect(config.IMMICH_INSTANCE_URL).toBeTruthy();
    expect(config.PORT).toBeTypeOf('number');
    expect(config.LOG_LEVEL).toMatch(/^(error|warn|info|debug)$/);
    expect(config.CACHE_TTL).toBeTypeOf('number');
  });

  it('should validate port range', () => {
    expect(config.PORT).toBeGreaterThan(0);
    expect(config.PORT).toBeLessThan(65536);
  });

  it('should validate cache TTL', () => {
    expect(config.CACHE_TTL).toBeGreaterThanOrEqual(0);
  });
});