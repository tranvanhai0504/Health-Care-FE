import BaseService, { ApiResponse } from './base';
import api from '@/lib/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  occupation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
}

class UserService extends BaseService<User> {
  constructor() {
    super('/api/v1/user');
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