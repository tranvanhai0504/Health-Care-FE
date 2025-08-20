import { scheduleService } from "@/services/schedule.service";
import { doctorService } from "@/services/doctor.service";
import { ScheduleResponse } from "@/types/schedule";

/**
 * Example utility functions for using the getByDoctor method
 */

/**
 * Get doctor's schedules for today
 * @param userId - The doctor's user ID
 * @returns Promise with today's schedules
 */
export async function getDoctorSchedulesToday(userId: string): Promise<ScheduleResponse[]> {
  // First get the doctor profile to get the doctor ID
  const doctorProfile = await doctorService.findOneByUserId(userId);
  const doctorId = doctorProfile._id;

  const now = new Date();

  // Start of today (00:00:00.000)
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // End of today (23:59:59.999)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Convert to UTC+7 timezone (backend timezone)
  const todayUTC = new Date(today.getTime() - (7 * 60 * 60 * 1000));
  const endOfDayUTC = new Date(endOfDay.getTime() - (7 * 60 * 60 * 1000));

  const dayOffset = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert Sunday=0 to Sunday=6

  return await scheduleService.getByDoctor(
    doctorId,
    todayUTC.toISOString(),
    endOfDayUTC.toISOString(),
    dayOffset,
    false // Not full week, just today
  );
}

/**
 * Get doctor's schedules for current week
 * @param userId - The doctor's user ID
 * @returns Promise with current week's schedules
 */
export async function getDoctorSchedulesThisWeek(userId: string): Promise<ScheduleResponse[]> {
  // First get the doctor profile to get the doctor ID
  const doctorProfile = await doctorService.findOneByUserId(userId);
  const doctorId = doctorProfile._id;

  const now = new Date();

  // Start of week (Monday at 00:00:00.000)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // End of week (Sunday at 23:59:59.999)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Convert to UTC+7 timezone (backend timezone)
  const startOfWeekUTC = new Date(startOfWeek.getTime() - (7 * 60 * 60 * 1000));
  const endOfWeekUTC = new Date(endOfWeek.getTime() - (7 * 60 * 60 * 1000));

  // Don't pass dayOffset for full week requests
  return await scheduleService.getByDoctor(
    doctorId,
    startOfWeekUTC.toISOString(),
    endOfWeekUTC.toISOString(),
    undefined, // No dayOffset for full week
    true // Full week
  );
}

/**
 * Get doctor's schedules for a specific date range
 * @param userId - The doctor's user ID
 * @param fromDate - Start date
 * @param toDate - End date
 * @param fullWeek - Whether to fetch full week schedules
 * @returns Promise with schedules in the date range
 */
export async function getDoctorSchedulesInRange(
  userId: string,
  fromDate: Date,
  toDate: Date,
  fullWeek: boolean = false
): Promise<ScheduleResponse[]> {
  // First get the doctor profile to get the doctor ID
  const doctorProfile = await doctorService.findOneByUserId(userId);
  const doctorId = doctorProfile._id;

  // Normalize dates to ensure proper time boundaries
  const normalizedFromDate = new Date(fromDate);
  normalizedFromDate.setHours(0, 0, 0, 0); // Start of day

  const normalizedToDate = new Date(toDate);
  normalizedToDate.setHours(23, 59, 59, 999); // End of day

  // Convert to UTC+7 timezone (backend timezone)
  const fromDateUTC = new Date(normalizedFromDate.getTime() - (7 * 60 * 60 * 1000));
  const toDateUTC = new Date(normalizedToDate.getTime() - (7 * 60 * 60 * 1000));

  // Only calculate dayOffset if not requesting full week
  const dayOffset = fullWeek ? undefined : (normalizedFromDate.getDay() === 0 ? 6 : normalizedFromDate.getDay() - 1);

  return await scheduleService.getByDoctor(
    doctorId,
    fromDateUTC.toISOString(),
    toDateUTC.toISOString(),
    dayOffset,
    fullWeek
  );
}

/**
 * Get doctor's schedules for a specific day of the week
 * @param userId - The doctor's user ID
 * @param dayOfWeek - Day of week (0 = Monday, 6 = Sunday)
 * @param weekDate - Reference date for the week (defaults to current date)
 * @returns Promise with schedules for that day
 */
export async function getDoctorSchedulesForDay(
  userId: string,
  dayOfWeek: number,
  weekDate: Date = new Date()
): Promise<ScheduleResponse[]> {
  // First get the doctor profile to get the doctor ID
  const doctorProfile = await doctorService.findOneByUserId(userId);
  const doctorId = doctorProfile._id;

  // Calculate the week period with proper time boundaries
  const startOfWeek = new Date(weekDate);
  startOfWeek.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0); // Start of day

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999); // End of day

  // Convert to UTC+7 timezone (backend timezone)
  const startOfWeekUTC = new Date(startOfWeek.getTime() - (7 * 60 * 60 * 1000));
  const endOfWeekUTC = new Date(endOfWeek.getTime() - (7 * 60 * 60 * 1000));

  return await scheduleService.getByDoctor(
    doctorId,
    startOfWeekUTC.toISOString(),
    endOfWeekUTC.toISOString(),
    dayOfWeek, // Pass dayOffset for specific day
    false // Not full week, specific day
  );
}

/**
 * Example usage in a React component:
 *
 * ```typescript
 * import { getDoctorSchedulesToday, getDoctorSchedulesThisWeek } from '@/utils/scheduleHelpers';
 * import { useAuth } from '@/hooks/useAuth';
 *
 * function MyComponent() {
 *   const { user } = useAuth();
 *   const [todaySchedules, setTodaySchedules] = useState([]);
 *
 *   useEffect(() => {
 *     if (user?._id) {
 *       // These functions take user ID and internally convert to doctor ID
 *       // Get today's schedules (includes dayOffset)
 *       getDoctorSchedulesToday(user._id).then(setTodaySchedules);
 *
 *       // Get full week schedules (no dayOffset passed)
 *       getDoctorSchedulesThisWeek(user._id).then(setWeekSchedules);
 *     }
 *   }, [user?._id]);
 *
 *   // ... rest of component
 * }
 * ```
 *
 * Note:
 * - All helper functions take user ID and internally fetch the doctor profile to get the doctor ID
 * - When fullWeek=true, dayOffset is not passed to the API
 * - When fullWeek=false, dayOffset is required for specific day filtering
 * - The schedule API uses doctor ID, not user ID
 */
