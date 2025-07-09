import BaseService from './base.service';
import api from '@/lib/axios';
import { ApiResponse, GetManyParams, PaginatedApiResponse, PaginationParams } from '@/types/api';
import { CDateRange, Schedule, ScheduleResponse, ScheduleStatus } from '@/types/schedule';

export class ScheduleService extends BaseService<Schedule> {
  constructor() {
    super('/api/v1/schedule');
  }

  /**
   * Get all schedules with pagination (Admin/Doctor endpoint)
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing schedules and pagination info
   */
  async getMany(params?: GetManyParams): Promise<ScheduleResponse[]> {
    const response = await api.get<PaginatedApiResponse<ScheduleResponse>>(`${this.basePath}/many`, {
      params
    });
    return response.data.data;
  }

  /**
   * Get all schedules with pagination and return full response
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing schedules and pagination info
   */
  async getManyWithPagination(params?: PaginationParams): Promise<PaginatedApiResponse<ScheduleResponse>> {
    const response = await api.get<PaginatedApiResponse<ScheduleResponse>>(`${this.basePath}/many`, {
      params
    });
    return response.data;
  }

  /**
   * Get current user's schedules with pagination
   * @param params - Pagination and filtering parameters
   * @returns Promise with paginated response containing user schedules and pagination info
   */
  async getUserSchedules(params?: Record<string, string | number>): Promise<PaginatedApiResponse<ScheduleResponse>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<ScheduleResponse>>>(`${this.basePath}/user`, {
      params
    });
    return response.data.data;
  }

  /**
   * Get current week schedules
   * @returns Promise with array of current week schedules
   */
  async getCurrentWeekSchedules(): Promise<ScheduleResponse[]> {
    const response = await api.get<ApiResponse<ScheduleResponse[]>>(`${this.basePath}/current-week`);
    return response.data.data;
  }

  /**
   * Get schedules by specialization
   * @param specialization - The specialization to filter by
   * @returns Promise with array of schedules
   */
  async getBySpecialization(specialization?: string): Promise<ScheduleResponse[]> {
    const params = specialization ? { specialization } : undefined;
    const response = await api.get<ApiResponse<ScheduleResponse[]>>(`${this.basePath}/by-specialization`, {
      params
    });
    return response.data.data;
  }

  /**
   * Get all schedules
   * @returns Promise with array of schedules
   */
    async getAll(): Promise<ScheduleResponse[]> {
    const response = await api.get<ApiResponse<ScheduleResponse[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a schedule by ID
   * @param id - The ID of the schedule to get
   * @returns Promise with the schedule
   */
  async getById(id: string): Promise<ScheduleResponse> {
    const response = await api.get<ApiResponse<ScheduleResponse>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new schedule (booking)
   * @param data - The schedule data to create
   * @returns Promise with the created schedule
   */
  async create(data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.post<ApiResponse<Schedule>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing schedule
   * @param id - The ID of the schedule to update
   * @param data - The schedule data to update
   * @returns Promise with the updated schedule
   */
  async update(id: string, data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.patch<ApiResponse<Schedule>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a schedule
   * @param id - The ID of the schedule to delete
   * @returns Promise with the deleted schedule
   */
  async delete(id: string): Promise<Schedule> {
    const response = await api.delete<ApiResponse<Schedule>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Cancel a schedule (equivalent to cancelling an appointment)
   * @param id - The ID of the schedule to cancel
   * @returns Promise with the updated schedule
   */
  async cancelSchedule(id: string): Promise<Schedule> {
    return this.update(id, { status: ScheduleStatus.CANCELLED });
  }

  /**
   * Helper function to calculate week period from a selected date
   * @param selectedDate - The selected date
   * @returns CDateRange representing the week period
   */
  getWeekPeriod(selectedDate: Date): CDateRange {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      from: startOfWeek,
      to: endOfWeek
    };
  }

  /**
   * Helper function to calculate day offset from a selected date
   * @param selectedDate - The selected date
   * @returns number representing the day offset (0 = Sunday, 1 = Monday, etc.)
   */
  getDayOffset(selectedDate: Date): number {
    return selectedDate.getDay();
  }
}

export const scheduleService = new ScheduleService(); 