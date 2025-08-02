import { GetManyParams, PaginationParams } from "./api";

/**
 * Price option interface
 */
export interface PriceOption {
  tier: string;
  price: number;
  testsIncluded: number;
  _id?: string;
}

/**
 * FAQ interface
 */
export interface FAQ {
  question: string;
  answer: string;
  _id?: string;
}

/**
 * Booking option interface
 */
export interface BookingOption {
  type: string;
  description: string;
  actionUrl: string;
  _id?: string;
}

/**
 * Consultation Package interface
 */
export interface ConsultationPackage {
  _id: string;
  title: string;
  icon?: string;
  description: string;
  priceOptions?: PriceOption[];
  tests?: string[];
  faq?: FAQ[];
  bookingOptions?: BookingOption[];
  maxSlotPerPeriod?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  // New fields from API response
  category: string;
  titleImage: string;
  price: number;
  // Additional fields from getById response
  content?: string;
  condition?: string;
  bookingOption?: string;
}

/**
 * Create consultation package data interface
 */
export interface CreateConsultationPackageData {
  title: string;
  icon?: string;
  description: string;
  priceOptions?: Omit<PriceOption, "_id">[];
  tests?: string[];
  faq?: Omit<FAQ, "_id">[];
  bookingOptions?: Omit<BookingOption, "_id">[];
  maxSlotPerPeriod?: number;
  // New fields
  category: string;
  titleImage: string;
  price: number;
}

/**
 * Consultation Package get all params interface
 */
export interface ConsultationPackageGetAllParams extends GetManyParams {
  options?: {
    pagination?: PaginationParams;
    filter?: Record<string, unknown>;
    sort?: Record<string, unknown>;
  };
  title?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Weekly Package interface
 */
export interface WeeklyPackage {
  _id: string;
  startDate: string;
  endDate: string;
  packageDays: string[] | DayPackage[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Create weekly package data interface
 */
export interface CreateWeeklyPackageData {
  startDate: string;
  endDate: string;
  packageDays: string[];
}

/**
 * Day Package interface
 */
export interface DayPackage {
  _id: string;
  day_offset: number;
  period_pkgs: string[] | PeriodPackage[];
  __v?: number;
}

/**
 * Create day package data interface
 */
export interface CreateDayPackageData {
  day_offset: number;
  period_pkgs: string[];
}

/**
 * Period Package interface
 */
export interface PeriodPackage {
  _id: string;
  pkg: string | ConsultationPackage;
  booked: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Create period package data interface
 */
export interface CreatePeriodPackageData {
  pkg: string;
  booked: number;
  startTime: string;
  endTime: string;
}
