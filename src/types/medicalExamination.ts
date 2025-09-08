import { GetManyParams } from "./api";

/**
 * Subclinical result interface for medical examinations
 */
export interface SubclinicalResult {
  service: string; // ObjectId
  resultData: string;
  performedAt: string | Date;
  performedBy?: string; // ObjectId
  notes?: string;
}

/**
 * Populated subclinical result interface
 */
export interface PopulatedSubclinicalResult {
  service: {
    _id: string;
    name: string;
    description: string;
  };
  resultData: string;
  performedAt: string | Date;
  performedBy?: {
    _id: string;
    fullName: string;
  };
  notes?: string;
}

/**
 * Final diagnosis interface
 */
export interface FinalDiagnosis {
  icdCode: string;
  description: string;
  icdId?: string; // Add ICD ID field
}

/**
 * Follow-up information interface
 */
export interface FollowUp {
  schedule?: string;
  notes?: string;
}

/**
 * Follow-up creation request payload
 */
export interface CreateFollowUpRequest {
  notes?: string;
  schedule: {
    userId: string;
    dayOffset: number;
    timeOffset: number;
    services: string[];
    weekPeriod?: {
      from: string; // ISO date string
      to: string;   // ISO date string
    };
  };
}

/**
 * Medical examination interface
 */
export interface MedicalExamination {
  _id: string;
  patient: string; // ObjectId
  examinationDate: string;
  symptoms: string[];
  subclinicalResults: SubclinicalResult[];
  services?: string[]; // ObjectId array
  finalDiagnosis: FinalDiagnosis[];
  prescription?: string; // ObjectId
  followUp?: FollowUp;
  createdAt: string;
  updatedAt: string;
}

/**
 * Populated medical examination interface (with populated references)
 */
export interface PopulatedMedicalExamination {
  _id: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  examinationDate: string;
  symptoms: string[];
  subclinicalResults: PopulatedSubclinicalResult[];
  services?: {
    _id: string;
    name: string;
    description: string;
    price: number;
  }[];
  finalDiagnosis: FinalDiagnosis[];
  prescription?: {
    _id: string;
    medications: unknown[];
  };
  followUp?: FollowUp;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create medical examination data interface
 */
export interface CreateMedicalExaminationData {
  patient: string; // ObjectId, required
  examinationDate: string; // date, required
  symptoms: string[]; // required, array
  subclinicalResults?: SubclinicalResult[];
  services?: string[]; // ObjectId array, optional
  finalDiagnosis?: FinalDiagnosis[];
  prescription?: string; // ObjectId, optional
  followUp?: FollowUp;
  scheduleReferrence: string;
}

/**
 * Update medical examination data interface
 */
export interface UpdateMedicalExaminationData {
  patient?: string;
  examinationDate?: string;
  symptoms?: string[];
  subclinicalResults?: SubclinicalResult[];
  services?: string[];
  finalDiagnosis?: FinalDiagnosis[];
  prescription?: string;
  followUp?: FollowUp;
}

/**
 * Medical examination query parameters for filtering
 */
export interface MedicalExaminationGetManyParams extends GetManyParams {
  patient?: string;
  examinationDate?: string;
  startDate?: string;
  endDate?: string;
  prescription?: string;
  hasServices?: string; // "true" or "false"
} 