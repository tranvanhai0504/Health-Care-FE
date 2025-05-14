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
  room?: string;
  doctor?: string;
  price: number;
  specialization?: Specialization;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
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
    const response = await api.get<ConsultationService[]>(this.basePath);
    return response.data;
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
    const response = await api.post<ConsultationService>(this.basePath, data);
    return response.data;
  }

  /**
   * Create multiple consultation services at once
   * @param data - Array of consultation services to create
   * @returns Promise with the created services
   */
  async createMany(data: Partial<ConsultationService>[]): Promise<ConsultationService[]> {
    const response = await api.post<ConsultationService[]>(this.basePath, data);
    return response.data;
  }
}

export const consultationServiceApi = new ConsultationServiceApiService(); 