import BaseService from './base';
import api from '@/lib/axios';

export interface Schedule {
  _id: string;
  userId: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  package_id: string;
  package_period_id: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateScheduleData {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  package_id: string;
  packagePeriodId: string;
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

export class ScheduleService extends BaseService<Schedule> {
  constructor() {
    super('/api/v1/schedule');
  }

  /**
   * Get all schedules
   * @returns Promise with array of schedules
   */
  async getAll(): Promise<Schedule[]> {
    const response = await api.get<ApiResponse<Schedule[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a schedule by ID
   * @param id - The ID of the schedule to get
   * @returns Promise with the schedule
   */
  async getById(id: string): Promise<Schedule> {
    const response = await api.get<ApiResponse<Schedule>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new schedule
   * @param data - The schedule data to create
   * @returns Promise with the created schedule
   */
  async create(data: CreateScheduleData): Promise<Schedule> {
    const response = await api.post<ApiResponse<Schedule>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing schedule
   * @param id - The ID of the schedule to update
   * @param data - The schedule data to update
   * @returns Promise with the updated schedule
   */
  async update(id: string, data: Partial<CreateScheduleData>): Promise<Schedule> {
    const response = await api.put<ApiResponse<Schedule>>(`${this.basePath}/${id}`, data);
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
}

export const scheduleService = new ScheduleService(); 