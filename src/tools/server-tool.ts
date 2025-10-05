import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { immichApi } from '../immich/client.js';
import { ServerInfo, ServerStats } from '../immich/types.js';
import { logger } from '../utils/logger.js';
import {
  GetServerInfoInputSchema,
  GetServerStatsInputSchema,
  type GetServerInfoInput,
  type GetServerStatsInput,
} from '../schemas/mcp-schemas.js';

export class ServerTool {
  static getTools(): Tool[] {
    return [
      {
        name: 'server_info',
        description: 'Get Immich server information including version and disk usage.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'server_version',
        description: 'Get Immich server version information.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'server_stats',
        description: 'Get server statistics including photo/video counts and usage by user.',
        inputSchema: {
          type: 'object',
          properties: {
            isAll: {
              type: 'boolean',
              default: false,
              description: 'Include statistics for all users (admin only)',
            },
          },
        },
      },
      {
        name: 'server_ping',
        description: 'Ping the Immich server to check connectivity and response time.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'server_config',
        description: 'Get server configuration information.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'server_features',
        description: 'Get information about available server features and capabilities.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  static async handleTool(name: string, args: any): Promise<any> {
    logger.info(`Executing server tool: ${name}`, { args });

    try {
      switch (name) {
        case 'server_info':
          return await this.getServerInfo(args);
        case 'server_version':
          return await this.getServerVersion(args);
        case 'server_stats':
          return await this.getServerStats(args);
        case 'server_ping':
          return await this.pingServer(args);
        case 'server_config':
          return await this.getServerConfig(args);
        case 'server_features':
          return await this.getServerFeatures(args);
        default:
          throw new Error(`Unknown server tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in server tool ${name}`, error);
      throw error;
    }
  }

  private static async getServerInfo(args: any): Promise<ServerInfo> {
    const input = GetServerInfoInputSchema.parse(args);
    return await immichApi.get<ServerInfo>('/api/server-info');
  }

  private static async getServerVersion(args: any): Promise<any> {
    return await immichApi.get('/api/server-info/version');
  }

  private static async getServerStats(args: any): Promise<ServerStats> {
    const input = GetServerStatsInputSchema.parse(args);
    
    const params: Record<string, any> = {};
    if (input.isAll) {
      params.isAll = input.isAll;
    }

    return await immichApi.get<ServerStats>('/api/server-info/statistics', params);
  }

  private static async pingServer(args: any): Promise<{ status: string; responseTime: number; timestamp: string }> {
    const startTime = Date.now();
    
    try {
      await immichApi.get('/api/server-info/ping', undefined, false);
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'error',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static async getServerConfig(args: any): Promise<any> {
    return await immichApi.get('/api/server-info/config');
  }

  private static async getServerFeatures(args: any): Promise<any> {
    return await immichApi.get('/api/server-info/features');
  }
}