import BaseService, { ApiResponse } from './base';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
}

export interface CreateAppointmentData {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('/api/v1/appointments');
  }

  /**
   * Get all appointments for a patient
   */
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const response = await this.getFullResponse<Appointment[]>(this.basePath, 'get', { patientId });
    return response.data;
  }

  /**
   * Get all appointments for a doctor
   */
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    const response = await this.getFullResponse<Appointment[]>(this.basePath, 'get', { doctorId });
    return response.data;
  }

  /**
   * Create a new appointment for the current user
   */
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    return this.create(data);
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: string): Promise<Appointment> {
    return this.update(id, { status: 'cancelled' as const });
  }

  /**
   * Get full API response for patient appointments
   */
  async getPatientAppointmentsWithResponse(patientId: string): Promise<ApiResponse<Appointment[]>> {
    return this.getFullResponse<Appointment[]>(this.basePath, 'get', { patientId });
  }

  /**
   * Get full API response for doctor appointments
   */
  async getDoctorAppointmentsWithResponse(doctorId: string): Promise<ApiResponse<Appointment[]>> {
    return this.getFullResponse<Appointment[]>(this.basePath, 'get', { doctorId });
  }
}

export const appointmentService = new AppointmentService(); 