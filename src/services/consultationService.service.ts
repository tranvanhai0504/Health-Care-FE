import BaseService from "./base.service";
import api from "@/lib/axios";
import axios from "axios";
import {
  ConsultationService,
  PaginatedApiResponse,
  PaginationParams,
  ApiResponse,
} from "@/types";

export class ConsultationServiceApiService extends BaseService<ConsultationService> {
  constructor() {
    super("/api/v1/consultation-service");
  }

  /**
   * Get consultation services with pagination info
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing services and pagination info
   */
  async getPaginated(
    params?: PaginationParams
  ): Promise<PaginatedApiResponse<ConsultationService>> {
    const response = await api.get<PaginatedApiResponse<ConsultationService>>(
      `${this.basePath}/many`,
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get a consultation service by ID
   * @param id - The ID of the service to get
   * @returns Promise with the consultation service
   */
  async getById(id: string): Promise<ConsultationService> {
    const response = await api.get<ApiResponse<ConsultationService>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Get a single consultation service by ID, returns null if not found
   * @param id - The ID of the service to get
   * @returns Promise with the consultation service or null if not found
   */
  async getByIdSafe(id: string): Promise<ConsultationService | null> {
    try {
      const response = await api.get<ApiResponse<ConsultationService>>(
        `${this.basePath}/${id}`
      );
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
   * Get consultation services by specialization with pagination
   * @param specialization - The specialization to filter by
   * @param params - Pagination and filtering parameters
   * @returns Promise with paginated response containing services and pagination info
   */
  async getBySpecialization(
    specialization: string,
    params?: PaginationParams & { search?: string; sortBy?: string }
  ): Promise<PaginatedApiResponse<ConsultationService>> {
    const response = await api.get<
      ApiResponse<PaginatedApiResponse<ConsultationService>>
    >(`${this.basePath}/specialization/${specialization}`, { params });
    return response.data.data;
  }

  /**
   * Get multiple consultation services by their IDs
   * @param ids - Array of service IDs to retrieve
   * @returns Promise with array of consultation services (skips any not found)
   */
  async getByIds(ids: string[]): Promise<ConsultationService[]> {
    // Use Promise.allSettled to handle individual failures
    const promises = ids.map((id) => this.getByIdSafe(id));
    try {
      const results = await Promise.allSettled(promises);

      // Filter out rejected promises and null values from fulfilled promises
      return results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map(
          (result) =>
            (result as PromiseFulfilledResult<ConsultationService>).value
        );
    } catch (error) {
      console.error("Error fetching multiple consultation services:", error);
      return [];
    }
  }

  /**
   * Create a new consultation service
   * @param data - The service data to create
   * @returns Promise with the created service
   */
  async create(
    data: Partial<ConsultationService>
  ): Promise<ConsultationService> {
    const response = await api.post<ApiResponse<ConsultationService>>(
      this.basePath,
      data
    );
    return response.data.data || response.data;
  }

  /**
   * Create multiple consultation services at once
   * @param data - Array of consultation services to create
   * @returns Promise with the created services
   */
  async createMany(
    data: Partial<ConsultationService>[]
  ): Promise<ConsultationService[]> {
    const response = await api.post<ApiResponse<ConsultationService[]>>(
      `${this.basePath}/createMany`,
      data
    );
    return response.data.data || response.data;
  }

  /**
   * Update a consultation service
   * @param id - The ID of the service to update
   * @param data - The updated service data
   * @returns Promise with the updated service
   */
  async update(
    id: string,
    data: Partial<ConsultationService>
  ): Promise<ConsultationService> {
    const response = await api.put<ApiResponse<ConsultationService>>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data.data || response.data;
  }

  /**
   * Update multiple consultation services with the same data
   * @param requestData - Object containing ids array and data to update
   * @returns Promise with the updated services
   */
  async updateMany(requestData: {
    ids: string[];
    data: Partial<ConsultationService>;
  }): Promise<ConsultationService[]> {
    const response = await api.put<ConsultationService[]>(
      `${this.basePath}/many`,
      requestData
    );
    return response.data;
  }

  /**
   * Delete a consultation service
   * @param id - The ID of the service to delete
   * @returns Promise with the deleted service
   */
  async delete(id: string): Promise<ConsultationService> {
    const response = await api.delete<ApiResponse<ConsultationService>>(
      `${this.basePath}/${id}`
    );
    return response.data.data || response.data;
  }
}

export const consultationServiceApi = new ConsultationServiceApiService();
