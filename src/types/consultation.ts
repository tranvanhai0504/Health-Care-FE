import { GetManyParams } from './api';
import { Specialty } from './specialty';

/**
 * Specialization interface
 */
export interface Specialization {
  _id: string;
  name: string;
  description: string;
}

/**
 * Consultation Service interface
 */
export interface ConsultationService {
  _id: string;
  name: string;
  description: string;
  duration: number;
  room?: string;
  doctor?: string;
  price: number;
  specialization?: string | Specialty; // Can be either a string ID or populated object
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Update many consultation services request
 */
export interface UpdateManyConsultationServiceRequest {
  ids: string[];
  data: Partial<ConsultationService>;
}

/**
 * Consultation Service get many params interface
 */
export interface ConsultationServiceGetManyParams extends GetManyParams {
  name?: string;
  specialization?: string;
  doctor?: string;
  duration?: number;
  minPrice?: number;
  maxPrice?: number;
} 