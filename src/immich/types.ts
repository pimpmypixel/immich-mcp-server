// Core Immich API Types
// Based on Immich 2.0 API specification

export interface Asset {
  id: string;
  deviceAssetId: string;
  ownerId: string;
  deviceId: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER';
  originalPath: string;
  originalFileName: string;
  resized: boolean;
  thumbhash: string | null;
  fileCreatedAt: string;
  fileModifiedAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  duration: string | null;
  exifInfo: ExifInfo | null;
  smartInfo: SmartInfo | null;
  livePhotoVideoId: string | null;
  tags: Tag[];
  people: Person[];
  /**base64 encoded sha1 hash */
  checksum: string;
  stackCount: number | null;
  isExternal: boolean;
  hasMetadata: boolean;
  duplicateId: string | null;
}

export interface AssetResponseDto extends Asset {
  resized: boolean;
  thumbhash: string | null;
}

export interface Album {
  id: string;
  ownerId: string;
  albumName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  albumThumbnailAssetId: string | null;
  shared: boolean;
  sharedUsers: User[];
  hasSharedLink: boolean;
  assets: Asset[];
  owner: User;
  assetCount: number;
  lastModifiedAssetTimestamp: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileImagePath: string;
  isAdmin: boolean;
  shouldChangePassword: boolean;
  createdAt: string;
  deletedAt: string | null;
  updatedAt: string;
  oauthId: string;
  memoriesEnabled: boolean;
}

export interface Person {
  id: string;
  name: string;
  birthDate: string | null;
  thumbnailPath: string;
  isHidden: boolean;
  faces: PersonFace[];
}

export interface PersonFace {
  id: string;
  person: Person | null;
  asset: Asset;
}

export interface Tag {
  id: string;
  name: string;
  type: 'OBJECT' | 'FACE' | 'CUSTOM';
  userId: string;
}

export interface ExifInfo {
  make: string | null;
  model: string | null;
  exifImageWidth: number | null;
  exifImageHeight: number | null;
  fileSizeInByte: number | null;
  orientation: string | null;
  dateTimeOriginal: string | null;
  modifyDate: string | null;
  timeZone: string | null;
  lensModel: string | null;
  fNumber: number | null;
  focalLength: number | null;
  iso: number | null;
  exposureTime: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  description: string | null;
}

export interface SmartInfo {
  tags: string[];
  objects: string[];
}

export interface ServerInfo {
  diskAvailable: string;
  diskSize: string;
  diskUse: string;
  diskAvailableRaw: number;
  diskSizeRaw: number;
  diskUseRaw: number;
}

export interface ServerVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface ServerStats {
  photos: number;
  videos: number;
  usage: number;
  usageByUser: UserStats[];
}

export interface UserStats {
  userId: string;
  userName: string;
  photos: number;
  videos: number;
  usage: number;
}

// Request/Response types for API operations

export interface CreateAlbumDto {
  albumName: string;
  description?: string;
  assetIds?: string[];
}

export interface UpdateAlbumDto {
  albumName?: string;
  description?: string;
}

export interface SearchDto {
  q?: string;
  query?: string;
  clip?: boolean;
  type?: 'ASSET' | 'PERSON' | 'PLACE' | 'ALBUM';
  isFavorite?: boolean;
  isArchived?: boolean;
  size?: number;
  page?: number;
  withStacked?: boolean;
  withArchived?: boolean;
}

export interface SearchResponseDto {
  albums: {
    total: number;
    count: number;
    page: number;
    items: Album[];
  };
  assets: {
    total: number;
    count: number;
    page: number;
    items: Asset[];
  };
}

export interface AssetBulkUpdateDto {
  ids: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  removeParent?: boolean;
  stackParentId?: string;
}