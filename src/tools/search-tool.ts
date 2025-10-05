import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { immichApi } from '../immich/client.js';
import { SearchResponseDto } from '../immich/types.js';
import { logger } from '../utils/logger.js';
import {
  SearchInputSchema,
  SmartSearchInputSchema,
  type SearchInput,
  type SmartSearchInput,
} from '../schemas/mcp-schemas.js';

export class SearchTool {
  static getTools(): Tool[] {
    return [
      {
        name: 'search_general',
        description: 'General search across Immich assets, albums, and people.',
        inputSchema: {
          type: 'object',
          properties: {
            q: {
              type: 'string',
              description: 'General search query',
            },
            query: {
              type: 'string',
              description: 'Specific search query (alternative to q)',
            },
            clip: {
              type: 'boolean',
              description: 'Use CLIP-based image search',
            },
            type: {
              type: 'string',
              enum: ['ASSET', 'PERSON', 'PLACE', 'ALBUM'],
              description: 'Type of entity to search for',
            },
            isFavorite: {
              type: 'boolean',
              description: 'Filter by favorite status',
            },
            isArchived: {
              type: 'boolean',
              description: 'Filter by archived status',
            },
            size: {
              type: 'number',
              minimum: 1,
              maximum: 1000,
              default: 250,
              description: 'Number of results per page',
            },
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number for pagination',
            },
            withStacked: {
              type: 'boolean',
              description: 'Include stacked assets in results',
            },
            withArchived: {
              type: 'boolean',
              description: 'Include archived assets in results',
            },
          },
        },
      },
      {
        name: 'search_smart',
        description: 'Smart search using AI-powered image recognition and metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Smart search query (e.g., "beach sunset", "cat", "mountain")',
            },
            city: {
              type: 'string',
              description: 'Filter by city name',
            },
            state: {
              type: 'string',
              description: 'Filter by state/region',
            },
            country: {
              type: 'string',
              description: 'Filter by country',
            },
            make: {
              type: 'string',
              description: 'Filter by camera make',
            },
            model: {
              type: 'string',
              description: 'Filter by camera model',
            },
            lensModel: {
              type: 'string',
              description: 'Filter by lens model',
            },
            type: {
              type: 'string',
              enum: ['IMAGE', 'VIDEO'],
              description: 'Filter by asset type',
            },
            isFavorite: {
              type: 'boolean',
              description: 'Filter by favorite status',
            },
            isArchived: {
              type: 'boolean',
              description: 'Filter by archived status',
            },
            size: {
              type: 'number',
              minimum: 1,
              maximum: 1000,
              default: 250,
              description: 'Number of results per page',
            },
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number for pagination',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'search_metadata',
        description: 'Search assets by EXIF metadata and location information.',
        inputSchema: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'Search by city name',
            },
            state: {
              type: 'string',
              description: 'Search by state/region',
            },
            country: {
              type: 'string',
              description: 'Search by country',
            },
            make: {
              type: 'string',
              description: 'Search by camera make',
            },
            model: {
              type: 'string',
              description: 'Search by camera model',
            },
            lensModel: {
              type: 'string',
              description: 'Search by lens model',
            },
            type: {
              type: 'string',
              enum: ['IMAGE', 'VIDEO'],
              description: 'Filter by asset type',
            },
            withArchived: {
              type: 'boolean',
              default: false,
              description: 'Include archived assets in results',
            },
            size: {
              type: 'number',
              minimum: 1,
              maximum: 1000,
              default: 250,
              description: 'Number of results per page',
            },
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number for pagination',
            },
          },
        },
      },
      {
        name: 'search_explore',
        description: 'Explore assets by detected objects, faces, or places.',
        inputSchema: {
          type: 'object',
          properties: {
            // This endpoint might vary based on Immich version
          },
        },
      },
    ];
  }

  static async handleTool(name: string, args: any): Promise<any> {
    logger.info(`Executing search tool: ${name}`, { args });

    try {
      switch (name) {
        case 'search_general':
          return await this.generalSearch(args);
        case 'search_smart':
          return await this.smartSearch(args);
        case 'search_metadata':
          return await this.metadataSearch(args);
        case 'search_explore':
          return await this.exploreSearch(args);
        default:
          throw new Error(`Unknown search tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in search tool ${name}`, error);
      throw error;
    }
  }

  private static async generalSearch(args: any): Promise<SearchResponseDto> {
    const input = SearchInputSchema.parse(args);
    
    const params: Record<string, any> = {
      page: input.page,
      size: input.size,
    };
    
    if (input.q) params.q = input.q;
    if (input.query) params.query = input.query;
    if (input.clip !== undefined) params.clip = input.clip;
    if (input.type) params.type = input.type;
    if (input.isFavorite !== undefined) params.isFavorite = input.isFavorite;
    if (input.isArchived !== undefined) params.isArchived = input.isArchived;
    if (input.withStacked !== undefined) params.withStacked = input.withStacked;
    if (input.withArchived !== undefined) params.withArchived = input.withArchived;

    return await immichApi.get<SearchResponseDto>('/api/search', params);
  }

  private static async smartSearch(args: any): Promise<any> {
    const input = SmartSearchInputSchema.parse(args);
    
    const params: Record<string, any> = {
      query: input.query,
      page: input.page,
      size: input.size,
    };
    
    if (input.city) params.city = input.city;
    if (input.state) params.state = input.state;
    if (input.country) params.country = input.country;
    if (input.make) params.make = input.make;
    if (input.model) params.model = input.model;
    if (input.lensModel) params.lensModel = input.lensModel;
    if (input.type) params.type = input.type;
    if (input.isFavorite !== undefined) params.isFavorite = input.isFavorite;
    if (input.isArchived !== undefined) params.isArchived = input.isArchived;

    return await immichApi.get('/api/search/smart', params);
  }

  private static async metadataSearch(args: any): Promise<any> {
    const params: Record<string, any> = {
      page: args.page || 1,
      size: args.size || 250,
    };
    
    if (args.city) params.city = args.city;
    if (args.state) params.state = args.state;
    if (args.country) params.country = args.country;
    if (args.make) params.make = args.make;
    if (args.model) params.model = args.model;
    if (args.lensModel) params.lensModel = args.lensModel;
    if (args.type) params.type = args.type;
    if (args.withArchived !== undefined) params.withArchived = args.withArchived;

    return await immichApi.get('/api/search/metadata', params);
  }

  private static async exploreSearch(args: any): Promise<any> {
    // This endpoint structure may vary depending on Immich version
    // Implementing as a general explore endpoint
    return await immichApi.get('/api/search/explore', args);
  }
}