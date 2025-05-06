import BaseService from './base';
import api from '@/lib/axios';
import { ConsultationPackage } from './consultationPackage';

export interface PeriodPackage {
  _id: string;
  pkg: string | ConsultationPackage;
  booked: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreatePeriodPackageData {
  pkg: string;
  booked: number;
  startTime: string;
  endTime: string;
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

export class PeriodPackageService extends BaseService<PeriodPackage> {
  constructor() {
    super('/api/v1/period-package');
  }

  /**
   * Get all period packages
   * @returns Promise with array of period packages
   */
  async getAll(): Promise<PeriodPackage[]> {
    const response = await api.get<ApiResponse<PeriodPackage[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a period package by ID
   * @param id - The ID of the period package to get
   * @returns Promise with the period package
   */
  async getById(id: string): Promise<PeriodPackage> {
    const response = await api.get<ApiResponse<PeriodPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new period package
   * @param data - The period package data to create
   * @returns Promise with the created period package
   */
  async create(data: CreatePeriodPackageData): Promise<PeriodPackage> {
    const response = await api.post<ApiResponse<PeriodPackage>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing period package
   * @param id - The ID of the period package to update
   * @param data - The period package data to update
   * @returns Promise with the updated period package
   */
  async update(id: string, data: Partial<CreatePeriodPackageData>): Promise<PeriodPackage> {
    const response = await api.put<ApiResponse<PeriodPackage>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a period package
   * @param id - The ID of the period package to delete
   * @returns Promise with the deleted period package
   */
  async delete(id: string): Promise<PeriodPackage> {
    const response = await api.delete<ApiResponse<PeriodPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const periodPackageService = new PeriodPackageService(); 