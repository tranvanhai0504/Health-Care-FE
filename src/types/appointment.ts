export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAddress?: string;
  time: string;
  date: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled" | "in-progress";
  notes?: string;
  duration?: string;
  symptoms?: string;
  previousVisits?: number;
  // Additional patient information
  patientGender?: string;
  patientDateOfBirth?: string;
  patientOccupation?: string;
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "in-progress";
export type AppointmentType = "Emergency" | "Follow-up" | "Consultation" | "Checkup";
