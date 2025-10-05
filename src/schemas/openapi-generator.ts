import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AlbumsTool } from '../tools/albums-tool.js';
import { AssetsTool } from '../tools/assets-tool.js';
import { SearchTool } from '../tools/search-tool.js';
import { UsersTool } from '../tools/users-tool.js';
import { ServerTool } from '../tools/server-tool.js';
import { SchemaTool } from '../tools/schema-tool.js';

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

export class OpenAPIGenerator {
  static generateSchema(baseUrl?: string): OpenAPISchema {
    const tools = this.getAllTools();
    
    const schema: OpenAPISchema = {
      openapi: '3.0.0',
      info: {
        title: 'Immich MCP Server',
        description: 'OpenAPI 3.0 schema for Immich MCP Server tools and resources',
        version: '1.0.0',
      },
      servers: [
        {
          url: baseUrl || 'http://localhost:8000',
          description: 'Immich MCP Server',
        },
      ],
      paths: {},
      components: {
        schemas: this.generateComponentSchemas(),
      },
    };

    // Generate paths from MCP tools
    tools.forEach(tool => {
      const path = `/tools/${tool.name}`;
      schema.paths[path] = {
        post: {
          summary: tool.description,
          operationId: tool.name,
          tags: [this.getToolCategory(tool.name)],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: tool.inputSchema,
              },
            },
          },
          responses: {
            '200': {
              description: 'Tool executed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      content: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            type: { type: 'string', enum: ['text'] },
                            text: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid input parameters',
            },
            '500': {
              description: 'Tool execution error',
            },
          },
        },
      };
    });

    return schema;
  }

  private static getAllTools(): Tool[] {
    return [
      ...AlbumsTool.getTools(),
      ...AssetsTool.getTools(),
      ...SearchTool.getTools(),
      ...UsersTool.getTools(),
      ...ServerTool.getTools(),
      ...SchemaTool.getTools(),
    ];
  }

  private static getToolCategory(toolName: string): string {
    if (toolName.startsWith('albums_')) return 'Albums';
    if (toolName.startsWith('assets_')) return 'Assets';
    if (toolName.startsWith('search_')) return 'Search';
    if (toolName.startsWith('users_')) return 'Users';
    if (toolName.startsWith('server_')) return 'Server';
    if (toolName.startsWith('schema_')) return 'Schema';
    return 'General';
  }

  private static generateComponentSchemas(): Record<string, any> {
    return {
      Album: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          ownerId: { type: 'string' },
          albumName: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          albumThumbnailAssetId: { type: 'string', nullable: true },
          shared: { type: 'boolean' },
          assetCount: { type: 'number' },
          lastModifiedAssetTimestamp: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      Asset: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          deviceAssetId: { type: 'string' },
          ownerId: { type: 'string' },
          deviceId: { type: 'string' },
          type: { type: 'string', enum: ['IMAGE', 'VIDEO', 'AUDIO', 'OTHER'] },
          originalPath: { type: 'string' },
          originalFileName: { type: 'string' },
          resized: { type: 'boolean' },
          fileCreatedAt: { type: 'string', format: 'date-time' },
          fileModifiedAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isFavorite: { type: 'boolean' },
          isArchived: { type: 'boolean' },
          isTrashed: { type: 'boolean' },
          duration: { type: 'string', nullable: true },
          checksum: { type: 'string' },
          stackCount: { type: 'number', nullable: true },
          isExternal: { type: 'boolean' },
          hasMetadata: { type: 'boolean' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          profileImagePath: { type: 'string' },
          isAdmin: { type: 'boolean' },
          shouldChangePassword: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time' },
          memoriesEnabled: { type: 'boolean' },
        },
      },
      SearchResponse: {
        type: 'object',
        properties: {
          albums: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              count: { type: 'number' },
              page: { type: 'number' },
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Album' },
              },
            },
          },
          assets: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              count: { type: 'number' },
              page: { type: 'number' },
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Asset' },
              },
            },
          },
        },
      },
      ServerInfo: {
        type: 'object',
        properties: {
          diskAvailable: { type: 'string' },
          diskSize: { type: 'string' },
          diskUse: { type: 'string' },
          diskAvailableRaw: { type: 'number' },
          diskSizeRaw: { type: 'number' },
          diskUseRaw: { type: 'number' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'boolean' },
          message: { type: 'string' },
          tool: { type: 'string' },
        },
        required: ['error', 'message'],
      },
    };
  }
}