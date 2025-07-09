import api from '@/lib/axios';
import { ApiResponse, GetManyParams, PaginatedApiResponse, PaginationParams } from '@/types/api';

// Re-export for compatibility
export type { ApiResponse };

/**
 * Base API service with common CRUD operations
 * @template T - The type of items this service manages
 */
export default class BaseService<T> {
  /**
   * Base path for the API endpoints
   */
  protected basePath: string;

  /**
   * @param basePath - The base API path for this service
   */
  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Get all items
   * @param params - Optional query parameters
   * @returns Promise with array of items
   */
  async getAll(params?: Record<string, unknown>): Promise<T[]> {
    const response = await api.get<ApiResponse<T[]>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get items with pagination support
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with paginated response containing items and pagination info
   */
  async getPaginated(params?: PaginationParams & Record<string, unknown>): Promise<PaginatedApiResponse<T>> {
    const response = await api.get<PaginatedApiResponse<T>>(`${this.basePath}/many`, {
      params
    });
    return response.data;
  }

  /**
   * Get many items (paginated endpoint but return only data array)
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with array of items
   */
  async getMany(params?: GetManyParams): Promise<T[]> {
    const response = await api.get<ApiResponse<T[]> | PaginatedApiResponse<T>>(`${this.basePath}/many`, {
      params
    });
    
    // Handle both response formats
    if ('pagination' in response.data) {
      return response.data.data;
    } else {
      return response.data.data || response.data;
    }
  }

  /**
   * Get a single item by ID
   * @param id - The ID of the item to get
   * @returns Promise with the item
   */
  async getById(id: string): Promise<T> {
    const response = await api.get<ApiResponse<T>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new item
   * @param data - The data for the new item
   * @returns Promise with the created item
   */
  async create(data: Partial<T>): Promise<T> {
    const response = await api.post<ApiResponse<T>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Create multiple items at once
   * @param data - Array of items to create
   * @returns Promise with the created items
   */
  async createMany(data: Partial<T>[]): Promise<T[]> {
    const response = await api.post<ApiResponse<T[]>>(`${this.basePath}/createMany`, data);
    return response.data.data || response.data;
  }

  /**
   * Update an existing item
   * @param id - The ID of the item to update
   * @param data - The new data for the item
   * @returns Promise with the updated item
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await api.put<ApiResponse<T>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Update multiple items with the same data
   * @param data - The update request containing ids and data
   * @returns Promise with the updated items
   */
  async updateMany(data: { ids: string[]; data: Partial<T> }): Promise<T[]> {
    const response = await api.patch<ApiResponse<T[]>>(`${this.basePath}/many`, data);
    return response.data.data || response.data;
  }

  /**
   * Delete an item
   * @param id - The ID of the item to delete
   * @returns Promise with the deleted item or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get the full API response with code, data, and message
   * @param endpoint - The API endpoint to request
   * @param method - The HTTP method to use
   * @param params - Optional parameters or request body
   * @returns Promise with the full API response
   */
  protected async getFullResponse<R>(
    endpoint: string, 
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get', 
    params?: Record<string, unknown>
  ): Promise<ApiResponse<R>> {
    let response;
    
    switch (method) {
      case 'get':
        response = await api.get<ApiResponse<R>>(endpoint, { params });
        break;
      case 'post':
        response = await api.post<ApiResponse<R>>(endpoint, params);
        break;
      case 'put':
        response = await api.put<ApiResponse<R>>(endpoint, params);
        break;
      case 'patch':
        response = await api.patch<ApiResponse<R>>(endpoint, params);
        break;
      case 'delete':
        response = await api.delete<ApiResponse<R>>(endpoint, { data: params });
        break;
    }
    
    return response.data;
  }
} 