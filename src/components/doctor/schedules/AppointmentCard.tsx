"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Clock, Phone, Mail, Users } from "lucide-react";
import { Appointment } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
  onStartConsultation?: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  onViewDetails,
  onStartConsultation,
}: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "checkedIn":
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
      case "checkIn":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">
                {appointment.patientName}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 sm:items-center gap-1 sm:gap-1 text-xs text-gray-600 mt-1">
                <span className="flex items-center text-nowrap">
                  <Clock className="h-3 w-3 mr-1" />
                  {appointment.time}
                </span>
                <span className="flex items-center truncate">
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="truncate">{appointment.patientPhone}</span>
                </span>
                {appointment.patientEmail &&
                  appointment.patientEmail !== "N/A" && (
                    <span className="flex items-center truncate">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate">
                        {appointment.patientEmail}
                      </span>
                    </span>
                  )}
                {appointment.patientGender &&
                  appointment.patientGender !== "N/A" && (
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span className="capitalize">
                        {appointment.patientGender}
                      </span>
                    </span>
                  )}
              </div>
              {appointment.notes && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
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
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onViewDetails(appointment)}
              >
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
              </Button>
              {appointment.status === "in-progress" && onStartConsultation && (
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onStartConsultation(appointment)}
                >
                  <span className="hidden sm:inline">Start</span>
                  <span className="sm:hidden">▶</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
