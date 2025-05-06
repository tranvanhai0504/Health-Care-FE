import BaseService from './base';
import api from '@/lib/axios';

export interface ConsultationService {
  _id: string;
  name: string;
  description: string;
  room?: string;
  doctor?: string;
  price: number;
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