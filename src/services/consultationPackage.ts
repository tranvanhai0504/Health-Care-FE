import BaseService from "./base";
import api from "@/lib/axios";

export interface PriceOption {
  tier: string;
  price: number;
  testsIncluded: number;
  _id?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  _id?: string;
}

export interface BookingOption {
  type: string;
  description: string;
  actionUrl: string;
  _id?: string;
}

export interface ConsultationPackage {
  _id: string;
  title: string;
  icon: string;
  description: string;
  features: string[];
  priceOptions: PriceOption[];
  tests: string[];
  faq: FAQ[];
  bookingOptions: BookingOption[];
  maxSlotPerPeriod?: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateConsultationPackageData {
  title: string;
  icon: string;
  description: string;
  features: string[];
  priceOptions: Omit<PriceOption, '_id'>[];
  tests: string[];
  faq: Omit<FAQ, '_id'>[];
  bookingOptions: Omit<BookingOption, '_id'>[];
  maxSlotPerPeriod?: number;
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

export class ConsultationPackageService extends BaseService<ConsultationPackage> {
  constructor() {
    super("/api/v1/consultation-package");
  }

  /**
   * Get all consultation packages
   * @returns Promise with array of consultation packages
   */
  async getAll(): Promise<ConsultationPackage[]> {
    try {
      const response = await api.get<ConsultationPackage[] | ApiResponse<ConsultationPackage[]>>(this.basePath);
      
      // Handle both direct array response and ApiResponse format
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && 'data' in response.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching consultation packages:", error);
      return [];
    }
  }

  /**
   * Get a single consultation package by ID
   * @param id - The ID of the package to get
   * @returns Promise with the consultation package
   */
  async getById(id: string): Promise<ConsultationPackage> {
    const response = await api.get<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get detailed information for a consultation package by ID
   * @param id - The ID of the package to get
   * @returns Promise with the detailed consultation package
   */
  async getDetailById(id: string): Promise<ConsultationPackage> {
    const response = await api.get<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}/details`);
    return response.data.data;
  }

  /**
   * Create a new consultation package
   * @param data - The package data to create
   * @returns Promise with the created package
   */
  async create(data: CreateConsultationPackageData): Promise<ConsultationPackage> {
    const response = await api.post<ApiResponse<ConsultationPackage>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing consultation package
   * @param id - The ID of the package to update
   * @param data - The package data to update
   * @returns Promise with the updated package
   */
  async update(id: string, data: Partial<CreateConsultationPackageData>): Promise<ConsultationPackage> {
    const response = await api.put<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a consultation package
   * @param id - The ID of the package to delete
   * @returns Promise with the deleted package or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<ConsultationPackage>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const consultationPackageService = new ConsultationPackageService();
