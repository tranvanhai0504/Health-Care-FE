import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  ApiResponse,
  GetManyParams,
  PaginatedApiResponse,

  Promotion,
  CreatePromotionData
} from '@/types';

export class PromotionService extends BaseService<Promotion> {
  constructor() {
    super('/api/v1/promotion');
  }

  /**
   * Get all promotions
   * @returns Promise with array of promotions
   */
  async getAll(): Promise<PaginatedApiResponse<Promotion>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Promotion>>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get active promotions only
   * @returns Promise with array of active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    const response = await api.get<ApiResponse<Promotion[]>>(`${this.basePath}/active`);
    return response.data.data;
  }



  /**
   * Get many promotions (paginated endpoint)
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with paginated promotions
   */
  async getMany(params?: GetManyParams): Promise<PaginatedApiResponse<Promotion>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Promotion>>>(`${this.basePath}/many`, {
      params
    });
    
    return response.data.data;
  }

  /**
   * Get a promotion by ID
   * @param id - The ID of the promotion to get
   * @returns Promise with the promotion
   */
  async getById(id: string): Promise<Promotion> {
    const response = await api.get<ApiResponse<Promotion>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new promotion
   * @param data - The promotion data to create
   * @returns Promise with the created promotion
   */
  async create(data: CreatePromotionData): Promise<Promotion> {
    const response = await api.post<ApiResponse<Promotion>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Create multiple promotions at once
   * @param data - Array of promotions to create
   * @returns Promise with the created promotions
   */
  async createMany(data: CreatePromotionData[]): Promise<Promotion[]> {
    const response = await api.post<ApiResponse<Promotion[]>>(`${this.basePath}/createMany`, data);
    return response.data.data || response.data;
  }

  /**
   * Update an existing promotion
   * @param id - The ID of the promotion to update
   * @param data - The promotion data to update
   * @returns Promise with the updated promotion
   */
  async update(id: string, data: Partial<CreatePromotionData>): Promise<Promotion> {
    const response = await api.put<ApiResponse<Promotion>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a promotion
   * @param id - The ID of the promotion to delete
   * @returns Promise with the deleted promotion or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const promotionService = new PromotionService(); 