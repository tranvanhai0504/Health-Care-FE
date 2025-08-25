"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Appointment } from "@/types/appointment";
import { medicalExaminationService } from "@/services/medicalExamination.service";
import {
  CreateMedicalExaminationData,
  PopulatedMedicalExamination,
} from "@/types/medicalExamination";
import { useToast } from "@/hooks/useToast";

import { MedicalExaminationDetails } from "./MedicalExaminationDetails";
import { consultationServiceApi } from "@/services/consultationService.service";
import { scheduleService } from "@/services/schedule.service";
import { ConsultationService } from "@/types";
import SearchService from "@/components/dialogs/search-service";

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onStartConsultation?: (appointment: Appointment) => void;
  onViewHistory?: (appointment: Appointment) => void;
  onCreatePrescription?: (
    medicalExamination: PopulatedMedicalExamination
  ) => void;
  handleExpandRightPanel?: () => void;
  handleCollapseRightPanel?: () => void;
  rightPanelSize?: number;
}

export function AppointmentDetails({
  appointment,
  onClose,
  onStartConsultation,
  onViewHistory,
  onCreatePrescription,
  handleExpandRightPanel,
  handleCollapseRightPanel,
  rightPanelSize,
}: AppointmentDetailsProps) {
  const { toast } = useToast();
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [newlyAddedServiceIds, setNewlyAddedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [isSearchServiceDialogOpen, setIsSearchServiceDialogOpen] =
    useState(false);
  const [medicalExamination, setMedicalExamination] =
    useState<PopulatedMedicalExamination | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMedicalExamination = async () => {
      if (!appointment.userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await medicalExaminationService.getAllPopulated({
          patient: appointment.userId as string,
          examinationDate: new Date(appointment.date).toISOString(),
        });

        if (response.data.length > 0) {
          setMedicalExamination(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch medical examination:", error);
        toast({
          title: "Error",
          description: "Failed to fetch existing medical examination.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalExamination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment]);

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
      };

      // Create the medical examination
      await medicalExaminationService.create(medicalExaminationData);

      toast({
        title: "Medical Examination Created",
        description:
          "A new medical examination has been created for this consultation.",
      });

      // Call the original onStartConsultation if provided
      if (onStartConsultation) {
        onStartConsultation(appointment);
      }
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
      const updatedServiceIds = services
        .map((s) => s._id)
        .filter(
          (s) =>
            !appointment.originalSchedule?.services?.find(
              (ss) => ss.service === s
            )
        );
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
            Appointment Details
          </h2>
          <div>
            {rightPanelSize !== 100 && (
              <Button variant="ghost" size="sm" onClick={handleExpandRightPanel}>
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}
            {rightPanelSize === 100 && (
              <Button variant="ghost" size="sm" onClick={handleCollapseRightPanel}>
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
              Patient Information
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {appointment.patientName}
                    </p>
                    <p className="text-xs text-gray-600">Patient Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {appointment.patientPhone}
                    </p>
                    <p className="text-xs text-gray-600">Phone Number</p>
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
                        <p className="text-xs text-gray-600">Email</p>
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
                        <p className="text-xs text-gray-600">Address</p>
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
                        <p className="text-xs text-gray-600">Gender</p>
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
                        <p className="text-xs text-gray-600">Date of Birth</p>
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
                        <p className="text-xs text-gray-600">Occupation</p>
                      </div>
                    </div>
                  )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appointment Information */}
          <AccordionItem value="appointment-info">
            <AccordionTrigger className="text-base font-semibold">
              Appointment Information
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{appointment.date}</p>
                    <p className="text-xs text-gray-600">Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p className="text-xs text-gray-600">Time</p>
                  </div>
                </div>
                {appointment.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.duration}
                      </p>
                      <p className="text-xs text-gray-600">Duration</p>
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
              Services
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2">
                {isLoadingServices ? (
                  <p className="text-sm text-gray-500">Loading services...</p>
                ) : (
                  <>
                    {services.map((service) => (
                      <div
                        key={service._id}
                        className="p-2 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-gray-500">
                            {service.description}
                          </p>
                        </div>
                        {newlyAddedServiceIds.has(service._id) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveService(service._id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSearchServiceDialogOpen(true)}
                  >
                    Add Service
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveServices}
                    disabled={newlyAddedServiceIds.size === 0}
                  >
                    Save Services
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
              Medical Information
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2">
                {medicalExamination ? (
                  <MedicalExaminationDetails
                    examination={medicalExamination}
                    onUpdate={(updated) => setMedicalExamination(updated)}
                  />
                ) : (
                  <div>
                    <div className="space-y-2">
                      {appointment.symptoms && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Symptoms
                          </p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                            {appointment.symptoms}
                          </p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                      {appointment.previousVisits !== undefined && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Previous Visits
                          </p>
                          <p className="text-sm text-gray-900">
                            {appointment.previousVisits} visits
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div className="pt-3 border-t space-y-2 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-8">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="flex gap-2">
              {appointment.status === "upcoming" && (
                <>
                  {medicalExamination ? (
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => onCreatePrescription?.(medicalExamination)}
                    >
                      Create Prescription
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={handleStartConsultation}
                    >
                      Start Consultation
                    </Button>
                  )}
                </>
              )}
              {onViewHistory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => onViewHistory(appointment)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View History
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
