"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  X,
  FileText,
  Users,
  Briefcase,
  Maximize2,
  Minimize2,
  Building2,
} from "lucide-react";
import { Appointment } from "@/types/appointment";
import { medicalExaminationService } from "@/services/medicalExamination.service";
import {
  CreateMedicalExaminationData,
  PopulatedMedicalExamination,
} from "@/types/medicalExamination";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";

import { MedicalExaminationDetails } from "./MedicalExaminationDetails";
import { PrescriptionDisplay } from "./PrescriptionDisplay";
import { consultationServiceApi } from "@/services/consultationService.service";
import { scheduleService } from "@/services/schedule.service";
import { ScheduleStatus } from "@/types/schedule";
import { ConsultationService, DoctorWithPopulatedData } from "@/types";
import SearchService from "@/components/dialogs/search-service";
import { useAuthStore } from "@/stores/auth";
import { doctorService, roomService } from "@/services";
import { prescriptionService } from "@/services/prescription.service";
import { CreatePrescriptionData } from "@/types/prescription";
import { CreatePrescriptionDialog } from "@/components/dialogs/create-prescription";

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onViewHistory?: (appointment: Appointment) => void;
  handleExpandRightPanel?: () => void;
  handleCollapseRightPanel?: () => void;
  rightPanelSize?: number;
}

