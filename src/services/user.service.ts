import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  User,
  UpdateUserData,
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams
} from '@/types';

class UserService extends BaseService<User> {
  constructor() {
    super('/api/v1/user');
  }

  /**
   * Get all users (Admin functionality)
   * @returns Promise with array of users
   */
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get users with pagination support (Admin functionality)
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing users and pagination info
   */
  async getPaginated(params?: PaginationParams & Record<string, unknown>): Promise<PaginatedApiResponse<User>> {
    const response = await api.get<PaginatedApiResponse<User>>(`${this.basePath}/many`, {
      params
    });
    return response.data;
  }

  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`${this.basePath}/profile`);
    return response.data.data;
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(data: UpdateUserData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Create a new user (admin functionality)
   */
  async createUser(data: { phoneNumber: string; password: string }): Promise<User> {
    const response = await api.post<ApiResponse<User>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update a user by ID (admin functionality)
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a user by ID (admin functionality)
   */
  async deleteUser(id: string): Promise<User> {
    const response = await api.delete<ApiResponse<User>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get the profile with full response (includes code and message)
   */
  async getProfileWithResponse(): Promise<ApiResponse<User>> {
    return this.getFullResponse<User>(`${this.basePath}/profile`);
  }

  /**
   * Update the profile with full response (includes code and message)
   */
  async updateProfileWithResponse(data: UpdateUserData): Promise<ApiResponse<User>> {
    return this.getFullResponse<User>(this.basePath, 'patch', data as Record<string, unknown>);
  }
}

export const userService = new UserService(); 