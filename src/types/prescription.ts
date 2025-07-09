/**
 * Medication interface for prescriptions
 */
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

/**
 * Prescription interface
 */
export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleId?: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * Create prescription data interface
 */
export interface CreatePrescriptionData {
  patientId: string;
  scheduleId?: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
} 