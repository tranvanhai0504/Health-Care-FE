import { Medicine } from './medicine';

// Medication interface
export interface Medication {
  _id?: string;
  medicine: string | Medicine; // Reference to Medicine (can be ID or populated object)
  quantity: number;
  frequency: string;
  duration: string;
  instruction?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create medication data interface
export interface CreateMedicationData {
  medicine: string; // Medicine ID
  quantity: number;
  frequency: string;
  duration: string;
  instruction?: string;
}

// Update medication data interface
export interface UpdateMedicationData {
  medicine?: string;
  quantity?: number;
  frequency?: string;
  duration?: string;
  instruction?: string;
}

// Filter options for medications
export interface MedicationFilterOptions {
  medicine?: string;
  minQuantity?: number;
  maxQuantity?: number;
  frequency?: string;
  duration?: string;
}

// Advanced options for complex filtering
export interface MedicationAdvancedOptions {
  filter?: {
    medicine?: string;
    quantity?: {
      $gte?: number;
      $lte?: number;
      $gt?: number;
      $lt?: number;
    };
    frequency?: {
      $regex?: string;
      $options?: string;
    };
    duration?: {
      $regex?: string;
      $options?: string;
    };
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
  sort?: Record<string, 1 | -1>;
}