export function AppointmentDetails({
  appointment,
  onClose,
  onViewHistory,
  handleExpandRightPanel,
  handleCollapseRightPanel,
  rightPanelSize,
}: AppointmentDetailsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [newlyAddedServiceIds, setNewlyAddedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [isSearchServiceDialogOpen, setIsSearchServiceDialogOpen] =
    useState(false);


  // Prescription dialog state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // Handler for prescription creation
  const handleCreatePrescriptionClick = () => {
    setShowPrescriptionForm(true);
  };

  const handlePrescriptionFormSave = async (data: CreatePrescriptionData) => {
    try {
      // Create the prescription
      const createdPrescription = await prescriptionService.create(data);
      
      // Check if we have a valid prescription with _id
      if (!createdPrescription || !createdPrescription._id) {
        throw new Error("Invalid prescription response from API");
      }
      
      // Update medical examination with prescription ID
      if (medicalExamination?._id) {
        await medicalExaminationService.update(medicalExamination._id, {
          prescription: createdPrescription._id
        });
      }
      
      // Update schedule status to completed
      if (appointment.originalSchedule?._id) {
        await scheduleService.update(appointment.originalSchedule._id, {
          status: ScheduleStatus.COMPLETED
        });
      }
      
      // Refetch the medical examination to get updated data
      await mutateMedicalExamination();
      
      // Get the prescription details
      const prescriptionDetails = await prescriptionService.getById(createdPrescription._id);
      
      // Close the form and reset state
      setShowPrescriptionForm(false);
      
      // Show success message
      toast({
        title: "Success",
        description: "Prescription created successfully and appointment marked as completed!",
      });
      
      console.log("Created prescription:", prescriptionDetails);
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
      });
    }
  };





  // Fetch medical examination data using SWR with automatic refresh every 10 seconds
  const {
    data: medicalExamination,
    isLoading,
    error: medicalExaminationError,
    mutate: mutateMedicalExamination,
  } = useSWR(
    appointment.originalSchedule?._id
      ? [
          "",
          "medicalExamination",
          String(appointment.originalSchedule._id),
        ]
      : null,
    async ([, , scheduleId]: [string, string, string]) => {
      const response = await medicalExaminationService.getAllPopulated({
        options: {
          filter: {
            scheduleReferrence: scheduleId,
          },
          populateOptions: {
            path: "scheduleReferrence",
          },
        },
      });

      return response.data.length > 0
        ? (response.data[0] as PopulatedMedicalExamination)
        : null;
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );
  const { user } = useAuthStore();
  const [doctorProfile, setDoctorProfile] =
    useState<DoctorWithPopulatedData | null>(null);

  console.log(medicalExamination)

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user?._id) {
        try {
          const profile = await doctorService.findOneByUserId(user._id);
          setDoctorProfile(profile);
        } catch (error) {
          alert(error);
          console.error("Failed to fetch doctor profile:", error);
          toast({
            title: "Error",
            description: "Could not load doctor profile.",
          });
        }
      }
    };

    fetchDoctorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (medicalExaminationError) {
      console.error(
        "Failed to fetch medical examination:",
        medicalExaminationError
      );
      toast({
        title: "Error",
        description: "Failed to fetch existing medical examination.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalExaminationError]);

  useEffect(() => {
    const fetchInitialServices = async () => {
      if (
        appointment.originalSchedule?.services &&
        appointment.originalSchedule.services.length > 0
      ) {
        try {
          const serviceIds = appointment.originalSchedule.services
            .map((s) => s.service)
            .filter(Boolean) as string[];
          if (serviceIds.length > 0) {
            const fullServices = await consultationServiceApi.getByIds(
              serviceIds
            );

            //fetch room details
            const roomIDs = fullServices
              .map((s) => s.room)
              .filter((s) => s !== undefined);
            const room = await roomService.getByIds(roomIDs as string[]);

            fullServices.forEach((s) => {
              if (s.room) {
                s.roomDetail = room.find((r) => r._id === s.room);
              }
            });

            setServices(fullServices);
          }
        } catch (error) {
          console.error("Failed to fetch initial services:", error);
          toast({
            title: "Error",
            description: "Could not load existing services.",
          });
        }
      }
      setIsLoadingServices(false);
    };

    fetchInitialServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment.originalSchedule?.services]);

  const handleStartConsultation = async () => {
    try {
      // Create medical examination data
      const medicalExaminationData: CreateMedicalExaminationData = {
        patient: appointment.userId as string, // Use the patient ID from appointment
        examinationDate: new Date().toISOString(),
        symptoms: appointment.symptoms ? [appointment.symptoms] : [],
        services:
          appointment.originalSchedule?.services?.map((s) => s.service) || [],
        scheduleReferrence: appointment.originalSchedule?._id as string,
      };

      // Create the medical examination
      medicalExaminationService.create(medicalExaminationData);

      await mutateMedicalExamination();

      toast({
        title: "Medical Examination Created",
        description:
          "A new medical examination has been created for this consultation.",
      });
    } catch (error) {
      console.error("Error creating medical examination:", error);
      toast({
        title: "Error",
        description: "Failed to create medical examination. Please try again.",
      });
    }
  };

  const handleAddServices = (selectedServices: ConsultationService[]) => {
    const newServicesToAdd = selectedServices.filter(
      (selected) => !services.some((existing) => existing._id === selected._id)
    );

    if (newServicesToAdd.length > 0) {
      setServices((prev) => [...prev, ...newServicesToAdd]);
      setNewlyAddedServiceIds((prev) => {
        const newIds = newServicesToAdd.map((s) => s._id);
        return new Set([...prev, ...newIds]);
      });
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s._id !== serviceId));
    setNewlyAddedServiceIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(serviceId);
      return newSet;
    });
  };

  const handleSaveServices = async () => {
    if (!appointment.originalSchedule?._id) return;

    try {
      const updatedServiceIds = services.map((s) => s._id);

      await scheduleService.update(appointment.originalSchedule._id, {
        services: updatedServiceIds,
      });
      setNewlyAddedServiceIds(new Set());
      toast({
        title: "Success",
        description: "Services updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update services:", error);
      toast({
        title: "Error",
        description: "Failed to update services.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emergency":
        return "bg-red-100 text-red-800";
      case "Follow-up":
        return "bg-orange-100 text-orange-800";
      case "Consultation":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("doctor.schedules.appointmentDetails")}
          </h2>
          <div>
            {rightPanelSize !== 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandRightPanel}
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}
            {rightPanelSize === 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseRightPanel}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-auto">
        <Accordion
          type="multiple"
          defaultValue={["patient-info", "appointment-info"]}
          className="w-full"
        >
          {/* Patient Information */}
          <AccordionItem value="patient-info">
            <AccordionTrigger className="text-base font-semibold">
              {t("doctor.schedules.patientInformation")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {appointment.patientName}
                    </p>
                    <p className="text-xs text-gray-600">{t("doctor.schedules.patientName")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {appointment.patientPhone}
                    </p>
                    <p className="text-xs text-gray-600">{t("doctor.schedules.phoneNumber")}</p>
                  </div>
                </div>
                {appointment.patientEmail &&
                  appointment.patientEmail !== "N/A" && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {appointment.patientEmail}
                        </p>
                        <p className="text-xs text-gray-600">{t("doctor.schedules.email")}</p>
                      </div>
                    </div>
                  )}
                {appointment.patientAddress &&
                  appointment.patientAddress !== "N/A" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {appointment.patientAddress}
                        </p>
                        <p className="text-xs text-gray-600">{t("doctor.schedules.address")}</p>
                      </div>
                    </div>
                  )}
                {appointment.patientGender &&
                  appointment.patientGender !== "N/A" && (
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {appointment.patientGender}
                        </p>
                        <p className="text-xs text-gray-600">{t("doctor.schedules.gender")}</p>
                      </div>
                    </div>
                  )}
                {appointment.patientDateOfBirth &&
                  appointment.patientDateOfBirth !== "N/A" && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(
                            appointment.patientDateOfBirth
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{t("doctor.schedules.dateOfBirth")}</p>
                      </div>
                    </div>
                  )}
                {appointment.patientOccupation &&
                  appointment.patientOccupation !== "N/A" && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {appointment.patientOccupation}
                        </p>
                        <p className="text-xs text-gray-600">{t("doctor.schedules.occupation")}</p>
                      </div>
                    </div>
                  )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appointment Information */}
          <AccordionItem value="appointment-info">
            <AccordionTrigger className="text-base font-semibold">
              {t("doctor.schedules.appointmentInformation")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{appointment.date}</p>
                    <p className="text-xs text-gray-600">{t("doctor.schedules.date")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p className="text-xs text-gray-600">{t("doctor.schedules.time")}</p>
                  </div>
                </div>
                {appointment.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.duration}
                      </p>
                      <p className="text-xs text-gray-600">{t("doctor.schedules.duration")}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3"></div>
                  <div className="flex gap-1">
                    <Badge
                      className={`${getTypeColor(
                        appointment.type
                      )} text-xs px-2 py-0.5`}
                    >
                      {appointment.type}
                    </Badge>
                    <Badge
                      className={`${getStatusColor(
                        appointment.status
                      )} text-xs px-2 py-0.5`}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Service Management */}
          <AccordionItem value="services">
            <AccordionTrigger className="text-base font-semibold">
              {t("doctor.schedules.services")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2">
                {appointment.status !== "in-progress" && appointment.originalSchedule?.status !== ScheduleStatus.COMPLETED && (
                  <div className="w-full text-xs p-2 border bg-yellow-50 text-yellow-700 border-yellow-200 rounded-md mb-3">
                    <p>
                      {t("doctor.schedules.servicesCannotBeEdited")}
                    </p>
                  </div>
                )}
                {appointment.originalSchedule?.status === ScheduleStatus.COMPLETED && (
                  <div className="w-full text-xs p-2 border bg-green-50 text-green-700 border-green-200 rounded-md mb-3">
                    <p>
                      {t("doctor.schedules.appointmentCompleted")}
                    </p>
                  </div>
                )}
                {isLoadingServices ? (
                  <p className="text-sm text-gray-500">{t("doctor.schedules.loadingServices")}</p>
                ) : (
                  <>
                    {services.map((service, index) => (
                      <div
                        key={`${service._id}-${index}`}
                        className="bg-gray-50 rounded-lg p-3 border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {service.name || t("doctor.schedules.service")}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  appointment.originalSchedule?.services?.find(
                                    (s) => s.service === service._id
                                  )?.status === "completed"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                {appointment.originalSchedule?.services?.find(
                                  (s) => s.service === service._id
                                )?.status || (
                                  <div className="text-xs text-gray-500">
                                    {t("doctor.schedules.temporary")}
                                  </div>
                                )}
                              </Badge>
                            </div>
                            {service && (
                              <>
                                <p className="text-xs text-gray-600 mb-2">
                                  {service.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {service.room && service.roomDetail && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>
                                        {service.roomDetail?.name} - room{" "}
                                        {service.roomDetail?.roomNumber} - floor{" "}
                                        {service.roomDetail?.roomFloor}
                                      </span>
                                    </div>
                                  )}
                                  {service.specialization &&
                                    typeof service.specialization ===
                                      "object" && (
                                      <div className="flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        <span>
                                          {service.specialization.name}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </>
                            )}
                            {newlyAddedServiceIds.has(service._id) &&
                              appointment.status === "in-progress" &&
                              appointment.originalSchedule?.status !== ScheduleStatus.COMPLETED && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-2"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveService(service._id)
                                  }
                                >
                                  {t("doctor.schedules.remove")}
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSearchServiceDialogOpen(true)}
                    disabled={appointment.status !== "in-progress" || appointment.originalSchedule?.status === ScheduleStatus.COMPLETED}
                    title={
                      appointment.originalSchedule?.status === ScheduleStatus.COMPLETED
                        ? t("doctor.schedules.cannotEditCompleted")
                        : appointment.status !== "in-progress"
                        ? t("doctor.schedules.mustCheckIn")
                        : ""
                    }
                  >
                    {t("doctor.schedules.addService")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveServices}
                    disabled={
                      newlyAddedServiceIds.size === 0 ||
                      appointment.status !== "in-progress" ||
                      appointment.originalSchedule?.status === ScheduleStatus.COMPLETED
                    }
                    title={
                      appointment.originalSchedule?.status === ScheduleStatus.COMPLETED
                        ? t("doctor.schedules.cannotEditCompleted")
                        : appointment.status !== "in-progress"
                        ? t("doctor.schedules.mustCheckIn")
                        : ""
                    }
                  >
                    {t("doctor.schedules.saveServices")}
                  </Button>
                </div>
                <SearchService
                  isOpen={isSearchServiceDialogOpen}
                  onOpenChange={setIsSearchServiceDialogOpen}
                  onApply={handleAddServices}
                  multiple={true}
                  initialSelectedIds={services.map((s) => s._id)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Medical Information */}
          <AccordionItem value="medical-info">
            <AccordionTrigger className="text-base font-semibold">
              {t("doctor.schedules.medicalInformation")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2">
                {medicalExamination && doctorProfile ? (
                  <MedicalExaminationDetails
                    examination={medicalExamination}
                    onUpdate={(updated) =>
                      mutateMedicalExamination(updated, false)
                    }
                    doctorProfile={doctorProfile}
                    disabled={!!medicalExamination.prescription || appointment.originalSchedule?.status === ScheduleStatus.COMPLETED}
                  />
                ) : (
                  <div>
                    <div className="space-y-2">
                      {appointment.symptoms && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {t("doctor.schedules.symptoms")}
                          </p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                            {appointment.symptoms}
                          </p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {t("doctor.schedules.notes")}
                          </p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                      {appointment.previousVisits !== undefined && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {t("doctor.schedules.previousVisits")}
                          </p>
                          <p className="text-sm text-gray-900">
                            {appointment.previousVisits} {t("doctor.schedules.visits")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Prescription Information */}
          {medicalExamination?.prescription && (
            <AccordionItem value="prescription-info">
              <AccordionTrigger className="text-base font-semibold">
                {t("doctor.schedules.prescription")}
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-2">
                  <PrescriptionDisplay 
                    prescriptionId={
                      typeof medicalExamination.prescription === 'string' 
                        ? medicalExamination.prescription 
                        : medicalExamination.prescription._id
                    } 
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Action Buttons */}
        <div className="pt-3 border-t space-y-2 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-8">
              <p className="text-sm text-gray-500">{t("doctor.schedules.loading")}</p>
            </div>
          ) : (
            <div className="flex gap-2">
              {appointment.status === "in-progress" ? (
                <>
                  {medicalExamination ? (
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={handleCreatePrescriptionClick}
                      disabled={appointment.originalSchedule?.status === ScheduleStatus.COMPLETED}
                    >
                      {t("doctor.schedules.createPrescription")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={handleStartConsultation}
                      disabled={appointment.originalSchedule?.status === ScheduleStatus.COMPLETED}
                    >
                      {t("doctor.schedules.startConsultation")}
                    </Button>
                  )}
                </>
              ) : appointment.originalSchedule?.status === ScheduleStatus.COMPLETED ? (
                <div className="w-fit text-xs p-2 border bg-green-50 text-green-700 border-green-200 rounded-md">
                  <p>{t("doctor.schedules.appointmentCompletedMessage")}</p>
                </div>
              ) : (
                <div className="w-fit text-xs p-2 border bg-yellow-50 text-yellow-700 border-yellow-200 rounded-md">
                  <p>{t("doctor.schedules.notCheckedIn")}</p>
                </div>
              )}
              {onViewHistory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => onViewHistory(appointment)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {t("doctor.schedules.viewHistory")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Prescription Dialog */}
      <CreatePrescriptionDialog
        isOpen={showPrescriptionForm}
        onOpenChange={setShowPrescriptionForm}
        onSave={handlePrescriptionFormSave}
        patientId={
          medicalExamination?.patient
            ? typeof medicalExamination.patient === "string"
              ? medicalExamination.patient
              : medicalExamination.patient._id
            : appointment.originalSchedule?.userId
            ? typeof appointment.originalSchedule.userId === "string"
              ? appointment.originalSchedule.userId
              : appointment.originalSchedule.userId._id
            : ""
        }
        patientName={
          appointment.patientName || "Patient"
        }
      />


    </div>
  );
}
