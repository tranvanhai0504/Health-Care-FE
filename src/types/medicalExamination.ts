/**
 * Vital signs interface for medical examinations
 */
export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

/**
 * Subclinical test interface for medical examinations
 */
export interface SubclinicalTest {
  testName: string;
  result: string;
  referenceRange?: string;
  unit?: string;
  status: 'normal' | 'abnormal' | 'critical';
}

/**
 * Medical examination interface
 */
export interface MedicalExamination {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleId?: string;
  diagnosis: string;
  icd10Code?: string;
  symptoms: string[];
  vitalSigns: VitalSigns;
  subclinicalTests: SubclinicalTest[];
  treatment: string;
  followUpDate?: string;
  prescriptionId?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * Create medical examination data interface
 */
export interface CreateMedicalExaminationData {
  patientId: string;
  scheduleId?: string;
  diagnosis: string;
  icd10Code?: string;
  symptoms: string[];
  vitalSigns: VitalSigns;
  subclinicalTests?: SubclinicalTest[];
  treatment: string;
  followUpDate?: string;
  notes?: string;
} 