import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { immichApi } from '../immich/client.js';
import { AlbumsTool } from '../tools/albums-tool.js';
import { AssetsTool } from '../tools/assets-tool.js';
import { SearchTool } from '../tools/search-tool.js';
import { UsersTool } from '../tools/users-tool.js';
import { ServerTool } from '../tools/server-tool.js';
import { SchemaTool } from '../tools/schema-tool.js';

export class ImmichMcpServer {
  private server: Server;
  private tools: Map<string, { handler: any; toolInfo: Tool }>;

  constructor() {
    this.server = new Server(
      {
        name: 'immich-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.tools = new Map();
    this.setupTools();
    this.setupHandlers();
  }

  private setupTools(): void {
    logger.info('Setting up MCP tools...');

    // Register Albums tools
    const albumsTools = AlbumsTool.getTools();
    albumsTools.forEach(tool => {
      this.tools.set(tool.name, {
        handler: AlbumsTool,
        toolInfo: tool,
      });
    });

    // Register Assets tools
    const assetsTools = AssetsTool.getTools();
    assetsTools.forEach(tool => {
      this.tools.set(tool.name, {
        handler: AssetsTool,
        toolInfo: tool,
      });
    });

    // Register Search tools
    const searchTools = SearchTool.getTools();
    searchTools.forEach(tool => {
      this.tools.set(tool.name, {
        handler: SearchTool,
        toolInfo: tool,
      });
    });

    // Register Users tools
    const usersTools = UsersTool.getTools();
    usersTools.forEach(tool => {
      this.tools.set(tool.name, {
        handler: UsersTool,
        toolInfo: tool,
      });
    });

    // Register Server tools
    const serverTools = ServerTool.getTools();
    serverTools.forEach(tool => {
      this.tools.set(tool.name, {
        handler: ServerTool,
        toolInfo: tool,
      });
    });

    // Register Schema tools
    const schemaTools = SchemaTool.getTools();
    schemaTools.forEach(tool => {
      this.tools.set(tool.name, {
        handler: SchemaTool,
        toolInfo: tool,
      });
    });

    logger.info(`Registered ${this.tools.size} MCP tools`, {
      tools: Array.from(this.tools.keys()),
    });
  }

  private setupHandlers(): void {
    // Handle list_tools requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Handling list_tools request');
      
      return {
        tools: Array.from(this.tools.values()).map(({ toolInfo }) => toolInfo),
      };
    });

    // Handle call_tool requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.info('Handling call_tool request', { name, args });

      const toolHandler = this.tools.get(name);
      if (!toolHandler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await toolHandler.handler.handleTool(name, args || {});
        
        logger.debug('Tool execution completed', { name, result });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('Tool execution failed', { name, error });
        
        // Return structured error response
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: true,
                message: error instanceof Error ? error.message : 'Unknown error',
                tool: name,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });

    logger.info('MCP server handlers configured');
  }

  async start(): Promise<void> {
    // Validate Immich API connection before starting
    logger.info('Validating Immich API connection...');
    const isConnected = await immichApi.validateConnection();
    
    if (!isConnected) {
      logger.warn('Failed to connect to Immich API. Server will start but tools may not work.');
    }

    // Use HTTP transport if PORT is set, otherwise stdio
    if (process.env.PORT) {
      const { createServer } = await import('http');
      const transports: Record<string, StreamableHTTPServerTransport> = {};
      
      const httpServer = createServer(async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            const parsedBody = body.trim() ? JSON.parse(body) : undefined;
            
            let transport: StreamableHTTPServerTransport;
            if (sessionId && transports[sessionId]) {
              transport = transports[sessionId];
            } else if (!sessionId) {
              transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => crypto.randomUUID(),
                onsessioninitialized: (sid) => {
                  transports[sid] = transport;
                  logger.debug('Session initialized', { sessionId: sid });
                },
                onsessionclosed: (sid) => {
                  delete transports[sid];
                  logger.debug('Session closed', { sessionId: sid });
                }
              });
              await this.server.connect(transport);
            } else {
              res.writeHead(400);
              res.end('Invalid session ID');
              return;
            }
            
            await transport.handleRequest(req, res, parsedBody);
          });
        } else if (req.method === 'GET') {
          if (!sessionId || !transports[sessionId]) {
            res.writeHead(400);
            res.end('Invalid or missing session ID');
            return;
          }
          await transports[sessionId].handleRequest(req, res);
        } else if (req.method === 'DELETE') {
          if (!sessionId || !transports[sessionId]) {
            res.writeHead(400);
            res.end('Invalid or missing session ID');
            return;
          }
          await transports[sessionId].handleRequest(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
      });
      httpServer.listen(config.PORT, () => {
        logger.info('Immich MCP Server started with HTTP transport', {
          port: config.PORT,
          immichUrl: config.IMMICH_INSTANCE_URL,
          logLevel: config.LOG_LEVEL,
          cacheTtl: config.CACHE_TTL,
        });
      });
    } else {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('Immich MCP Server started with stdio transport', {
        immichUrl: config.IMMICH_INSTANCE_URL,
        logLevel: config.LOG_LEVEL,
        cacheTtl: config.CACHE_TTL,
      });
    }
  }

  async stop(): Promise<void> {
    logger.info('Stopping Immich MCP Server...');
    await this.server.close();
    logger.info('Immich MCP Server stopped');
  }
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});