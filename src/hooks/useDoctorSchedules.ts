"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { scheduleService } from "@/services/schedule.service";
import { doctorService } from "@/services/doctor.service";
import { ScheduleResponseGetByDoctor } from "@/types/schedule";
import { useAuth } from "./useAuth";

interface UseDoctorSchedulesParams {
  from?: string;
  to?: string;
  dayOffset?: number;
  fullWeek?: boolean;
}

interface UseDoctorSchedulesReturn {
  schedules: ScheduleResponseGetByDoctor[];
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
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [paramsState, setParamsState] = useState<
    UseDoctorSchedulesParams | undefined
  >(initialParams);
  const { user } = useAuth();

  // Fetch doctor profile to get doctorId
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!user?._id) return;
      try {
        const profile = await doctorService.findOneByUserId(user._id);
        setDoctorId(profile._id);
      } catch (err) {
        console.error("Failed to fetch doctor profile:", err);
      }
    };
    fetchDoctor();
  }, [user?._id]);

  // SWR for schedules
  const {
    data: schedules,
    isLoading: loading,
    error: swrError,
    mutate,
  } = useSWR(
    doctorId
      ? [
          "doctorSchedules",
          doctorId,
          paramsState?.from || null,
          paramsState?.to || null,
          paramsState?.dayOffset ?? null,
          paramsState?.fullWeek ?? true,
        ]
      : null,
    async ([, dId, from, to, dayOffset, fullWeek]: [
      string,
      string,
      string | null,
      string | null,
      number | null,
      boolean
    ]) => {
      // Default to current week if no parameters provided
      const now = new Date();
      const weekPeriod = scheduleService.getWeekPeriod(now);
      const startOfWeek = weekPeriod.from;
      const endOfWeek = weekPeriod.to;

      const isFullWeek = fullWeek ?? true;

      // Normalize dates
      const fromDate = from ? new Date(from) : startOfWeek;
      const toDate = to ? new Date(to) : endOfWeek;

      const requestParams = {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        dayOffset: isFullWeek
          ? undefined
          : dayOffset ?? (now.getDay() === 0 ? 6 : now.getDay() - 1),
        fullWeek: isFullWeek,
      };

      const data = await scheduleService.getByDoctor(
        dId,
        requestParams.from,
        requestParams.to,
        requestParams.dayOffset,
        requestParams.fullWeek
      );
      return data as ScheduleResponseGetByDoctor[];
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000,
    }
  );

  const error = swrError
    ? swrError instanceof Error
      ? swrError.message
      : "Failed to fetch schedules"
    : null;

  const fetchSchedules = useCallback(
    async (params: UseDoctorSchedulesParams = {}) => {
      setParamsState(params);
      await mutate();
    },
    [mutate]
  );

  const refetch = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    schedules: schedules || [],
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
  return scheduleService.getWeekPeriod(date);
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
