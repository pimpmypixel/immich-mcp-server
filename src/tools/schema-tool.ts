import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { OpenAPIGenerator } from '../schemas/openapi-generator.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

export class SchemaTool {
  static getTools(): Tool[] {
    return [
      {
        name: 'schema_openapi',
        description: 'Get the OpenAPI 3.0 schema for all available MCP tools.',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['json', 'yaml'],
              default: 'json',
              description: 'Output format for the schema',
            },
            baseUrl: {
              type: 'string',
              description: 'Base URL for the server (optional)',
            },
          },
        },
      },
      {
        name: 'schema_tools_list',
        description: 'List all available MCP tools with their descriptions.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['Albums', 'Assets', 'Search', 'Users', 'Server'],
              description: 'Filter tools by category',
            },
          },
        },
      },
      {
        name: 'schema_tool_info',
        description: 'Get detailed information about a specific MCP tool.',
        inputSchema: {
          type: 'object',
          properties: {
            toolName: {
              type: 'string',
              description: 'Name of the tool to get information about',
            },
          },
          required: ['toolName'],
        },
      },
    ];
  }

  static async handleTool(name: string, args: any): Promise<any> {
    logger.info(`Executing schema tool: ${name}`, { args });

    try {
      switch (name) {
        case 'schema_openapi':
          return await this.getOpenAPISchema(args);
        case 'schema_tools_list':
          return await this.listTools(args);
        case 'schema_tool_info':
          return await this.getToolInfo(args);
        default:
          throw new Error(`Unknown schema tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in schema tool ${name}`, error);
      throw error;
    }
  }

  private static async getOpenAPISchema(args: any): Promise<any> {
    const format = args.format || 'json';
    const baseUrl = args.baseUrl || `http://localhost:${config.PORT}`;
    
    const schema = OpenAPIGenerator.generateSchema(baseUrl);
    
    if (format === 'yaml') {
      // For simplicity, we'll return JSON with a note about YAML
      return {
        ...schema,
        _note: 'YAML format not implemented yet, returning JSON format',
      };
    }
    
    return schema;
  }

  private static async listTools(args: any): Promise<any> {
    const category = args.category;
    
    // Get all tools from the generator
    const allTools = OpenAPIGenerator.generateSchema().paths;
    const tools: any[] = [];
    
    Object.entries(allTools).forEach(([path, pathInfo]) => {
      const toolName = path.replace('/tools/', '');
      const toolCategory = this.getToolCategory(toolName);
      
      if (!category || toolCategory === category) {
        tools.push({
          name: toolName,
          category: toolCategory,
          description: (pathInfo as any).post?.summary || 'No description available',
          path,
        });
      }
    });
    
    return {
      tools,
      totalCount: tools.length,
      categories: ['Albums', 'Assets', 'Search', 'Users', 'Server', 'Schema'],
    };
  }

  private static async getToolInfo(args: any): Promise<any> {
    const toolName = args.toolName;
    if (!toolName) {
      throw new Error('Tool name is required');
    }
    
    const schema = OpenAPIGenerator.generateSchema();
    const toolPath = `/tools/${toolName}`;
    const toolInfo = schema.paths[toolPath];
    
    if (!toolInfo) {
      throw new Error(`Tool '${toolName}' not found`);
    }
    
    return {
      name: toolName,
      category: this.getToolCategory(toolName),
      description: toolInfo.post?.summary || 'No description available',
      inputSchema: toolInfo.post?.requestBody?.content?.['application/json']?.schema,
      responseSchema: toolInfo.post?.responses?.['200']?.content?.['application/json']?.schema,
      path: toolPath,
    };
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
}