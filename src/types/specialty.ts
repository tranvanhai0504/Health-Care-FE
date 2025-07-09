import { Blog } from './blog';

/**
 * Specialty interface
 */
export interface Specialty {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Specialty with blogs interface
 */
export interface SpecialtyWithBlogs {
  specialty: Specialty;
  blogs: Blog[];
} 