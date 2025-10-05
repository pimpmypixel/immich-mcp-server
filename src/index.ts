#!/usr/bin/env node

import { ImmichMcpServer } from './mcp/server.js';
import { logger } from './utils/logger.js';
import { config } from './utils/config.js';

async function main() {
  try {
    logger.info('Starting Immich MCP Server...', {
      version: '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      immichUrl: config.IMMICH_INSTANCE_URL,
      logLevel: config.LOG_LEVEL,
    });

    const server = new ImmichMcpServer();
    await server.start();

    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    logger.error('Failed to start Immich MCP Server', error);
    process.exit(1);
  }
}

// Run the server
main();