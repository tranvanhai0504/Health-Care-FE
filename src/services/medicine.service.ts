import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  ApiResponse,
  PaginatedApiResponse,
  GetManyParams,
  Medicine,
  CreateMedicineData,
  UpdateMedicineData,
  MedicineFilterOptions,
  MedicineAdvancedOptions
} from '@/types';

export class MedicineService extends BaseService<Medicine> {
  constructor() {
    super('/api/v1/medicines');
  }

  /**
   * Get all medicines with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated medicines
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medicine>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medicine>>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get many medicines (paginated endpoint)
   * @param params - Pagination parameters and optional query parameters
   * @returns Promise with paginated medicines
   */
  async getMany(params?: GetManyParams): Promise<PaginatedApiResponse<Medicine>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medicine>>>(`${this.basePath}/many`, {
      params
    });
    
    return response.data.data;
  }

  /**
   * Get medicines with advanced filtering options
   * @param filterOptions - Basic filter options
   * @param advancedOptions - Advanced filtering, pagination, and sorting options
   * @returns Promise with paginated medicines
   */
  async getWithFilters(
    filterOptions?: MedicineFilterOptions,
    advancedOptions?: MedicineAdvancedOptions
  ): Promise<PaginatedApiResponse<Medicine>> {
    const params: Record<string, unknown> = {};

    // Add basic filter options
    if (filterOptions) {
      if (filterOptions.name) params.name = filterOptions.name;
      if (filterOptions.dosage) params.dosage = filterOptions.dosage;
      if (filterOptions.form) params.form = filterOptions.form;
      if (filterOptions.route) params.route = filterOptions.route;
    }

    // Add advanced options as JSON string
    if (advancedOptions) {
      params.options = JSON.stringify(advancedOptions);
    }

    const response = await api.get<ApiResponse<PaginatedApiResponse<Medicine>>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get a medicine by ID
   * @param id - The ID of the medicine to get
   * @returns Promise with the medicine
   */
  async getById(id: string): Promise<Medicine> {
    const response = await api.get<ApiResponse<Medicine>>(`${this.basePath}/${id}`);
    // Handle both response formats: response.data.data or response.data
    return response.data.data || response.data;
  }

  /**
   * Create a new medicine
   * @param data - The medicine data to create
   * @returns Promise with the created medicine
   */
  async create(data: CreateMedicineData): Promise<Medicine> {
    const response = await api.post<ApiResponse<Medicine>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing medicine
   * @param id - The ID of the medicine to update
   * @param data - The medicine data to update
   * @returns Promise with the updated medicine
   */
  async update(id: string, data: UpdateMedicineData): Promise<Medicine> {
    const response = await api.put<ApiResponse<Medicine>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a medicine
   * @param id - The ID of the medicine to delete
   * @returns Promise with success message
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Search medicines by name pattern
   * @param name - Name pattern to search for
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medicines matching the name pattern
   */
  async searchByName(name: string, params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medicine>> {
    const queryParams = { name, ...params };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medicine>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Get medicines by form
   * @param form - Medicine form to filter by
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medicines of the specified form
   */
  async getByForm(form: string, params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medicine>> {
    const queryParams = { form, ...params };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medicine>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Get medicines by route
   * @param route - Medicine route to filter by
   * @param params - Optional pagination parameters
   * @returns Promise with paginated medicines of the specified route
   */
  async getByRoute(route: string, params?: Record<string, unknown>): Promise<PaginatedApiResponse<Medicine>> {
    const queryParams = { route, ...params };
    const response = await api.get<ApiResponse<PaginatedApiResponse<Medicine>>>(this.basePath, { 
      params: queryParams 
    });
    return response.data.data;
  }

  /**
   * Bulk create medicines
   * @param medicines - Array of medicine data to create
   * @returns Promise with array of created medicines
   */
  async bulkCreate(medicines: CreateMedicineData[]): Promise<Medicine[]> {
    const response = await api.post<ApiResponse<Medicine[]>>(`${this.basePath}/bulk`, { medicines });
    return response.data.data;
  }

  /**
   * Bulk update medicines
   * @param updates - Array of objects with id and update data
   * @returns Promise with array of updated medicines
   */
  async bulkUpdate(updates: Array<{ id: string; data: UpdateMedicineData }>): Promise<Medicine[]> {
    const response = await api.put<ApiResponse<Medicine[]>>(`${this.basePath}/bulk`, { updates });
    return response.data.data;
  }

  /**
   * Bulk delete medicines
   * @param ids - Array of medicine IDs to delete
   * @returns Promise with success message
   */
  async bulkDelete(ids: string[]): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete<ApiResponse<{ message: string; deletedCount: number }>>(`${this.basePath}/bulk`, { 
      data: { ids } 
    });
    return response.data.data;
  }
}

export const medicineService = new MedicineService();