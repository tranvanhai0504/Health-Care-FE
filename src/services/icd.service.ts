import api from "@/lib/axios";
import { ApiResponse, PaginatedApiResponse } from "@/types/api";
import { ICD, ICDSearchParams } from "@/types/icd";

// Define interface for getAll parameters
export interface ICDGetAllParams {
  page?: number;
  limit?: number;
  code?: string;
  range?: string;
  title?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ICDService {
  private basePath = "/api/v1/icd";

  /**
   * Get all ICD codes with pagination and filtering
   * @param params - Parameters for filtering, sorting, and pagination
   * @returns Promise with paginated response containing ICD codes
   */
  async getAll(params?: ICDGetAllParams): Promise<PaginatedApiResponse<ICD>> {
    const response = await api.get<PaginatedApiResponse<ICD>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  /**
   * Search for ICD codes
   * @param params - Search parameters including query string
   * @returns Promise with paginated response containing ICD codes
   */
  async search(params: ICDSearchParams): Promise<PaginatedApiResponse<ICD>> {
    const response = await api.post<ApiResponse<PaginatedApiResponse<ICD>>>(
      `${this.basePath}/search`,
      {},
      { params: { q: params.q, page: params.page, limit: params.limit } }
    );
    return response.data.data;
  }

  /**
   * Get an ICD by ID
   * @param id - The ID of the ICD to get
   * @returns Promise with the ICD
   */
  async getById(id: string): Promise<ICD> {
    const response = await api.get<ApiResponse<ICD>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get multiple ICDs by their IDs
   * @param ids - Array of ICD IDs to retrieve
   * @returns Promise with array of ICDs
   */
  async getByIds(ids: string[]): Promise<ICD[]> {
    if (ids.length === 0) return [];
    
    const response = await api.get<ApiResponse<ICD[]>>(
      `${this.basePath}/many`,
      { params: { ids: ids.join(',') } }
    );
    return response.data.data;
  }
}

export const icdService = new ICDService();