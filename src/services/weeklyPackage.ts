import BaseService from './base';
import api from '@/lib/axios';
import { DayPackage } from './dayPackage';

export interface WeeklyPackage {
  _id: string;
  startDate: string;
  endDate: string;
  packageDays: string[] | DayPackage[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateWeeklyPackageData {
  startDate: string;
  endDate: string;
  packageDays: string[];
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

export class WeeklyPackageService extends BaseService<WeeklyPackage> {
  constructor() {
    super('/api/v1/package-week');
  }

  /**
   * Get all weekly packages
   * @returns Promise with array of weekly packages
   */
  async getAll(): Promise<WeeklyPackage[]> {
    const response = await api.get<ApiResponse<WeeklyPackage[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a weekly package by ID
   * @param id - The ID of the weekly package to get
   * @returns Promise with the weekly package
   */
  async getById(id: string): Promise<WeeklyPackage> {
    const response = await api.get<ApiResponse<WeeklyPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get a weekly package with full details by ID
   * @param id - The ID of the weekly package to get
   * @returns Promise with the weekly package including expanded related entities
   */
  async getDetailById(id: string): Promise<WeeklyPackage> {
    const response = await api.get<ApiResponse<WeeklyPackage>>(`${this.basePath}/${id}/details`);
    return response.data.data;
  }

  /**
   * Create a new weekly package
   * @param data - The weekly package data to create
   * @returns Promise with the created weekly package
   */
  async create(data: CreateWeeklyPackageData): Promise<WeeklyPackage> {
    const response = await api.post<ApiResponse<WeeklyPackage>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing weekly package
   * @param id - The ID of the weekly package to update
   * @param data - The weekly package data to update
   * @returns Promise with the updated weekly package
   */
  async update(id: string, data: Partial<CreateWeeklyPackageData>): Promise<WeeklyPackage> {
    const response = await api.put<ApiResponse<WeeklyPackage>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a weekly package
   * @param id - The ID of the weekly package to delete
   * @returns Promise with the deleted weekly package
   */
  async delete(id: string): Promise<WeeklyPackage> {
    const response = await api.delete<ApiResponse<WeeklyPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const weeklyPackageService = new WeeklyPackageService(); 