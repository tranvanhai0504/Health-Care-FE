"use client";

import { useEffect, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  ScheduleHeader,
  ScheduleFilters,
  AppointmentList,
  AppointmentSummary,
  AppointmentDetails,
  MedicalExaminationForm,
  PrescriptionForm,
  ScheduleManager,
} from "@/components/doctor/schedules";
import { Appointment } from "@/types/appointment";
import { CreateMedicalExaminationData } from "@/types/medicalExamination";
import { CreatePrescriptionData } from "@/types/prescription";
import { medicalExaminationService } from "@/services/medicalExamination.service";
import { useDoctorSchedules, getWeekPeriod, getDayOffset } from "@/hooks/useDoctorSchedules";
import { ScheduleStatus } from "@/types/schedule";
import { AppointmentStatus } from "@/types/appointment";

type ViewMode =
  | "list"
  | "details"
  | "medical-examination"
  | "prescription"
  | "schedule-manager";

// Helper function to map schedule status to appointment status
function mapScheduleStatusToAppointmentStatus(scheduleStatus: ScheduleStatus): AppointmentStatus {
  switch (scheduleStatus) {
    case ScheduleStatus.CONFIRMED:
      return "upcoming";
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Use the custom hook to fetch doctor's schedules
  const { schedules, loading, error, refetch, fetchSchedules } = useDoctorSchedules();

  // Convert schedules to appointments format for compatibility with existing components
  const appointments: Appointment[] = schedules.map((schedule) => {
    // Extract user information from schedule
    const user = typeof schedule.userId === 'object' ? schedule.userId : null;

    return {
      id: schedule._id || "",
      patientName: user?.name || `Patient ${typeof schedule.userId === 'string' ? schedule.userId : schedule.userId._id}`,
      patientPhone: user?.phoneNumber || "N/A",
      patientEmail: user?.email || "N/A",
      patientAddress: user?.address || "N/A",
      time: schedule.timeOffset === 0 ? "09:00 AM" : "02:00 PM", // Convert timeOffset to time format
      date: new Date(schedule.weekPeriod.from).toISOString().split('T')[0],
      type: schedule.type === "services" ? "Services" : "Package",
      status: mapScheduleStatusToAppointmentStatus(schedule.status),
      notes: schedule.packageId ? `Package: ${schedule.packageId}` : "Services appointment",
      duration: "N/A", // Not available in schedule data
      symptoms: schedule.services?.map(s => s.service).join(", ") || "No services specified",
      previousVisits: 0, // Not available in schedule data
      // Add additional user info that might be useful
      ...(user && {
        patientGender: user.gender || "N/A",
        patientDateOfBirth: user.dateOfBirth || "N/A",
        patientOccupation: user.occupation || "N/A",
      })
    };
  });

  // Handle date filter changes to refetch data
  useEffect(() => {
    const handleDateFilterChange = async () => {
      const now = new Date();
      let from: string, to: string;
      let isFullWeek = false;

      switch (dateFilter) {
        case "today":
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
          // Convert to UTC+7 timezone
          const todayUTC = new Date(today.getTime() - (7 * 60 * 60 * 1000));
          const endOfDayUTC = new Date(endOfDay.getTime() - (7 * 60 * 60 * 1000));
          from = todayUTC.toISOString();
          to = endOfDayUTC.toISOString();
          break;
        case "week":
          const weekPeriod = getWeekPeriod(now);
          // Parse the week period dates and convert to UTC+7
          const weekStart = new Date(weekPeriod.from);
          const weekEnd = new Date(weekPeriod.to);
          // Convert to UTC+7 timezone
          const weekStartUTC = new Date(weekStart.getTime() - (7 * 60 * 60 * 1000));
          const weekEndUTC = new Date(weekEnd.getTime() - (7 * 60 * 60 * 1000));
          from = weekStartUTC.toISOString();
          to = weekEndUTC.toISOString();
          isFullWeek = true;
          break;
        case "month":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          startOfMonth.setHours(0, 0, 0, 0);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          // Convert to UTC+7 timezone
          const startOfMonthUTC = new Date(startOfMonth.getTime() - (7 * 60 * 60 * 1000));
          const endOfMonthUTC = new Date(endOfMonth.getTime() - (7 * 60 * 60 * 1000));
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

  // Event handlers
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewMode("details");
  };

  const handleStartConsultation = (appointment: Appointment) => {
    // TODO: Implement consultation start logic
    console.log("Starting consultation for:", appointment.patientName);
  };

  const handleCreateExamination = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewMode("medical-examination");
  };

  const handleCreatePrescription = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewMode("prescription");
  };

  const handleManageSchedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewMode("schedule-manager");
  };

  const handleSaveMedicalExamination = async (data: CreateMedicalExaminationData) => {
    try {
      await medicalExaminationService.create(data);
      setViewMode("details");
      // TODO: Show success message
    } catch (error) {
      console.error("Error creating medical examination:", error);
      // TODO: Show error message
    }
  };

  const handleSavePrescription = async (data: CreatePrescriptionData) => {
    try {
      // TODO: Implement prescription service
      console.log("Saving prescription:", data);
      setViewMode("details");
      // TODO: Show success message
    } catch (error) {
      console.error("Error creating prescription:", error);
      // TODO: Show error message
    }
  };

  const handleSaveSchedule = async (updatedAppointment: Appointment, services: unknown[]) => {
    try {
      // TODO: Implement schedule update logic using the schedule service
      console.log("Saving schedule:", updatedAppointment, services);

      // Refetch the schedules to get the updated data
      await refetch();

      setSelectedAppointment(updatedAppointment);
      setViewMode("details");
      // TODO: Show success message
    } catch (error) {
      console.error("Error updating schedule:", error);
      // TODO: Show error message
    }
  };

  const handleCloseRightPanel = () => {
    setSelectedAppointment(null);
    setViewMode("list");
  };

  const handleAddAppointment = () => {
    // TODO: Implement add appointment logic
    console.log("Add new appointment");
  };

  // Determine if right panel should be shown
  const showRightPanel = viewMode !== "list" && selectedAppointment;

  // Render right panel content based on view mode
  const renderRightPanel = () => {
    if (!selectedAppointment) return null;

    switch (viewMode) {
      case "details":
        return (
          <AppointmentDetails
            appointment={selectedAppointment}
            onClose={handleCloseRightPanel}
            onStartConsultation={handleStartConsultation}
            onCreateExamination={handleCreateExamination}
            onCreatePrescription={handleCreatePrescription}
            onManageSchedule={handleManageSchedule}
          />
        );
      case "medical-examination":
        return (
          <MedicalExaminationForm
            appointment={selectedAppointment}
            onSave={handleSaveMedicalExamination}
            onCancel={handleCloseRightPanel}
          />
        );
      case "prescription":
        return (
          <PrescriptionForm
            appointment={selectedAppointment}
            onSave={handleSavePrescription}
            onCancel={handleCloseRightPanel}
          />
        );
      case "schedule-manager":
        return (
          <ScheduleManager
            appointment={selectedAppointment}
            onSave={handleSaveSchedule}
            onCancel={handleCloseRightPanel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)]">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Schedules List */}
        <Panel defaultSize={showRightPanel ? 50 : 100} minSize={40}>
          <div className="h-full space-y-6 overflow-auto p-6">
            {/* Header */}
            <ScheduleHeader onAddAppointment={handleAddAppointment} />

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
              onStartConsultation={handleStartConsultation}
            />

            {/* Summary Card */}
            <AppointmentSummary appointments={appointments} />
          </div>
        </Panel>

        {/* Panel Resize Handle and Right Panel */}
        {showRightPanel && (
          <>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
            <Panel defaultSize={50} minSize={35}>
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
