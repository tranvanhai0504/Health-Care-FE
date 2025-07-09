import BaseService from "./base.service";
import api from "@/lib/axios";
import { 
  ConsultationPackage,
  CreateConsultationPackageData,
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
} from '@/types';

export class ConsultationPackageService extends BaseService<ConsultationPackage> {
  constructor() {
    super("/api/v1/consultation-package");
  }

  /**
   * Get all consultation packages
   * @returns Promise with array of consultation packages
   */
  async getAll(): Promise<ConsultationPackage[]> {
    try {
      const response = await api.get<ApiResponse<ConsultationPackage[]>>(this.basePath);
      
      // Handle the new API response format
      if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Fallback for other response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching consultation packages:", error);
      return [];
    }
  }

  /**
   * Get packages with pagination support
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing packages and pagination info
   */
  async getPaginated(params?: PaginationParams): Promise<PaginatedApiResponse<ConsultationPackage>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<ConsultationPackage>>>(`${this.basePath}/many`, {
      params
    });
    return response.data.data;
  }

  /**
   * Get a single consultation package by ID
   * @param id - The ID of the package to get
   * @returns Promise with the consultation package
   */
  async getById(id: string): Promise<ConsultationPackage> {
    const response = await api.get<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get detailed information for a consultation package by ID
   * @param id - The ID of the package to get
   * @returns Promise with the detailed consultation package
   */
  async getDetailById(id: string): Promise<ConsultationPackage> {
    const response = await api.get<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}/details`);
    return response.data.data;
  }

  /**
   * Create a new consultation package
   * @param data - The package data to create
   * @returns Promise with the created package
   */
  async create(data: CreateConsultationPackageData): Promise<ConsultationPackage> {
    const response = await api.post<ApiResponse<ConsultationPackage>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Create multiple consultation packages at once
   * @param data - Array of consultation packages to create
   * @returns Promise with the created packages
   */
  async createMany(data: CreateConsultationPackageData[]): Promise<ConsultationPackage[]> {
    const response = await api.post<ApiResponse<ConsultationPackage[]>>(`${this.basePath}/many`, data);
    return response.data.data || response.data;
  }

  /**
   * Update an existing consultation package
   * @param id - The ID of the package to update
   * @param data - The package data to update
   * @returns Promise with the updated package
   */
  async update(id: string, data: Partial<CreateConsultationPackageData>): Promise<ConsultationPackage> {
    const response = await api.put<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Update multiple consultation packages with the same data
   * @param requestData - The update request containing ids and data
   * @returns Promise with the updated packages
   */
  async updateMany(requestData: { ids: string[]; data: Partial<CreateConsultationPackageData> }): Promise<ConsultationPackage[]> {
    const response = await api.patch<ApiResponse<ConsultationPackage[]>>(`${this.basePath}/many`, requestData);
    return response.data.data || response.data;
  }

  /**
   * Delete a consultation package
   * @param id - The ID of the package to delete
   * @returns Promise with the deleted package or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const consultationPackageService = new ConsultationPackageService();
