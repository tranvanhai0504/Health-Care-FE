import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  Doctor,
  CreateDoctorData,
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams
} from '@/types';

export class DoctorService extends BaseService<Doctor> {
  constructor() {
    super('/api/v1/doctor');
  }

  /**
   * Get all doctors
   * @returns Promise with array of doctors
   */
  async getAll(): Promise<Doctor[]> {
    const response = await api.get<ApiResponse<Doctor[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get doctors with pagination support
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing doctors and pagination info
   */
  async getPaginated(params?: PaginationParams & Record<string, unknown>): Promise<PaginatedApiResponse<Doctor>> {
    const response = await api.get<PaginatedApiResponse<Doctor>>(`${this.basePath}/many`, {
      params
    });
    return response.data;
  }

  /**
   * Get a doctor by ID
   * @param id - The ID of the doctor to get
   * @returns Promise with the doctor
   */
  async getById(id: string): Promise<Doctor> {
    const response = await api.get<ApiResponse<Doctor>>(`${this.basePath}/${id}`);
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
    const response = await api.put<ApiResponse<Doctor>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a doctor profile
   * @param id - The ID of the doctor to delete
   * @returns Promise with the deleted doctor profile
   */
  async delete(id: string): Promise<Doctor> {
    const response = await api.delete<ApiResponse<Doctor>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const doctorService = new DoctorService(); 