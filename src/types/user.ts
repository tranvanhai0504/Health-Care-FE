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
} 

export interface UserGetAllParams extends GetManyParams {
  role?: string;
  name?: string;
  phoneNumber?: string;
}