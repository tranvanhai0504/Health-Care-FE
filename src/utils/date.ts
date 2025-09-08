import i18n from '@/lib/i18n';

/**
 * Get the current locale for date formatting based on i18n language
 */
export const getCurrentLocale = (): string => {
  const currentLanguage = i18n.language || i18n.options.lng || 'vi';
  
  // Map i18n language codes to locale codes
  const localeMap: Record<string, string> = {
    'vi': 'vi-VN',
    'en': 'en-US',
  };
  
  return localeMap[currentLanguage] || 'vi-VN';
};

/**
 * Format date string for display with localization
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "-";
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  
  return new Date(dateString).toLocaleDateString(getCurrentLocale(), options);
};

/**
 * Format date string with detailed information (includes time)
 */
export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return "-";
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString(getCurrentLocale(), options);
};

/**
 * Format date string using toLocaleString for full date and time
 */
export const formatDateTimeString = (dateString: string | undefined | null): string => {
  if (!dateString) return "-";
  
  return new Date(dateString).toLocaleString(getCurrentLocale());
};