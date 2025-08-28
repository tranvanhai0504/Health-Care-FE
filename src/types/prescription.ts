/**
 * Prescription Medication interface for prescription forms
 */
export interface PrescriptionMedication {
  medicineId: string; // Medicine ID - required
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

/**
 * API Medication interface (what the backend expects and returns)
 */
export interface ApiMedication {
  medicine: string; // Medicine ID
  quantity: number; // Quantity of medicine
  frequency?: string; // Frequency (optional, returned by API)
  duration?: string; // Duration (optional, returned by API)
}

/**
 * Prescription interface
 */
export interface Prescription {
  _id: string;
  dateIssued: string;
  doctor: string | { _id: string; user: string; specialization: string; experience: number; qualifications: string[]; bio: string; consultationFee: number; availability: unknown[]; reviews: unknown[]; averageRating: number; createdAt: string; updatedAt: string; room: string; __v: number }; // Doctor ID or populated object
  patient: string | { _id: string; name: string; email: string; occupation: string | null; password: string; role: string; phoneNumber: string; address: string; dateOfBirth: string; gender: string; createdAt: string; updatedAt: string; __v: number; avatar: string }; // Patient ID or populated object
  diagnosis: string;
  notes?: string;
  medications: ApiMedication[];
  totalCost: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create prescription data interface
 */
export interface CreatePrescriptionData {
  patient: string; // Patient ID
  medications: ApiMedication[];
  notes?: string;
  diagnosis: string;
  totalCost: number;
} 