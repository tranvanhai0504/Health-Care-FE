"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { 
  Calendar, 
  Clock, 
  Search,
  Plus,

  Phone,
  Stethoscope,
  Edit,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  type: string;
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

export default function ReceptionistAppointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  useEffect(() => {
    // TODO: Fetch actual data from API
    const fetchAppointments = async () => {
      try {
        // Simulated data - replace with actual API calls
        const mockAppointments: Appointment[] = [
          {
            id: "1",
            patientName: t("receptionist.appointments.sampleData.patients.johnDoe"),
            patientPhone: "+1234567890",
            doctorName: t("receptionist.appointments.sampleData.doctors.drSmith"),
            specialty: t("receptionist.appointments.sampleData.specialties.cardiology"),
            time: "09:00 AM",
            date: "2024-01-15",
            type: t("receptionist.appointments.sampleData.types.consultation"),
            status: "scheduled",
            notes: t("receptionist.appointments.sampleData.notes.regularCheckup")
          },
          {
            id: "2",
            patientName: t("receptionist.appointments.sampleData.patients.janeSmith"),
            patientPhone: "+1234567891",
            doctorName: t("receptionist.appointments.sampleData.doctors.drJohnson"),
            specialty: t("receptionist.appointments.sampleData.specialties.pediatrics"),
            time: "10:30 AM",
            date: "2024-01-15",
            type: t("receptionist.appointments.sampleData.types.followUp"),
            status: "checked-in"
          },
          {
            id: "3",
            patientName: t("receptionist.appointments.sampleData.patients.robertJohnson"),
            patientPhone: "+1234567892",
            doctorName: t("receptionist.appointments.sampleData.doctors.drBrown"),
            specialty: t("receptionist.appointments.sampleData.specialties.orthopedics"),
            time: "02:00 PM",
            date: "2024-01-15",
            type: t("receptionist.appointments.sampleData.types.emergency"),
            status: "in-progress",
            notes: t("receptionist.appointments.sampleData.notes.kneeInjury")
          },
          {
            id: "4",
            patientName: t("receptionist.appointments.sampleData.patients.maryWilson"),
            patientPhone: "+1234567893",
            doctorName: t("receptionist.appointments.sampleData.doctors.drDavis"),
            specialty: t("receptionist.appointments.sampleData.specialties.dermatology"),
            time: "03:30 PM",
            date: "2024-01-15",
            type: t("receptionist.appointments.sampleData.types.consultation"),
            status: "completed"
          }
        ];
        setAppointments(mockAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesDoctor = doctorFilter === "all" || appointment.doctorName === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const handleCheckIn = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: "checked-in" as const }
          : apt
      )
    );
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("receptionist.appointments.title")}</h1>
          <p className="text-gray-600 mt-2">{t("receptionist.appointments.subtitle")}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("receptionist.appointments.scheduleAppointment")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("receptionist.appointments.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("receptionist.appointments.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("receptionist.appointments.allStatus")}</SelectItem>
                <SelectItem value="scheduled">{t("receptionist.appointments.status.scheduled")}</SelectItem>
                <SelectItem value="checked-in">{t("receptionist.appointments.status.checkedIn")}</SelectItem>
                <SelectItem value="in-progress">{t("receptionist.appointments.status.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("receptionist.appointments.status.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("receptionist.appointments.status.cancelled")}</SelectItem>
                <SelectItem value="no-show">{t("receptionist.appointments.status.noShow")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("receptionist.appointments.filterByDoctor")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("receptionist.appointments.allDoctors")}</SelectItem>
                <SelectItem value="Dr. Smith">{t("receptionist.appointments.sampleData.doctors.drSmith")}</SelectItem>
                <SelectItem value="Dr. Johnson">{t("receptionist.appointments.sampleData.doctors.drJohnson")}</SelectItem>
                <SelectItem value="Dr. Brown">{t("receptionist.appointments.sampleData.doctors.drBrown")}</SelectItem>
                <SelectItem value="Dr. Davis">{t("receptionist.appointments.sampleData.doctors.drDavis")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading appointments...
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900 mb-2">No appointments found</div>
                    <div className="text-gray-600">No appointments match your current filters.</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {appointment.patientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.doctorName}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Stethoscope className="h-3 w-3 mr-1" />
                          {appointment.specialty}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{appointment.time}</div>
                          <div className="text-sm text-gray-600">{appointment.date}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{appointment.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {appointment.status === "scheduled" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCheckIn(appointment.id)}
                          >
                            Check In
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t("receptionist.appointments.status.scheduled"), count: appointments.filter(a => a.status === "scheduled").length, color: "text-blue-600" },
          { label: t("receptionist.appointments.status.checkedIn"), count: appointments.filter(a => a.status === "checked-in").length, color: "text-green-600" },
          { label: t("receptionist.appointments.status.inProgress"), count: appointments.filter(a => a.status === "in-progress").length, color: "text-yellow-600" },
          { label: t("receptionist.appointments.status.completed"), count: appointments.filter(a => a.status === "completed").length, color: "text-green-600" },
          { label: t("receptionist.appointments.status.cancelled"), count: appointments.filter(a => a.status === "cancelled").length, color: "text-red-600" },
          { label: t("receptionist.appointments.status.noShow"), count: appointments.filter(a => a.status === "no-show").length, color: "text-gray-600" }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 