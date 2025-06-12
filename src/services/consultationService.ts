import BaseService from './base';
import api from '@/lib/axios';
import axios from 'axios';

export interface Specialization {
  _id: string;
  name: string;
  description: string;
}

export interface ConsultationService {
  _id: string;
  name: string;
  description: string;
  duration: number;
  room?: string;
  doctor?: string;
  price: number;
  specialization?: string; // This should be a string ID, not the full object
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ApiResponse<T> {
  data: T;
  msg?: string;
  message?: string;
  code?: number;
  success?: boolean;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface UpdateManyRequest {
  ids: string[];
  data: Partial<ConsultationService>;
}

export class ConsultationServiceApiService extends BaseService<ConsultationService> {
  constructor() {
    super('/api/v1/consultation-service');
  }

  /**
   * Get all consultation services
   * @returns Promise with array of consultation services
   */
  async getAll(): Promise<ConsultationService[]> {
    const response = await api.get<ApiResponse<ConsultationService[]>>(this.basePath);
    return response.data.data || response.data;
  }

  /**
   * Get many consultation services with pagination
   * @param params - Pagination parameters
   * @returns Promise with array of consultation services
   */
  async getMany(params?: PaginationParams): Promise<ConsultationService[]> {
    const response = await api.get<ApiResponse<ConsultationService[]>>(`${this.basePath}/many`, {
      params
    });
    return response.data.data || response.data;
  }

  /**
   * Get a consultation service by ID
   * @param id - The ID of the service to get
   * @returns Promise with the consultation service
   */
  async getById(id: string): Promise<ConsultationService> {
    const response = await api.get<ApiResponse<ConsultationService>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get a single consultation service by ID, returns null if not found
   * @param id - The ID of the service to get
   * @returns Promise with the consultation service or null if not found
   */
  async getByIdSafe(id: string): Promise<ConsultationService | null> {
    try {
      const response = await api.get<ApiResponse<ConsultationService>>(`${this.basePath}/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      // If status is 404, return null silently
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get consultation services by specialization
   * @param specialization - The specialization to filter by
   * @returns Promise with array of consultation services
   */
  async getBySpecialization(specialization: string): Promise<ConsultationService[]> {
    const response = await api.get<ApiResponse<ConsultationService[]>>(`${this.basePath}/specialization/${specialization}`);
    return response.data.data || response.data;
  }

  /**
   * Get multiple consultation services by their IDs
   * @param ids - Array of service IDs to retrieve
   * @returns Promise with array of consultation services (skips any not found)
   */
  async getByIds(ids: string[]): Promise<ConsultationService[]> {
    // Use Promise.allSettled to handle individual failures
    const promises = ids.map(id => this.getByIdSafe(id));
    try {
      const results = await Promise.allSettled(promises);
      
      // Filter out rejected promises and null values from fulfilled promises
      return results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<ConsultationService>).value);
    } catch (error) {
      console.error('Error fetching multiple consultation services:', error);
      return [];
    }
  }

  /**
   * Create a new consultation service
   * @param data - The service data to create
   * @returns Promise with the created service
   */
  async create(data: Partial<ConsultationService>): Promise<ConsultationService> {
    const response = await api.post<ApiResponse<ConsultationService>>(this.basePath, data);
    return response.data.data || response.data;
  }

  /**
   * Create multiple consultation services at once
   * @param data - Array of consultation services to create
   * @returns Promise with the created services
   */
  async createMany(data: Partial<ConsultationService>[]): Promise<ConsultationService[]> {
    const response = await api.post<ApiResponse<ConsultationService[]>>(`${this.basePath}/createMany`, data);
    return response.data.data || response.data;
  }

  /**
   * Update a consultation service
   * @param id - The ID of the service to update
   * @param data - The updated service data
   * @returns Promise with the updated service
   */
  async update(id: string, data: Partial<ConsultationService>): Promise<ConsultationService> {
    const response = await api.put<ApiResponse<ConsultationService>>(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }

  /**
   * Update multiple consultation services with the same data
   * @param ids - Array of service IDs to update
   * @param data - The updated service data
   * @returns Promise with the updated services
   */
  async updateMany(ids: string[], data: Partial<ConsultationService>): Promise<ConsultationService[]> {
    const requestBody: UpdateManyRequest = { ids, data };
    const response = await api.put<ConsultationService[]>(`${this.basePath}/many`, requestBody);
    return response.data;
  }

  /**
   * Delete a consultation service
   * @param id - The ID of the service to delete
   * @returns Promise with the deleted service
   */
  async delete(id: string): Promise<ConsultationService> {
    const response = await api.delete<ApiResponse<ConsultationService>>(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }
}

export const consultationServiceApi = new ConsultationServiceApiService(); 