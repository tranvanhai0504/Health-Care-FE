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
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "in-progress";
export type AppointmentType = "Emergency" | "Follow-up" | "Consultation" | "Checkup";
