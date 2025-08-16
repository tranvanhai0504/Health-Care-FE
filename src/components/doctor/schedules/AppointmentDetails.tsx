"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, Clock, X, FileText } from "lucide-react";
import { Appointment } from "@/types/appointment";

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onStartConsultation?: (appointment: Appointment) => void;
  onViewHistory?: (appointment: Appointment) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onCreateExamination?: (appointment: Appointment) => void;
  onCreatePrescription?: (appointment: Appointment) => void;
  onManageSchedule?: (appointment: Appointment) => void;
}

export function AppointmentDetails({
  appointment,
  onClose,
  onStartConsultation,
  onViewHistory,
  onEditAppointment,
  onCreateExamination,
  onCreatePrescription,
  onManageSchedule,
}: AppointmentDetailsProps) {
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
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-auto">
        {/* Patient Information */}
        <div>
          <h3 className="text-base font-semibold mb-3">Patient Information</h3>
          <div className="space-y-2 grid grid-cols-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{appointment.patientName}</p>
                <p className="text-xs text-gray-600">Patient</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{appointment.patientPhone}</p>
                <p className="text-xs text-gray-600">Phone Number</p>
              </div>
            </div>
            {appointment.patientEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{appointment.patientEmail}</p>
                  <p className="text-xs text-gray-600">Email</p>
                </div>
              </div>
            )}
            {appointment.patientAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{appointment.patientAddress}</p>
                  <p className="text-xs text-gray-600">Address</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Information */}
        <div>
          <h3 className="text-base font-semibold mb-3">Appointment Information</h3>
          <div className="space-y-2">
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
                  <p className="text-sm font-medium">{appointment.duration}</p>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3"></div>
              <div className="flex gap-1">
                <Badge className={`${getTypeColor(appointment.type)} text-xs px-2 py-0.5`}>
                  {appointment.type}
                </Badge>
                <Badge className={`${getStatusColor(appointment.status)} text-xs px-2 py-0.5`}>
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <h3 className="text-base font-semibold mb-3">Medical Information</h3>
          <div className="space-y-2">
            {appointment.symptoms && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Symptoms/Reason</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                  {appointment.symptoms}
                </p>
              </div>
            )}
            {appointment.notes && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                  {appointment.notes}
                </p>
              </div>
            )}
            {appointment.previousVisits !== undefined && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Previous Visits</p>
                <p className="text-sm text-gray-900">{appointment.previousVisits} visits</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t space-y-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            {appointment.status === "upcoming" && onStartConsultation && (
              <Button 
                size="sm" 
                className="flex-1 text-xs h-8"
                onClick={() => onStartConsultation(appointment)}
              >
                Start Consultation
              </Button>
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

          {/* Medical Actions */}
          <div className="space-y-1">
            {onCreateExamination && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8"
                onClick={() => onCreateExamination(appointment)}
              >
                Create Medical Examination
              </Button>
            )}
            {onCreatePrescription && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8"
                onClick={() => onCreatePrescription(appointment)}
              >
                Create Prescription
              </Button>
            )}
            {onManageSchedule && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8"
                onClick={() => onManageSchedule(appointment)}
              >
                Manage Schedule
              </Button>
            )}
          </div>

          {/* Secondary Actions */}
          {onEditAppointment && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-8"
              onClick={() => onEditAppointment(appointment)}
            >
              Edit Appointment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
