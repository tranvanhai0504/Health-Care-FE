"use client";

import { useEffect, useState, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  ScheduleHeader,
  ScheduleFilters,
  AppointmentList,
  AppointmentDetails,
} from "@/components/doctor/schedules";
import { Appointment } from "@/types/appointment";
import { userService } from "@/services/user.service";
import {
  useDoctorSchedules,
  getWeekPeriod,
  getDayOffset,
} from "@/hooks/useDoctorSchedules";
import { ScheduleStatus } from "@/types/schedule";
import { AppointmentStatus } from "@/types/appointment";
import { User } from "@/types/user";

type ViewMode = "list" | "details";

// Helper function to map schedule status to appointment status
function mapScheduleStatusToAppointmentStatus(
  scheduleStatus: ScheduleStatus
): AppointmentStatus {
  switch (scheduleStatus) {
    case ScheduleStatus.CONFIRMED:
      return "upcoming";
    case ScheduleStatus.CHECKEDIN:
      return "checked-in";
    case ScheduleStatus.SERVING:
      return "in-progress";
    case ScheduleStatus.COMPLETED:
      return "completed";
    case ScheduleStatus.CANCELLED:
      return "cancelled";
    case ScheduleStatus.CHECKEDIN:
      return "upcoming";
    default:
      return "upcoming";
  }
}

