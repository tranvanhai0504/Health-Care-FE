import { GetManyParams } from "./api";

/**
 * User interface
 */
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
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update user data interface
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  avatar?: string | File;
} 

export interface UserGetAllParams extends GetManyParams {
  role?: string;
  name?: string;
  phoneNumber?: string;
}