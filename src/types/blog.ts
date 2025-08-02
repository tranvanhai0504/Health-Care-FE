import { GetManyParams } from "./api";
import { User } from "./user";

/**
 * Blog interface
 */
export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string | User;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  coverImage?: string;
  specialties: string[];
}

/**
 * Blog get all response interface
 */
export interface BlogGetAllResponse {
  title: string;
  _id: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Blog get many params interface
 */
export interface BlogGetManyParams extends GetManyParams {
  title?: string;
  active?: boolean;
  specialties?: string[];
} 