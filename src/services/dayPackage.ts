import BaseService from './base';
import api from '@/lib/axios';
import { PeriodPackage } from './periodPackage';

export interface DayPackage {
  _id: string;
  day_offset: number;
  period_pkgs: string[] | PeriodPackage[];
  __v?: number;
}

export interface CreateDayPackageData {
  day_offset: number;
  period_pkgs: string[];
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

export class DayPackageService extends BaseService<DayPackage> {
  constructor() {
    super('/api/v1/day-package');
  }

  /**
   * Get all day packages
   * @returns Promise with array of day packages
   */
  async getAll(): Promise<DayPackage[]> {
    const response = await api.get<ApiResponse<DayPackage[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a day package by ID
   * @param id - The ID of the day package to get
   * @returns Promise with the day package
   */
  async getById(id: string): Promise<DayPackage> {
    const response = await api.get<ApiResponse<DayPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new day package
   * @param data - The day package data to create
   * @returns Promise with the created day package
   */
  async create(data: CreateDayPackageData): Promise<DayPackage> {
    const response = await api.post<ApiResponse<DayPackage>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing day package
   * @param id - The ID of the day package to update
   * @param data - The day package data to update
   * @returns Promise with the updated day package
   */
  async update(id: string, data: Partial<CreateDayPackageData>): Promise<DayPackage> {
    const response = await api.put<ApiResponse<DayPackage>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a day package
   * @param id - The ID of the day package to delete
   * @returns Promise with the deleted day package
   */
  async delete(id: string): Promise<DayPackage> {
    const response = await api.delete<ApiResponse<DayPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const dayPackageService = new DayPackageService(); 