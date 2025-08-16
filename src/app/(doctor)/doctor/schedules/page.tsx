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

type ViewMode = 
  | "list" 
  | "details" 
  | "medical-examination" 
  | "prescription" 
  | "schedule-manager";

export default function DoctorSchedules() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Fetch appointments data
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Simulated data - replace with actual API calls
        const mockAppointments: Appointment[] = [
          {
            id: "1",
            patientName: "John Doe",
            patientPhone: "+1234567890",
            patientEmail: "john.doe@email.com",
            patientAddress: "123 Main St, City, State 12345",
            time: "09:00 AM",
            date: "2024-01-15",
            type: "Consultation",
            status: "upcoming",
            notes: "Regular checkup",
            duration: "30 minutes",
            symptoms: "General health checkup, no specific complaints",
            previousVisits: 3,
          },
          {
            id: "2",
            patientName: "Jane Smith",
            patientPhone: "+1234567891",
            patientEmail: "jane.smith@email.com",
            patientAddress: "456 Oak Ave, City, State 12346",
            time: "10:30 AM",
            date: "2024-01-15",
            type: "Follow-up",
            status: "in-progress",
            duration: "45 minutes",
            symptoms: "Follow-up for diabetes management",
            previousVisits: 8,
          },
          {
            id: "3",
            patientName: "Robert Johnson",
            patientPhone: "+1234567892",
            patientEmail: "robert.johnson@email.com",
            patientAddress: "789 Pine St, City, State 12347",
            time: "02:00 PM",
            date: "2024-01-15",
            type: "Emergency",
            status: "completed",
            notes: "Chest pain evaluation",
            duration: "60 minutes",
            symptoms: "Chest pain, shortness of breath",
            previousVisits: 1,
          },
        ];
        setAppointments(mockAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
      // TODO: Implement schedule update logic
      console.log("Saving schedule:", updatedAppointment, services);
      setAppointments(prev => 
        prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
      );
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