export default function DoctorSchedules() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [patientDetails, setPatientDetails] = useState<Record<string, User>>(
    {}
  );
  const [loadingPatients, setLoadingPatients] = useState<
    Record<string, boolean>
  >({});
  const [rightPanelSize, setRightPanelSize] = useState(50);
  // Use the custom hook to fetch doctor's schedules
  const { schedules, loading, error, refetch, fetchSchedules } =
    useDoctorSchedules();

  // Function to fetch patient details by ID
  const fetchPatientDetails = useCallback(
    async (userId: string) => {
      if (patientDetails[userId] || loadingPatients[userId]) {
        return patientDetails[userId];
      }

      setLoadingPatients((prev) => ({ ...prev, [userId]: true }));

      try {
        const user = await userService.getUserById(userId);
        setPatientDetails((prev) => ({ ...prev, [userId]: user }));
        setLoadingPatients((prev) => ({ ...prev, [userId]: false }));
        return user;
      } catch (error) {
        console.error(`Error fetching patient details for ${userId}:`, error);
        setLoadingPatients((prev) => ({ ...prev, [userId]: false }));
        return null;
      }
    },
    [patientDetails, loadingPatients]
  );

  // Function to get patient info (from cache or schedule data)
  const getPatientInfo = (schedule: (typeof schedules)[0]) => {
    const userId =
      typeof schedule.userId === "string"
        ? schedule.userId
        : schedule.userId?._id;
    const userObj =
      typeof schedule.userId === "object" ? schedule.userId : null;

    // If we have detailed patient data, use it
    if (userId && patientDetails[userId]) {
      return patientDetails[userId];
    }

    // Otherwise, use what's available from the schedule
    return userObj;
  };

  // Convert schedules to appointments format for compatibility with existing components
  const appointments: Appointment[] = schedules.map((schedule) => {
    // Get enhanced patient information
    const user = getPatientInfo(schedule);
    const userId =
      typeof schedule.userId === "string"
        ? schedule.userId
        : schedule.userId?._id;

    return {
      id: schedule._id || "",
      patientName: user?.name || `Patient ${userId || "Unknown"}`,
      patientPhone: user?.phoneNumber || "N/A",
      patientEmail: user?.email || "N/A",
      patientAddress: user?.address || "N/A",
      time: schedule.timeOffset === 0 ? "09:00 AM" : "02:00 PM", // Convert timeOffset to time format
      date: new Date(
        new Date(schedule.weekPeriod.from).getTime() +
          schedule.dayOffset * 24 * 60 * 60 * 1000 +
          7 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      type: schedule.type === "services" ? "Services" : "Package",
      status: mapScheduleStatusToAppointmentStatus(schedule.status),
      notes: schedule.packageId
        ? `Package: ${schedule.packageId}`
        : "Services appointment",
      duration: "N/A", // Not available in schedule data
      symptoms: "",
      previousVisits: 0, // Not available in schedule data
      // Add enhanced user info
      patientGender: user?.gender || "N/A",
      patientDateOfBirth: user?.dateOfBirth || "N/A",
      patientOccupation: user?.occupation || "N/A",
      // Store the user ID for future reference
      userId: userId,
      originalSchedule: schedule,
    };
  });

  // Fetch patient details when schedules are loaded
  useEffect(() => {
    const fetchAllPatientDetails = async () => {
      const userIds = schedules
        .map((schedule) =>
          typeof schedule.userId === "string"
            ? schedule.userId
            : schedule.userId?._id
        )
        .filter(
          (id): id is string =>
            !!id && !patientDetails[id] && !loadingPatients[id]
        );

      // Fetch details for users we don't have yet
      const promises = userIds.map((userId) => fetchPatientDetails(userId));
      await Promise.allSettled(promises);
    };

    if (schedules.length > 0) {
      fetchAllPatientDetails();
    }
  }, [schedules, patientDetails, loadingPatients, fetchPatientDetails]);

  // Handle date filter changes to refetch data
  useEffect(() => {
    const handleDateFilterChange = async () => {
      const now = new Date();
      let from: string, to: string;
      let isFullWeek = false;

      switch (dateFilter) {
        case "today":
          const weekPeriod = getWeekPeriod(now);
          // Parse the week period dates and convert to UTC+7
          const weekStart = new Date(weekPeriod.from);
          const weekEnd = new Date(weekPeriod.to);
          // Convert to UTC+7 timezone
          const weekStartUTC = new Date(
            weekStart.getTime() - 7 * 60 * 60 * 1000
          );
          const weekEndUTC = new Date(weekEnd.getTime() - 7 * 60 * 60 * 1000);
          from = weekStartUTC.toISOString();
          to = weekEndUTC.toISOString();
          break;
        case "week":
          const weekPeriod2 = getWeekPeriod(now);
          // Parse the week period dates and convert to UTC+7
          const weekStart2 = new Date(weekPeriod2.from);
          const weekEnd2 = new Date(weekPeriod2.to);
          // Convert to UTC+7 timezone
          const weekStartUTC2 = new Date(
            weekStart2.getTime() - 7 * 60 * 60 * 1000
          );
          const weekEndUTC2 = new Date(weekEnd2.getTime() - 7 * 60 * 60 * 1000);
          from = weekStartUTC2.toISOString();
          to = weekEndUTC2.toISOString();
          isFullWeek = true;
          break;
        case "month":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          startOfMonth.setHours(0, 0, 0, 0);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          // Convert to UTC+7 timezone
          const startOfMonthUTC = new Date(
            startOfMonth.getTime() - 7 * 60 * 60 * 1000
          );
          const endOfMonthUTC = new Date(
            endOfMonth.getTime() - 7 * 60 * 60 * 1000
          );
          from = startOfMonthUTC.toISOString();
          to = endOfMonthUTC.toISOString();
          break;
        default:
          return; // Don't refetch for "all" or unknown filters
      }

      // Prepare parameters - don't include dayOffset for full week
      const params: {
        from: string;
        to: string;
        fullWeek: boolean;
        dayOffset?: number;
      } = {
        from,
        to,
        fullWeek: isFullWeek,
      };

      // Only add dayOffset if not full week
      if (!isFullWeek) {
        params.dayOffset = getDayOffset(now);
      }

      await fetchSchedules(params);
    };

    handleDateFilterChange();
  }, [dateFilter, fetchSchedules]);

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.patientName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;
    // Add date filtering logic here based on dateFilter
    return matchesSearch && matchesStatus;
  });

  // Function to get enhanced appointment with latest patient data
  const getEnhancedAppointment = (appointment: Appointment): Appointment => {
    if (
      appointment.userId &&
      typeof appointment.userId === "string" &&
      patientDetails[appointment.userId]
    ) {
      const user = patientDetails[appointment.userId];
      return {
        ...appointment,
        patientName: user.name || appointment.patientName,
        patientPhone: user.phoneNumber || appointment.patientPhone,
        patientEmail: user.email || appointment.patientEmail,
        patientAddress: user.address || appointment.patientAddress,
        patientGender: user.gender || appointment.patientGender,
        patientDateOfBirth: user.dateOfBirth || appointment.patientDateOfBirth,
        patientOccupation: user.occupation || appointment.patientOccupation,
      };
    }
    return appointment;
  };

  // Event handlers
  const handleViewDetails = async (appointment: Appointment) => {
    const enhancedAppointment = getEnhancedAppointment(appointment);
    setSelectedAppointment(enhancedAppointment);
    setViewMode("details");

    // Fetch detailed patient information if we have the user ID and don't have the details yet
    if (
      appointment.userId &&
      typeof appointment.userId === "string" &&
      !patientDetails[appointment.userId]
    ) {
      const patientData = await fetchPatientDetails(appointment.userId);
      if (patientData) {
        // Update the selected appointment with fresh data
        const updatedAppointment = getEnhancedAppointment(appointment);
        setSelectedAppointment(updatedAppointment);
      }
    }
  };

  const handleCloseRightPanel = () => {
    setSelectedAppointment(null);
    setViewMode("list");
    setRightPanelSize(50);
  };

  // Determine if right panel should be shown
  const showRightPanel = viewMode !== "list" && selectedAppointment;
  const onlyShowRightPanel = showRightPanel && rightPanelSize === 100;

  // Render right panel content based on view mode
  const renderRightPanel = () => {
    if (!selectedAppointment) return null;

    // Check if we're loading patient details for the selected appointment
    const isLoadingPatientDetails =
      selectedAppointment.userId &&
      typeof selectedAppointment.userId === "string" &&
      loadingPatients[selectedAppointment.userId];

    switch (viewMode) {
      case "details":
        return (
          <div className="relative">
            {isLoadingPatientDetails && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                  Loading patient details...
                </div>
              </div>
            )}
            <AppointmentDetails
              appointment={selectedAppointment}
              onClose={handleCloseRightPanel}
              handleExpandRightPanel={handleExpandRightPanel}
              handleCollapseRightPanel={handleCollapseRightPanel}
              rightPanelSize={rightPanelSize}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const handleExpandRightPanel = () => {
    setRightPanelSize(100);
  };

  const handleCollapseRightPanel = () => {
    setRightPanelSize(50);
  };

  return (
    <div className="h-[calc(100vh-64px)]">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Schedules List */}
        <Panel
          defaultSize={showRightPanel ? (onlyShowRightPanel ? 0 : 60) : 100}
          minSize={showRightPanel ? (onlyShowRightPanel ? 0 : 55) : 100}
        >
          <div className="h-full space-y-6 overflow-auto p-6">
            {/* Header */}
            <ScheduleHeader />

            {/* Filters */}
            <ScheduleFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onDateFilterChange={setDateFilter}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">
                  Error loading schedules: {error}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Appointments List */}
            <AppointmentList
              appointments={filteredAppointments}
              loading={loading}
              onViewDetails={handleViewDetails}
            />
          </div>
        </Panel>

        {/* Panel Resize Handle and Right Panel */}
        {showRightPanel && (
          <>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
            <Panel
              defaultSize={rightPanelSize}
              minSize={onlyShowRightPanel ? 100 : 35}
              maxSize={onlyShowRightPanel ? 100 : 45}
            >
              <div className="h-full pl-3 overflow-auto">
                {renderRightPanel()}
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
