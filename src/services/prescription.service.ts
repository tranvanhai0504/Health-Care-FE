import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  ApiResponse,
  PaginatedApiResponse,
  Prescription,
  CreatePrescriptionData,
  GetManyParams
} from '@/types';

export class PrescriptionService extends BaseService<Prescription> {
  constructor() {
    super('/api/v1/prescriptions');
  }

  /**
   * Get all prescriptions (Admin only)
   * @param params - Optional query parameters
   * @returns Promise with array of prescriptions
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedApiResponse<Prescription>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Prescription>>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get many prescriptions (paginated endpoint)
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with paginated prescriptions
   */
  async getMany(params?: GetManyParams): Promise<PaginatedApiResponse<Prescription>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Prescription>>>(`${this.basePath}/many`, {
      params
    });
    
    return response.data.data;
  }

  /**
   * Get a prescription by ID
   * @param id - The ID of the prescription to get
   * @returns Promise with the prescription
   */
  async getById(id: string): Promise<Prescription> {
    const response = await api.get<ApiResponse<Prescription>>(`${this.basePath}/${id}`);
    // Handle both response formats: response.data.data and response.data
    return response.data.data || response.data;
  }

  /**
   * Get doctor's prescriptions
   * @param params - Optional query parameters
   * @returns Promise with array of doctor's prescriptions
   */
  async getDoctorPrescriptions(params?: Record<string, unknown>): Promise<Prescription[]> {
    const response = await api.get<ApiResponse<Prescription[]>>(`${this.basePath}/doctor`, { params });
    return response.data.data;
  }

  /**
   * Get patient's prescriptions
   * @param params - Optional query parameters
   * @returns Promise with array of patient's prescriptions
   */
  async getPatientPrescriptions(params?: Record<string, unknown>): Promise<Prescription[]> {
    const response = await api.get<ApiResponse<Prescription[]>>(`${this.basePath}/patient`, { params });
    return response.data.data;
  }

  /**
   * Create a new prescription (Doctor only)
   * @param data - The prescription data to create
   * @returns Promise with the created prescription
   */
  async create(data: CreatePrescriptionData): Promise<Prescription> {
    const response = await api.post<ApiResponse<Prescription>>(this.basePath, data);
    
    // Handle both response formats: response.data.data and response.data
    const prescriptionData = response.data.data || response.data;
    
    return prescriptionData;
  }

  /**
   * Update an existing prescription (Doctor only)
   * @param id - The ID of the prescription to update
   * @param data - The prescription data to update
   * @returns Promise with the updated prescription
   */
  async update(id: string, data: Partial<CreatePrescriptionData>): Promise<Prescription> {
    const response = await api.put<ApiResponse<Prescription>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a prescription (Doctor only)
   * @param id - The ID of the prescription to delete
   * @returns Promise with the deleted prescription or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const prescriptionService = new PrescriptionService(); 