import BaseService from './base';
import api from '@/lib/axios';

export interface Doctor {
  _id: string;
  user: string;
  specialization: string;
  experience: number;
  qualifications: string[];
  bio?: string;
  consultationFee: number;
  availability: string[]; // This could be more structured based on your API
  reviews: string[]; // This could be more structured based on your API
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorData {
  specialization: string;
  experience: number;
  qualifications: string[];
  consultationFee: number;
  bio?: string;
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

export class DoctorService extends BaseService<Doctor> {
  constructor() {
    super('/api/v1/doctor');
  }

  /**
   * Get all doctors
   * @returns Promise with array of doctors
   */
  async getAll(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>(this.basePath);
    return response.data;
  }

  /**
   * Get a doctor by ID
   * @param id - The ID of the doctor to get
   * @returns Promise with the doctor
   */
  async getById(id: string): Promise<Doctor> {
    const response = await api.get<ApiResponse<Doctor>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new doctor profile
   * @param data - The doctor data to create
   * @returns Promise with the created doctor profile
   */
  async create(data: CreateDoctorData): Promise<Doctor> {
    const response = await api.post<Doctor>(this.basePath, data);
    return response.data;
  }
}

export const doctorService = new DoctorService(); 