import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import i18n from "@/lib/i18n";

/**
 * Get the appropriate date-fns locale based on current language
 */
const getDateLocale = () => {
  const currentLanguage = i18n.language || 'en';
  return currentLanguage === 'vi' ? vi : undefined;
};
/**
 * Format a number as Vietnamese currency (VND)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a price value (alias for formatCurrency for backward compatibility)
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

/**
 * Format duration in minutes to human-readable format
 * @param duration - Duration in minutes
 * @returns Formatted duration string (e.g., "1h 30m", "45 minutes")
 */
export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Format time string to human-readable format
 * @param timeString - Time string in various formats
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timeString: string): string => {
  try {
    // Handle time-only strings (HH:MM format)
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a', { locale: getDateLocale() });
    }
    
    // Handle full ISO date strings
    if (timeString.includes('T') || timeString.includes('-')) {
      return format(parseISO(timeString), 'h:mm a', { locale: getDateLocale() });
    }
    
    // Fallback: try to parse as-is
    return format(new Date(timeString), 'h:mm a', { locale: getDateLocale() });
  } catch (error) {
    console.warn('Failed to format time:', timeString, error);
    return timeString; // Return original string if parsing fails
  }
};

/**
 * Format date to human-readable format
 * @param dateString - Date string in ISO format
 * @param formatString - Optional format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    return format(parseISO(dateString), formatString, { locale: getDateLocale() });
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return dateString;
  }
};

/**
 * Format date and time together
 * @param dateString - Date string in ISO format
 * @returns Formatted date and time string (e.g., "Dec 25, 2023 at 2:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy \'at\' h:mm a', { locale: getDateLocale() });
  } catch (error) {
    console.warn('Failed to format datetime:', dateString, error);
    return dateString;
  }
};

/**
 * Calculate the actual date from weekPeriod and dayOffset
 * @param weekPeriod - Object containing from and to dates
 * @param dayOffset - Day offset from week start (0 = Sunday, 1 = Monday, etc.)
 * @returns Date object representing the actual appointment date in UTC+7
 */
export const getScheduleDate = (weekPeriod: { from: string | Date; to: string | Date }, dayOffset: number): Date => {
  try {
    // Parse the week start date
    const weekStart = typeof weekPeriod.from === 'string' ? new Date(weekPeriod.from) : weekPeriod.from;
    
    // Add the day offset to get the actual appointment date
    const appointmentDate = new Date(weekStart);
    appointmentDate.setDate(weekStart.getDate() + dayOffset);
    
    // Convert to UTC+7 by adding 7 hours
    const utcPlus7Date = new Date(appointmentDate.getTime() + (7 * 60 * 60 * 1000));
    
    return utcPlus7Date;
  } catch (error) {
    console.warn('Failed to calculate schedule date:', error);
    return new Date();
  }
};

/**
 * Format schedule date from weekPeriod and dayOffset
 * @param weekPeriod - Object containing from and to dates
 * @param dayOffset - Day offset from week start (0 = Sunday, 1 = Monday, etc.)
 * @param formatString - Optional format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string in UTC+7
 */
export const formatScheduleDate = (weekPeriod: { from: string | Date; to: string | Date }, dayOffset: number, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    const appointmentDate = getScheduleDate(weekPeriod, dayOffset);
    return format(appointmentDate, formatString, { locale: getDateLocale() });
  } catch (error) {
    console.warn('Failed to format schedule date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format weekday name from weekPeriod and dayOffset with locale support
 * @param weekPeriod - Object containing from and to dates
 * @param dayOffset - Day offset from week start (0 = Sunday, 1 = Monday, etc.)
 * @returns Localized weekday name
 */
export const formatScheduleWeekday = (weekPeriod: { from: string | Date; to: string | Date }, dayOffset: number): string => {
  try {
    const appointmentDate = getScheduleDate(weekPeriod, dayOffset);
    return format(appointmentDate, 'EEEE', { locale: getDateLocale() });
  } catch (error) {
    console.warn('Failed to format schedule weekday:', error);
    return 'Invalid Date';
  }
}; 