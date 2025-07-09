import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
  MedicalExamination,
  CreateMedicalExaminationData
} from '@/types';

export class MedicalExaminationService extends BaseService<MedicalExamination> {
  constructor() {
    super('/api/v1/medical-examinations');
  }

  /**
   * Get all medical examinations with pagination
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with paginated response containing examinations and pagination info
   */
  async getPaginated(params?: PaginationParams & Record<string, unknown>): Promise<PaginatedApiResponse<MedicalExamination>> {
    const response = await api.get<PaginatedApiResponse<MedicalExamination>>(this.basePath, {
      params
    });
    return response.data;
  }

  /**
   * Get all medical examinations
   * @param params - Optional query parameters
   * @returns Promise with array of examinations
   */
  async getAll(params?: Record<string, unknown>): Promise<MedicalExamination[]> {
    const response = await api.get<ApiResponse<MedicalExamination[]>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get a medical examination by ID
   * @param id - The ID of the examination to get
   * @returns Promise with the examination
   */
  async getById(id: string): Promise<MedicalExamination> {
    const response = await api.get<ApiResponse<MedicalExamination>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get current user's medical examinations
   * @returns Promise with array of user's examinations
   */
  async getUserExaminations(): Promise<MedicalExamination[]> {
    const response = await api.get<ApiResponse<MedicalExamination[]>>(`${this.basePath}/user`);
    return response.data.data;
  }

  /**
   * Get examinations by patient ID
   * @param patientId - The ID of the patient
   * @returns Promise with array of patient's examinations
   */
  async getByPatientId(patientId: string): Promise<MedicalExamination[]> {
    const response = await api.get<ApiResponse<MedicalExamination[]>>(`${this.basePath}/patient/${patientId}`);
    return response.data.data;
  }

  /**
   * Create a new medical examination
   * @param data - The examination data to create
   * @returns Promise with the created examination
   */
  async create(data: CreateMedicalExaminationData): Promise<MedicalExamination> {
    const response = await api.post<ApiResponse<MedicalExamination>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing medical examination (Doctor only)
   * @param id - The ID of the examination to update
   * @param data - The examination data to update
   * @returns Promise with the updated examination
   */
  async update(id: string, data: Partial<CreateMedicalExaminationData>): Promise<MedicalExamination> {
    const response = await api.patch<ApiResponse<MedicalExamination>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a medical examination
   * @param id - The ID of the examination to delete
   * @returns Promise with the deleted examination or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const medicalExaminationService = new MedicalExaminationService(); 