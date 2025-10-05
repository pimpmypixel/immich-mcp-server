import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { immichApi } from '../immich/client.js';
import { Album } from '../immich/types.js';
import { logger } from '../utils/logger.js';
import {
  ListAlbumsInputSchema,
  CreateAlbumInputSchema,
  UpdateAlbumInputSchema,
  DeleteAlbumInputSchema,
  AddAssetsToAlbumInputSchema,
  type ListAlbumsInput,
  type CreateAlbumInput,
  type UpdateAlbumInput,
  type DeleteAlbumInput,
  type AddAssetsToAlbumInput,
} from '../schemas/mcp-schemas.js';

export class AlbumsTool {
  static getTools(): Tool[] {
    return [
      {
        name: 'albums_list',
        description: 'List all albums from Immich. Can optionally filter by shared status or specific asset.',
        inputSchema: {
          type: 'object',
          properties: {
            shared: {
              type: 'boolean',
              description: 'Filter by shared albums only',
            },
            assetId: {
              type: 'string',
              description: 'Filter albums containing this specific asset ID',
            },
          },
        },
      },
      {
        name: 'albums_create',
        description: 'Create a new album in Immich with optional assets.',
        inputSchema: {
          type: 'object',
          properties: {
            albumName: {
              type: 'string',
              description: 'Name of the new album',
            },
            description: {
              type: 'string',
              description: 'Optional description for the album',
            },
            assetIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional list of asset IDs to add to the album',
            },
          },
          required: ['albumName'],
        },
      },
      {
        name: 'albums_get',
        description: 'Get details of a specific album by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            albumId: {
              type: 'string',
              description: 'ID of the album to retrieve',
            },
          },
          required: ['albumId'],
        },
      },
      {
        name: 'albums_update',
        description: 'Update an existing album\'s name or description.',
        inputSchema: {
          type: 'object',
          properties: {
            albumId: {
              type: 'string',
              description: 'ID of the album to update',
            },
            albumName: {
              type: 'string',
              description: 'New name for the album',
            },
            description: {
              type: 'string',
              description: 'New description for the album',
            },
          },
          required: ['albumId'],
        },
      },
      {
        name: 'albums_delete',
        description: 'Delete an album from Immich.',
        inputSchema: {
          type: 'object',
          properties: {
            albumId: {
              type: 'string',
              description: 'ID of the album to delete',
            },
          },
          required: ['albumId'],
        },
      },
      {
        name: 'albums_add_assets',
        description: 'Add assets to an existing album.',
        inputSchema: {
          type: 'object',
          properties: {
            albumId: {
              type: 'string',
              description: 'ID of the album to add assets to',
            },
            assetIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of asset IDs to add to the album',
            },
          },
          required: ['albumId', 'assetIds'],
        },
      },
      {
        name: 'albums_remove_assets',
        description: 'Remove assets from an album.',
        inputSchema: {
          type: 'object',
          properties: {
            albumId: {
              type: 'string',
              description: 'ID of the album to remove assets from',
            },
            assetIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of asset IDs to remove from the album',
            },
          },
          required: ['albumId', 'assetIds'],
        },
      },
    ];
  }

  static async handleTool(name: string, args: any): Promise<any> {
    logger.info(`Executing albums tool: ${name}`, { args });

    try {
      switch (name) {
        case 'albums_list':
          return await this.listAlbums(args);
        case 'albums_create':
          return await this.createAlbum(args);
        case 'albums_get':
          return await this.getAlbum(args);
        case 'albums_update':
          return await this.updateAlbum(args);
        case 'albums_delete':
          return await this.deleteAlbum(args);
        case 'albums_add_assets':
          return await this.addAssetsToAlbum(args);
        case 'albums_remove_assets':
          return await this.removeAssetsFromAlbum(args);
        default:
          throw new Error(`Unknown albums tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in albums tool ${name}`, error);
      throw error;
    }
  }

  private static async listAlbums(args: any): Promise<Album[]> {
    const input = ListAlbumsInputSchema.parse(args);
    const params: Record<string, any> = {};
    
    if (input.shared !== undefined) {
      params.shared = input.shared;
    }
    if (input.assetId) {
      params.assetId = input.assetId;
    }

    return await immichApi.get<Album[]>('/api/albums', params);
  }

  private static async createAlbum(args: any): Promise<Album> {
    const input = CreateAlbumInputSchema.parse(args);
    
    const albumData = {
      albumName: input.albumName,
      description: input.description || '',
      assetIds: input.assetIds || [],
    };

    return await immichApi.post<Album>('/api/albums', albumData);
  }

  private static async getAlbum(args: any): Promise<Album> {
    const albumId = args.albumId;
    if (!albumId) {
      throw new Error('Album ID is required');
    }

    return await immichApi.get<Album>(`/api/albums/${albumId}`);
  }

  private static async updateAlbum(args: any): Promise<Album> {
    const input = UpdateAlbumInputSchema.parse(args);
    
    const updateData: Record<string, any> = {};
    if (input.albumName) updateData.albumName = input.albumName;
    if (input.description !== undefined) updateData.description = input.description;

    return await immichApi.patch<Album>(`/api/albums/${input.albumId}`, updateData);
  }

  private static async deleteAlbum(args: any): Promise<{ success: boolean; message: string }> {
    const input = DeleteAlbumInputSchema.parse(args);
    
    await immichApi.delete(`/api/albums/${input.albumId}`);
    
    return {
      success: true,
      message: `Album ${input.albumId} deleted successfully`,
    };
  }

  private static async addAssetsToAlbum(args: any): Promise<Album> {
    const input = AddAssetsToAlbumInputSchema.parse(args);
    
    const requestData = {
      ids: input.assetIds,
    };

    return await immichApi.put<Album>(`/api/albums/${input.albumId}/assets`, requestData);
  }

  private static async removeAssetsFromAlbum(args: any): Promise<Album> {
    const input = AddAssetsToAlbumInputSchema.parse(args); // Same schema
    
    const requestData = {
      ids: input.assetIds,
    };

    return await immichApi.delete<Album>(`/api/albums/${input.albumId}/assets`, requestData);
  }
}