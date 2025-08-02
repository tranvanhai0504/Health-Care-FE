import { GetManyParams } from "./api";

/**
 * Doctor interface
 */
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

/**
 * Create doctor data interface
 */
export interface CreateDoctorData {
  specialization: string;
  experience: number;
  qualifications: string[];
  consultationFee: number;
  bio?: string;
}

/**
 * Doctor get all params interface
 */
export interface DoctorGetAllParams extends GetManyParams {
  specialization?: string;
  minExperience?: number;
  maxExperience?: number;
  minConsultationFee?: number;
  maxConsultationFee?: number;
  minRating?: number;
  bio?: string;
} 