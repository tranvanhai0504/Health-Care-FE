import { ConsultationPackage } from './package';
/**
 * Date range interface
 */
export interface CDateRange {
  from: Date;
  to: Date;
}

/**
 * Schedule service status enum
 */
export enum ScheduleServiceStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

/**
 * Schedule status enum
 */
export enum ScheduleStatus {
  CONFIRMED = 'pending',
  CHECKEDIN = 'checkedIn',
  SERVING = 'serving',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Schedule interface
 */
export interface Schedule {
  _id?: string;
  userId: string;
  weekPeriod: CDateRange;
  dayOffset: number;
  timeOffset: 0 | 1; // 0 for morning, 1 for afternoon
  status: ScheduleStatus;
  type: 'package' | 'services';
  packageInfo?: string | ConsultationPackage;
  services?: ScheduleService[] | string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ScheduleResponse extends Schedule {
  payment: {
    totalPrice: number;
    totalPaid: number;
    payments: string[]
  },
  services?: ScheduleService[];
}

export interface ScheduleService {
  _id?: string;
  service: string;
  status: string; 
}

/**
 * Create schedule data interface
 */
export interface CreateScheduleData {
  weekPeriod: CDateRange;
  dayOffset: number;
  timeOffset: 0 | 1;
  type: 'package' | 'services';
  packageInfo?: string; // Package ID when type is 'package'
  services?: string[]; // Service IDs when type is 'services'
} 