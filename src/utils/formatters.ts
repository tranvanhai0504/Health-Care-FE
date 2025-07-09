import { format, parseISO } from "date-fns";

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
      return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a');
    }
    
    // Handle full ISO date strings
    if (timeString.includes('T') || timeString.includes('-')) {
      return format(parseISO(timeString), 'h:mm a');
    }
    
    // Fallback: try to parse as-is
    return format(new Date(timeString), 'h:mm a');
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
    return format(parseISO(dateString), formatString);
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
    return format(parseISO(dateString), 'MMM dd, yyyy \'at\' h:mm a');
  } catch (error) {
    console.warn('Failed to format datetime:', dateString, error);
    return dateString;
  }
}; 