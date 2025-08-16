import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  ApiResponse,
  PaginatedApiResponse,
  MedicalExamination,
  PopulatedMedicalExamination,
  CreateMedicalExaminationData,
  UpdateMedicalExaminationData,
  MedicalExaminationGetManyParams
} from '@/types';

export class MedicalExaminationService extends BaseService<MedicalExamination> {
  constructor() {
    super('/api/v1/medical-examinations');
  }

  /**
   * Create a new medical examination
   * POST /
   * Auth: Required | Role: Any authenticated user
   * @param data - The examination data to create
   * @returns Promise with the created examination
   */
  async create(data: CreateMedicalExaminationData): Promise<MedicalExamination> {
    const response = await api.post<ApiResponse<MedicalExamination>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Get all medical examinations (base implementation)
   * @param params - Optional query parameters
   * @returns Promise with paginated examinations
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedApiResponse<MedicalExamination>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<MedicalExamination>>>(this.basePath, { params });
    return response.data.data;
  }

  /**
   * Get all medical examinations with advanced filtering and populated data
   * GET / - Get All Medical Examinations (Advanced Filtering)
   * Auth: Required | Role: Any authenticated user
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated examinations with populated references
   */
  async getAllPopulated(params?: MedicalExaminationGetManyParams): Promise<PaginatedApiResponse<PopulatedMedicalExamination>> {
    const queryParams: Record<string, string> = {};
    
    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.patient) queryParams.patient = params.patient;
      if (params.examinationDate) queryParams.examinationDate = params.examinationDate;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.prescription) queryParams.prescription = params.prescription;
      if (params.hasServices) queryParams.hasServices = params.hasServices;
      if (params.options) queryParams.options = JSON.stringify(params.options);
    }

    const response = await api.get<ApiResponse<PaginatedApiResponse<PopulatedMedicalExamination>>>(
      this.basePath, 
      { params: queryParams }
    );
    return response.data.data;
  }

  /**
   * Get current user's medical examinations
   * GET /user - Current User's Medical Examinations
   * Auth: Required | Role: Any authenticated user
   * @returns Promise with array of user's examinations (sorted by createdAt desc)
   */
  async getUserExaminations(): Promise<PopulatedMedicalExamination[]> {
    const response = await api.get<ApiResponse<PopulatedMedicalExamination[]>>(`${this.basePath}/user`);
    return response.data.data;
  }

  /**
   * Get a specific medical examination by ID (base implementation)
   * @param id - The ID of the examination to get
   * @returns Promise with the examination
   */
  async getById(id: string): Promise<MedicalExamination> {
    const response = await api.get<ApiResponse<MedicalExamination>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get a specific medical examination by ID with populated references
   * GET /:id - Get Specific Medical Examination
   * Auth: Required | Role: Any authenticated user
   * @param id - The ID of the examination to get
   * @returns Promise with the populated examination
   */
  async getByIdPopulated(id: string): Promise<PopulatedMedicalExamination> {
    const response = await api.get<ApiResponse<PopulatedMedicalExamination>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get examinations by patient ID
   * GET /patient/:patientId - Get Patient's Examinations
   * Auth: Required | Role: Any authenticated user
   * @param patientId - The ID of the patient
   * @returns Promise with array of patient's examinations (not paginated)
   */
  async getByPatientId(patientId: string): Promise<PopulatedMedicalExamination[]> {
    const response = await api.get<ApiResponse<PopulatedMedicalExamination[]>>(`${this.basePath}/patient/${patientId}`);
    return response.data.data;
  }

  /**
   * Update an existing medical examination
   * PATCH /:id - Update Medical Examination
   * Auth: Required | Role: DOCTOR only (enforced by checkRole middleware)
   * @param id - The ID of the examination to update
   * @param data - The examination data to update (partial update)
   * @returns Promise with the updated examination
   */
  async update(id: string, data: UpdateMedicalExaminationData): Promise<MedicalExamination> {
    const response = await api.patch<ApiResponse<MedicalExamination>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a medical examination
   * DELETE /:id - Delete Medical Examination
   * Auth: Required | Role: DOCTOR only (enforced by checkRole middleware)
   * @param id - The ID of the examination to delete
   * @returns Promise with the deletion result
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get examinations with advanced filtering using options parameter
   * @param filter - MongoDB filter object
   * @param pagination - Pagination options
   * @param sort - Sort options
   * @returns Promise with paginated examinations
   */
  async getWithAdvancedFilter(
    filter: Record<string, unknown> = {},
    pagination: { page?: number; limit?: number } = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaginatedApiResponse<PopulatedMedicalExamination>> {
    const options = {
      filter,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10
      },
      sort
    };

    return this.getAllPopulated({ options });
  }

  /**
   * Get examinations by date range
   * @param startDate - Start date (ISO format)
   * @param endDate - End date (ISO format)
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with paginated examinations
   */
  async getByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedApiResponse<PopulatedMedicalExamination>> {
    return this.getAllPopulated({
      startDate,
      endDate,
      page,
      limit
    });
  }

  /**
   * Get examinations with services
   * @param hasServices - Whether to get examinations with or without services
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with paginated examinations
   */
  async getWithServices(
    hasServices: boolean = true,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedApiResponse<PopulatedMedicalExamination>> {
    return this.getAllPopulated({
      hasServices: hasServices.toString(),
      page,
      limit
    });
  }

  /**
   * Get examinations by specific diagnosis ICD code
   * @param icdCode - ICD code to filter by
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with paginated examinations
   */
  async getByDiagnosisCode(
    icdCode: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedApiResponse<PopulatedMedicalExamination>> {
    const filter = {
      "finalDiagnosis.icdCode": icdCode
    };

    return this.getWithAdvancedFilter(filter, { page, limit });
  }

  /**
   * Get examinations that need follow-up
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with paginated examinations
   */
  async getWithFollowUp(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedApiResponse<PopulatedMedicalExamination>> {
    const filter = {
      "followUp.nextVisit": { $exists: true, $ne: null }
    };

    return this.getWithAdvancedFilter(filter, { page, limit });
  }
}

export const medicalExaminationService = new MedicalExaminationService(); 