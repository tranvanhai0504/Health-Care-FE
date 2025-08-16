import BaseService from "./base.service";
import api from "@/lib/axios";
import {
  Doctor,
  DoctorWithPopulatedData,
  CreateDoctorData,
  DoctorGetAllParams,
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
} from "@/types";

export class DoctorService extends BaseService<Doctor> {
  constructor() {
    super("/api/v1/doctor");
  }

  /**
   * Get all doctors
   * @param params - Custom filter parameters for doctors
   * @returns Promise with paginated response containing doctors
   */
  async getAll(params?: DoctorGetAllParams): Promise<PaginatedApiResponse<Doctor>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Doctor>>>(
      this.basePath,
      {
        params: {
          ...params,
          options: JSON.stringify(params?.options),
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get a doctor by ID
   * @param id - The ID of the doctor to get
   * @returns Promise with the doctor
   */
  async getById(id: string): Promise<Doctor> {
    const response = await api.get<ApiResponse<Doctor>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Get doctors by specialization
   * @param specialization - The specialization to filter by
   * @param params - Pagination and filtering parameters
   * @returns Promise with paginated response containing doctors and pagination info
   */
  async getBySpecialization(
    specialization: string,
    params?: PaginationParams & { search?: string; sortBy?: string }
  ): Promise<PaginatedApiResponse<Doctor>> {
    const response = await api.get<PaginatedApiResponse<Doctor>>(
      `${this.basePath}/specialization/${specialization}`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new doctor profile
   * @param data - The doctor data to create
   * @returns Promise with the created doctor profile
   */
  async create(data: CreateDoctorData): Promise<Doctor> {
    const response = await api.post<ApiResponse<Doctor>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing doctor profile
   * @param id - The ID of the doctor to update
   * @param data - The doctor data to update
   * @returns Promise with the updated doctor profile
   */
  async update(id: string, data: Partial<CreateDoctorData>): Promise<Doctor> {
    const response = await api.patch<ApiResponse<Doctor>>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete a doctor profile
   * @param id - The ID of the doctor to delete
   * @returns Promise with the deleted doctor profile
   */
  async delete(id: string): Promise<Doctor> {
    const response = await api.delete<ApiResponse<Doctor>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Find one doctor by user ID with populated user and specialization data
   * @param userId - The user ID to find the doctor for
   * @returns Promise with the doctor profile including populated user and specialization
   */
  async findOneByUserId(userId: string): Promise<DoctorWithPopulatedData> {
    const response = await api.get<ApiResponse<DoctorWithPopulatedData>>(
      `${this.basePath}/findOne`,
      {
        params: {
          options: JSON.stringify({
            filter: { user: userId },
            populateOptions: { path: "user specialization" }
          })
        }
      }
    );
    return response.data.data;
  }
}

export const doctorService = new DoctorService();
