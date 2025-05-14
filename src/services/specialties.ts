import api from '@/lib/axios';
import { Blog } from './blogs';

export interface Specialty {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ApiResponse<T> {
  data: T;
  msg: string;
  code: number;
}

interface SpecialtyWithBlogs {
  specialty: Specialty;
  blogs: Blog[];
}

export class SpecialtyService {
  private basePath = '/api/v1/specialties';

  /**
   * Get all specialties
   * @returns Promise with array of specialties
   */
  async getAll(): Promise<Specialty[]> {
    const response = await api.get<ApiResponse<Specialty[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a specialty by ID with related blogs
   * @param id - The ID of the specialty to get
   * @returns Promise with the specialty and related blogs
   */
  async getById(id: string): Promise<SpecialtyWithBlogs> {
    const response = await api.get<ApiResponse<SpecialtyWithBlogs>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get a single specialty by ID without blogs
   * @param id - The ID of the specialty to get
   * @returns Promise with the specialty
   */
  async getSpecialtyOnly(id: string): Promise<Specialty> {
    const response = await api.get<ApiResponse<SpecialtyWithBlogs>>(`${this.basePath}/${id}`);
    return response.data.data.specialty;
  }

  /**
   * Create a new specialty
   * @param data - The specialty data to create
   * @returns Promise with the created specialty
   */
  async create(data: Partial<Specialty>): Promise<Specialty> {
    const response = await api.post<ApiResponse<Specialty>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update a specialty
   * @param id - The ID of the specialty to update
   * @param data - The updated specialty data
   * @returns Promise with the updated specialty
   */
  async update(id: string, data: Partial<Specialty>): Promise<Specialty> {
    const response = await api.put<ApiResponse<Specialty>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a specialty
   * @param id - The ID of the specialty to delete
   * @returns Promise with the deleted specialty
   */
  async delete(id: string): Promise<Specialty> {
    const response = await api.delete<ApiResponse<Specialty>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get blogs by specialty ID
   * @param id - The ID of the specialty to get blogs for
   * @returns Promise with array of blogs
   */
  async getBlogsBySpecialtyId(id: string): Promise<Blog[]> {
    const response = await api.get<ApiResponse<SpecialtyWithBlogs>>(`${this.basePath}/${id}`);
    return response.data.data.blogs;
  }
}

export const specialtyService = new SpecialtyService();
