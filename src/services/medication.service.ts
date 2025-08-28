import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  ApiResponse,
  PaginatedApiResponse,
  GetManyParams,
  Medication,
  CreateMedicationData,
  UpdateMedicationData,
  MedicationFilterOptions,
  MedicationAdvancedOptions
} from '@/types';

export class MedicationService extends BaseService<Medication> {
  constructor() {
    super('/api/v1/medications');
  }

  /**
   * Get all medications with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated medications
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medication>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get many medications (paginated endpoint)
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with paginated medications
   */
  async getMany(params?: GetManyParams): Promise<PaginatedApiResponse<Medication>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(`${this.basePath}/many`, {
      params
    });
    
    return response.data.data;
  }

  /**
   * Get medications with advanced filtering options
   * @param filterOptions - Basic filter options
   * @param advancedOptions - Advanced filtering, pagination, and sorting options
   * @returns Promise with paginated medications
   */
  async getWithFilters(
    filterOptions?: MedicationFilterOptions,
    advancedOptions?: MedicationAdvancedOptions
  ): Promise<PaginatedApiResponse<Medication>> {
    const params: Record<string, unknown> = {};

    // Add basic filter options
    if (filterOptions) {
      if (filterOptions.medicine) params.medicine = filterOptions.medicine;
      if (filterOptions.minQuantity) params.minQuantity = filterOptions.minQuantity;
      if (filterOptions.maxQuantity) params.maxQuantity = filterOptions.maxQuantity;
      if (filterOptions.frequency) params.frequency = filterOptions.frequency;
      if (filterOptions.duration) params.duration = filterOptions.duration;
    }

    // Add advanced options as JSON string
    if (advancedOptions) {
      params.options = JSON.stringify(advancedOptions);
    }

    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get a medication by ID
   * @param id - The ID of the medication to get
   * @returns Promise with the medication
   */
  async getById(id: string): Promise<Medication> {
    const response = await api.get<ApiResponse<Medication>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new medication
   * @param data - The medication data to create
   * @returns Promise with the created medication
   */
  async create(data: CreateMedicationData): Promise<Medication> {
    const response = await api.post<ApiResponse<Medication>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing medication
   * @param id - The ID of the medication to update
   * @param data - The medication data to update
   * @returns Promise with the updated medication
   */
  async update(id: string, data: UpdateMedicationData): Promise<Medication> {
    const response = await api.put<ApiResponse<Medication>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a medication
   * @param id - The ID of the medication to delete
   * @returns Promise with success message
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get medications by medicine ID
   * @param medicineId - The ID of the medicine
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medications for the specific medicine
   */
  async getByMedicine(medicineId: string, params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medication>> {
    const queryParams = { medicine: medicineId, ...params };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Get medications by quantity range
   * @param minQuantity - Minimum quantity
   * @param maxQuantity - Maximum quantity
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medications in the quantity range
   */
  async getByQuantityRange(
    minQuantity: number, 
    maxQuantity: number, 
    params?: Record<string, unknown>
  ): Promise<PaginatedApiResponse<Medication>> {
    const queryParams = { 
      minQuantity, 
      maxQuantity, 
      ...params 
    };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Search medications by frequency pattern
   * @param frequency - Frequency pattern to search for
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medications matching the frequency pattern
   */
  async searchByFrequency(frequency: string, params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medication>> {
    const queryParams = { frequency, ...params };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Search medications by duration pattern
   * @param duration - Duration pattern to search for
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medications matching the duration pattern
   */
  async searchByDuration(duration: string, params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medication>> {
    const queryParams = { duration, ...params };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medication>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Bulk create medications
   * @param medications - Array of medication data to create
   * @returns Promise with array of created medications
   */
  async bulkCreate(medications: CreateMedicationData[]): Promise<Medication[]> {
    const response = await api.post<ApiResponse<Medication[]>>(`${this.basePath}/bulk`, { medications });
    return response.data.data;
  }

  /**
   * Bulk update medications
   * @param updates - Array of objects with id and update data
   * @returns Promise with array of updated medications
   */
  async bulkUpdate(updates: Array<{ id: string; data: UpdateMedicationData }>): Promise<Medication[]> {
    const response = await api.put<ApiResponse<Medication[]>>(`${this.basePath}/bulk`, { updates });
    return response.data.data;
  }

  /**
   * Bulk delete medications
   * @param ids - Array of medication IDs to delete
   * @returns Promise with success message
   */
  async bulkDelete(ids: string[]): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete<ApiResponse<{ message: string; deletedCount: number }>>(`${this.basePath}/bulk`, { 
      data: { ids } 
    });
    return response.data.data;
  }
}

export const medicationService = new MedicationService();
