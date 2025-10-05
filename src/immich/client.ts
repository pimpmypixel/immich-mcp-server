import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export interface ImmichApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export class ImmichApiClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTtl: number;

  constructor() {
    this.cacheTtl = config.CACHE_TTL * 1000; // Convert to milliseconds
    this.cache = new Map();
    
    this.client = axios.create({
      baseURL: config.IMMICH_INSTANCE_URL,
      headers: {
        'X-API-Key': config.IMMICH_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Immich API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('Immich API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug('Immich API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        const immichError: ImmichApiError = {
          message: error.response?.data?.message || error.message || 'Unknown Immich API error',
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
        };
        
        logger.error('Immich API Error', immichError);
        return Promise.reject(immichError);
      }
    );
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTtl;
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      logger.debug('Cache hit', { key });
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    logger.debug('Cache set', { key });
  }

  /**
   * Make GET request with optional caching
   */
  async get<T = any>(endpoint: string, params?: any, useCache: boolean = true): Promise<T> {
    const cacheKey = `GET:${endpoint}:${JSON.stringify(params || {})}`;
    
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await this.client.get<T>(endpoint, { params });
    
    if (useCache) {
      this.setCache(cacheKey, response.data);
    }
    
    return response.data;
  }

  /**
   * Make POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.delete<T>(endpoint, { data });
    return response.data;
  }

  /**
   * Validate API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      // Try endpoints in order of most likely to work
      const endpoints = [
        '/api/users/me',           // Most common endpoint that should always exist
        '/api/server/info',        // Alternative server info path
        '/api/server-info',        // Original server info path
        '/api/server/version',     // Alternative version path
        '/api/server-info/version' // Original version path
      ];
      
      for (const endpoint of endpoints) {
        try {
          await this.get(endpoint, undefined, false);
          logger.info('Immich API connection validated successfully', { endpoint });
          return true;
        } catch (error) {
          logger.debug('Endpoint not available, trying next', { endpoint });
          // Don't log the full error to reduce noise
        }
      }
      
      // If all endpoints fail, try a basic request to see if we get any response
      try {
        await this.client.get('/api');
        logger.info('Immich API connection validated (base API accessible)');
        return true;
      } catch (error) {
        logger.error('All validation endpoints failed, API may be unreachable');
        return false;
      }
    } catch (error) {
      logger.error('Failed to validate Immich API connection', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Immich API cache cleared');
  }
}

// Export singleton instance
export const immichApi = new ImmichApiClient();