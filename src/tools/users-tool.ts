import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { immichApi } from '../immich/client.js';
import { User } from '../immich/types.js';
import { logger } from '../utils/logger.js';
import {
  GetUserInputSchema,
  UpdateUserInputSchema,
  type GetUserInput,
  type UpdateUserInput,
} from '../schemas/mcp-schemas.js';

export class UsersTool {
  static getTools(): Tool[] {
    return [
      {
        name: 'users_get_me',
        description: 'Get information about the current authenticated user.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'users_get',
        description: 'Get information about a specific user by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'ID of the user to retrieve',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'users_list',
        description: 'List all users in the Immich instance (admin only).',
        inputSchema: {
          type: 'object',
          properties: {
            isAll: {
              type: 'boolean',
              default: false,
              description: 'Include deleted users in the list',
            },
          },
        },
      },
      {
        name: 'users_update',
        description: 'Update user information (admin only or own profile).',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'ID of the user to update',
            },
            name: {
              type: 'string',
              description: 'New display name for the user',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'New email address for the user',
            },
            isAdmin: {
              type: 'boolean',
              description: 'Set admin status (admin only)',
            },
            shouldChangePassword: {
              type: 'boolean',
              description: 'Force password change on next login',
            },
            memoriesEnabled: {
              type: 'boolean',
              description: 'Enable/disable memories feature for user',
            },
          },
          required: ['userId'],
        },
      },
    ];
  }

  static async handleTool(name: string, args: any): Promise<any> {
    logger.info(`Executing users tool: ${name}`, { args });

    try {
      switch (name) {
        case 'users_get_me':
          return await this.getCurrentUser();
        case 'users_get':
          return await this.getUser(args);
        case 'users_list':
          return await this.listUsers(args);
        case 'users_update':
          return await this.updateUser(args);
        default:
          throw new Error(`Unknown users tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in users tool ${name}`, error);
      throw error;
    }
  }

  private static async getCurrentUser(): Promise<User> {
    return await immichApi.get<User>('/api/users/me');
  }

  private static async getUser(args: any): Promise<User> {
    const input = GetUserInputSchema.parse(args);
    
    if (input.userId) {
      return await immichApi.get<User>(`/api/users/${input.userId}`);
    } else {
      return await this.getCurrentUser();
    }
  }

  private static async listUsers(args: any): Promise<User[]> {
    const params: Record<string, any> = {};
    if (args.isAll !== undefined) {
      params.isAll = args.isAll;
    }

    return await immichApi.get<User[]>('/api/users', params);
  }

  private static async updateUser(args: any): Promise<User> {
    const input = UpdateUserInputSchema.parse(args);
    
    const updateData: Record<string, any> = {};
    if (input.name) updateData.name = input.name;
    if (input.email) updateData.email = input.email;
    if (input.isAdmin !== undefined) updateData.isAdmin = input.isAdmin;
    if (input.shouldChangePassword !== undefined) updateData.shouldChangePassword = input.shouldChangePassword;
    if (input.memoriesEnabled !== undefined) updateData.memoriesEnabled = input.memoriesEnabled;

    return await immichApi.put<User>(`/api/users/${input.userId}`, updateData);
  }
}