"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus, Save, Settings, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { useTranslation } from "react-i18next";

interface ScheduleService {
  id: string;
  name: string;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
}

interface ScheduleManagerProps {
  appointment: Appointment;
  onSave: (updatedAppointment: Appointment, services: ScheduleService[]) => Promise<void>;
  onCancel: () => void;
}

export function ScheduleManager({
  appointment,
  onSave,
  onCancel,
}: ScheduleManagerProps) {
  const { t } = useTranslation();
  const [appointmentData, setAppointmentData] = useState<Appointment>(appointment);
  const [services, setServices] = useState<ScheduleService[]>([
    { id: "1", name: t("doctor.schedules.sampleServices.bloodTest"), status: "pending" },
    { id: "2", name: t("doctor.schedules.sampleServices.xRay"), status: "pending" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (status: AppointmentStatus) => {
    setAppointmentData({ ...appointmentData, status });
  };

  const handleTimeChange = (time: string) => {
    setAppointmentData({ ...appointmentData, time });
  };

  const handleDateChange = (date: string) => {
    setAppointmentData({ ...appointmentData, date });
  };

  const handleNotesChange = (notes: string) => {
    setAppointmentData({ ...appointmentData, notes });
  };

  const handleServiceStatusChange = (serviceId: string, status: ScheduleService["status"]) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, status } : service
    ));
  };

  const handleServiceNotesChange = (serviceId: string, notes: string) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, notes } : service
    ));
  };

  const addService = () => {
    const newService: ScheduleService = {
      id: Date.now().toString(),
      name: "",
      status: "pending",
      notes: "",
    };
    setServices([...services, newService]);
  };

  const removeService = (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
  };

  const handleServiceNameChange = (serviceId: string, name: string) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, name } : service
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
      case "pending":
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(appointmentData, services);
    } catch (error) {
      console.error("Error saving schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t("doctor.schedules.manageSchedule")}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 overflow-auto">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("doctor.schedules.patientInformation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p><strong>{t("doctor.schedules.name")}:</strong> {appointment.patientName}</p>
              <p><strong>{t("doctor.schedules.phone")}:</strong> {appointment.patientPhone}</p>
              <p><strong>{t("doctor.schedules.type")}:</strong> {appointment.type}</p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("doctor.schedules.appointmentDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="text-xs">{t("doctor.schedules.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-xs">{t("doctor.schedules.time")}</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentData.time.replace(/\s+(AM|PM)$/i, '')}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-xs">{t("doctor.schedules.status")}</Label>
              <Select
                value={appointmentData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">{t("doctor.schedules.status.upcoming")}</SelectItem>
                  <SelectItem value="in-progress">{t("doctor.schedules.status.inProgress")}</SelectItem>
                  <SelectItem value="completed">{t("doctor.schedules.status.completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("doctor.schedules.status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs">{t("doctor.schedules.notes")}</Label>
              <Input
                id="notes"
                value={appointmentData.notes || ""}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={t("doctor.schedules.appointmentNotes")}
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              {t("doctor.schedules.services")}
              <Button type="button" size="sm" variant="outline" onClick={addService}>
                <Plus className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="space-y-3 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{t("doctor.schedules.service")}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeService(service.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs">{t("doctor.schedules.serviceName")}</Label>
                  <Input
                    value={service.name}
                    onChange={(e) => handleServiceNameChange(service.id, e.target.value)}
                    placeholder={t("doctor.schedules.serviceNamePlaceholder")}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">{t("doctor.schedules.status")}</Label>
                  <Select
                    value={service.status}
                    onValueChange={(status: ScheduleService["status"]) =>
                      handleServiceStatusChange(service.id, status)
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("doctor.schedules.status.pending")}</SelectItem>
                      <SelectItem value="completed">{t("doctor.schedules.status.completed")}</SelectItem>
                      <SelectItem value="cancelled">{t("doctor.schedules.status.cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <Clock className="h-3 w-3 text-gray-400" />
                </div>

                <div>
                  <Label className="text-xs">{t("doctor.schedules.notes")}</Label>
                  <Input
                    value={service.notes || ""}
                    onChange={(e) => handleServiceNotesChange(service.id, e.target.value)}
                    placeholder={t("doctor.schedules.serviceNotes")}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button type="submit" disabled={isSaving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t("doctor.schedules.saving") : t("doctor.schedules.saveChanges")}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("doctor.schedules.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
