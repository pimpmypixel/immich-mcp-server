import { z } from 'zod';

// Base schema for MCP tools
export const McpToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()),
});

// Albums Tool Schemas
export const ListAlbumsInputSchema = z.object({
  shared: z.boolean().optional(),
  assetId: z.string().optional(),
});

export const CreateAlbumInputSchema = z.object({
  albumName: z.string().min(1, 'Album name is required'),
  description: z.string().optional(),
  assetIds: z.array(z.string()).optional(),
});

export const UpdateAlbumInputSchema = z.object({
  albumId: z.string().min(1, 'Album ID is required'),
  albumName: z.string().optional(),
  description: z.string().optional(),
});

export const DeleteAlbumInputSchema = z.object({
  albumId: z.string().min(1, 'Album ID is required'),
});

export const AddAssetsToAlbumInputSchema = z.object({
  albumId: z.string().min(1, 'Album ID is required'),
  assetIds: z.array(z.string()).min(1, 'At least one asset ID is required'),
});

// Assets Tool Schemas
export const ListAssetsInputSchema = z.object({
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(1000).default(250),
  userId: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  withStacked: z.boolean().optional(),
  withPartners: z.boolean().optional(),
});

export const GetAssetInputSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  key: z.string().optional(),
});

export const UpdateAssetInputSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  description: z.string().optional(),
});

export const DeleteAssetInputSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
});

export const BulkUpdateAssetsInputSchema = z.object({
  assetIds: z.array(z.string()).min(1, 'At least one asset ID is required'),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  removeParent: z.boolean().optional(),
  stackParentId: z.string().optional(),
});

// Search Tool Schemas
export const SearchInputSchema = z.object({
  q: z.string().optional(),
  query: z.string().optional(),
  clip: z.boolean().optional(),
  type: z.enum(['ASSET', 'PERSON', 'PLACE', 'ALBUM']).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  size: z.number().min(1).max(1000).default(250),
  page: z.number().min(1).default(1),
  withStacked: z.boolean().optional(),
  withArchived: z.boolean().optional(),
});

export const SmartSearchInputSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  lensModel: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  size: z.number().min(1).max(1000).default(250),
  page: z.number().min(1).default(1),
});

// Users Tool Schemas
export const GetUserInputSchema = z.object({
  userId: z.string().optional(), // If not provided, gets current user
});

export const UpdateUserInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().optional(),
  email: z.string().email().optional(),
  isAdmin: z.boolean().optional(),
  shouldChangePassword: z.boolean().optional(),
  memoriesEnabled: z.boolean().optional(),
});

// Server Tool Schemas
export const GetServerInfoInputSchema = z.object({
  // No input required for server info
});

export const GetServerStatsInputSchema = z.object({
  isAll: z.boolean().default(false),
});

// Faces/People Tool Schemas
export const ListPeopleInputSchema = z.object({
  withHidden: z.boolean().default(false),
});

export const GetPersonInputSchema = z.object({
  personId: z.string().min(1, 'Person ID is required'),
});

export const UpdatePersonInputSchema = z.object({
  personId: z.string().min(1, 'Person ID is required'),
  name: z.string().optional(),
  birthDate: z.string().optional(),
  isHidden: z.boolean().optional(),
});

export const MergePersonInputSchema = z.object({
  personId: z.string().min(1, 'Person ID is required'),
  mergePersonIds: z.array(z.string()).min(1, 'At least one person ID to merge is required'),
});

// Metadata Tool Schemas
export const GetAssetMetadataInputSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
});

export const UpdateAssetMetadataInputSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  dateTimeOriginal: z.string().optional(),
});

// Export all input schema types
export type ListAlbumsInput = z.infer<typeof ListAlbumsInputSchema>;
export type CreateAlbumInput = z.infer<typeof CreateAlbumInputSchema>;
export type UpdateAlbumInput = z.infer<typeof UpdateAlbumInputSchema>;
export type DeleteAlbumInput = z.infer<typeof DeleteAlbumInputSchema>;
export type AddAssetsToAlbumInput = z.infer<typeof AddAssetsToAlbumInputSchema>;

export type ListAssetsInput = z.infer<typeof ListAssetsInputSchema>;
export type GetAssetInput = z.infer<typeof GetAssetInputSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetInputSchema>;
export type DeleteAssetInput = z.infer<typeof DeleteAssetInputSchema>;
export type BulkUpdateAssetsInput = z.infer<typeof BulkUpdateAssetsInputSchema>;

export type SearchInput = z.infer<typeof SearchInputSchema>;
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

export type GetUserInput = z.infer<typeof GetUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

export type GetServerInfoInput = z.infer<typeof GetServerInfoInputSchema>;
export type GetServerStatsInput = z.infer<typeof GetServerStatsInputSchema>;

export type ListPeopleInput = z.infer<typeof ListPeopleInputSchema>;
export type GetPersonInput = z.infer<typeof GetPersonInputSchema>;
export type UpdatePersonInput = z.infer<typeof UpdatePersonInputSchema>;
export type MergePersonInput = z.infer<typeof MergePersonInputSchema>;

export type GetAssetMetadataInput = z.infer<typeof GetAssetMetadataInputSchema>;
export type UpdateAssetMetadataInput = z.infer<typeof UpdateAssetMetadataInputSchema>;