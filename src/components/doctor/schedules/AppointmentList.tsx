"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Appointment } from "@/types/appointment";
import { AppointmentCard } from "./AppointmentCard";
import { useTranslation } from "react-i18next";

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  onViewDetails: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  loading,
  onViewDetails,
}: AppointmentListProps) {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <p>{t("doctor.schedules.loading")}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("doctor.schedules.noAppointments")}
          </h3>
          <p className="text-gray-600">
            {t("doctor.schedules.noAppointmentsDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 flex-1 overflow-auto">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
