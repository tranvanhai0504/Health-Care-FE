"use client";

import { useState, useEffect, useCallback } from "react";
import { scheduleService } from "@/services/schedule.service";
import { doctorService } from "@/services/doctor.service";
import { ScheduleResponse } from "@/types/schedule";
import { useAuth } from "./useAuth";

interface UseDoctorSchedulesParams {
  from?: string;
  to?: string;
  dayOffset?: number;
  fullWeek?: boolean;
}

interface UseDoctorSchedulesReturn {
  schedules: ScheduleResponse[];
  loading: boolean;
  error: string | null;
  doctorId: string | null;
  refetch: () => Promise<void>;
  fetchSchedules: (params: UseDoctorSchedulesParams) => Promise<void>;
}

/**
 * Custom hook for fetching doctor's own schedules
 * @param initialParams - Initial parameters for fetching schedules
 * @returns Object containing schedules data, loading state, error, and refetch function
 */
export function useDoctorSchedules(
  initialParams?: UseDoctorSchedulesParams
): UseDoctorSchedulesReturn {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSchedules = useCallback(
    async (params: UseDoctorSchedulesParams = {}) => {
      if (!user?._id) {
        setError("User not authenticated");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First, get the doctor profile using the user ID
        const doctorProfile = await doctorService.findOneByUserId(user._id);
        const currentDoctorId = doctorProfile._id;
        setDoctorId(currentDoctorId);

        // Default to current week if no parameters provided
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        const isFullWeek = params.fullWeek ?? true;

        // Normalize dates to ensure proper time boundaries
        let fromDate = params.from ? new Date(params.from) : startOfWeek;
        let toDate = params.to ? new Date(params.to) : endOfWeek;

        // Convert to UTC+7 timezone (backend timezone)
        // Set from date to start of day in UTC+7 (17:00:00.000 UTC)
        fromDate.setHours(0, 0, 0, 0);
        const fromUTC = new Date(fromDate.getTime() - (7 * 60 * 60 * 1000)); // Subtract 7 hours

        // Set to date to end of day in UTC+7 (16:59:59.999 UTC next day)
        toDate.setHours(23, 59, 59, 999);
        const toUTC = new Date(toDate.getTime() - (7 * 60 * 60 * 1000)); // Subtract 7 hours

        const requestParams = {
          from: fromUTC.toISOString(),
          to: toUTC.toISOString(),
          dayOffset: isFullWeek ? undefined : (params.dayOffset ?? (now.getDay() === 0 ? 6 : now.getDay() - 1)),
          fullWeek: isFullWeek,
        };

        // Use the doctor ID instead of user ID
        const data = await scheduleService.getByDoctor(
          currentDoctorId,
          requestParams.from,
          requestParams.to,
          requestParams.dayOffset,
          requestParams.fullWeek
        );

        setSchedules(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch schedules";
        setError(errorMessage);
        console.error("Error fetching doctor schedules:", err);
      } finally {
        setLoading(false);
      }
    },
    [user?._id]
  );

  const refetch = useCallback(() => {
    return fetchSchedules(initialParams);
  }, [fetchSchedules, initialParams]);

  // Initial fetch on mount
  useEffect(() => {
    if (user?._id) {
      fetchSchedules(initialParams);
    }
  }, [user?._id, fetchSchedules, initialParams]);

  return {
    schedules,
    loading,
    error,
    doctorId,
    refetch,
    fetchSchedules,
  };
}

/**
 * Helper function to get week period dates with normalized time boundaries in UTC+7
 * @param date - Reference date (defaults to current date)
 * @returns Object with from and to ISO strings for the week in UTC+7 timezone
 */
export function getWeekPeriod(date: Date = new Date()) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0); // Start of day (00:00:00.000)

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999); // End of day (23:59:59.999)

  // Convert to UTC+7 timezone (backend timezone)
  const startOfWeekUTC = new Date(startOfWeek.getTime() - (7 * 60 * 60 * 1000));
  const endOfWeekUTC = new Date(endOfWeek.getTime() - (7 * 60 * 60 * 1000));

  return {
    from: startOfWeekUTC.toISOString(),
    to: endOfWeekUTC.toISOString(),
  };
}

/**
 * Helper function to convert day of week to dayOffset
 * @param date - Reference date (defaults to current date)
 * @returns Day offset (0 = Monday, 6 = Sunday)
 */
export function getDayOffset(date: Date = new Date()): number {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6
}
