import { ScheduleResponse } from "./schedule";
import { User } from "./user";

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAddress?: string;
  time: string;
  date: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled" | "in-progress" | "checked-in";
  notes?: string;
  duration?: string;
  symptoms?: string;
  previousVisits?: number;
  // Additional patient information
  patientGender?: string;
  patientDateOfBirth?: string;
  patientOccupation?: string;
  // Additional fields for enhanced functionality
  originalSchedule?: ScheduleResponse; // Store the original schedule data
  userId?: string | User; // Store the user ID or user object
}

export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "in-progress"
  | "checked-in";
export type AppointmentType =
  | "Emergency"
  | "Follow-up"
  | "Consultation"
  | "Checkup";
