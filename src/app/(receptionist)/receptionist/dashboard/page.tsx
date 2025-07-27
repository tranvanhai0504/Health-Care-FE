"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  UserPlus, 
  Clock,
  Phone,
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  todayAppointments: number;
  waitingPatients: number;
  availableDoctors: number;
  completedAppointments: number;
}

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    waitingPatients: 0,
    availableDoctors: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual data from API
    const fetchDashboardData = async () => {
      try {
        // Simulated data - replace with actual API calls
        setStats({
          todayAppointments: 24,
          waitingPatients: 7,
          availableDoctors: 5,
          completedAppointments: 17
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Schedule Appointment",
      description: "Book a new appointment for a patient",
      href: "/receptionist/appointments/create",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Register Patient",
      description: "Add a new patient to the system",
      href: "/receptionist/patients/register",
      icon: <UserPlus className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Manage Queue",
      description: "View and manage waiting patients",
      href: "/receptionist/queue",
      icon: <Clock className="h-6 w-6" />,
      color: "bg-orange-500"
    },
    {
      title: "Check-in Patient",
      description: "Mark patient as arrived",
      href: "/receptionist/check-in",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's today's front desk overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.completedAppointments}</span> completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.waitingPatients}</div>
            <p className="text-xs text-muted-foreground">
              In waiting room
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.availableDoctors}</div>
            <p className="text-xs text-muted-foreground">
              Out of 8 total doctors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Appointments finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-md ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { patient: "John Doe", doctor: "Dr. Smith", time: "10:30 AM", status: "waiting" },
                { patient: "Jane Smith", doctor: "Dr. Johnson", time: "11:00 AM", status: "in-progress" },
                { patient: "Robert Wilson", doctor: "Dr. Brown", time: "11:30 AM", status: "checked-in" }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">{appointment.patient}</p>
                    <p className="text-xs text-gray-500">{appointment.doctor} • {appointment.time}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/receptionist/queue">Manage Full Queue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Urgent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { message: "Dr. Smith is running 15 minutes late", type: "warning", time: "2 min ago" },
                { message: "New patient registration needed approval", type: "info", time: "5 min ago" },
                { message: "Emergency appointment requested", type: "urgent", time: "10 min ago" }
              ].map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'urgent' ? 'bg-red-500' : 
                    notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/receptionist/notifications">View All Notifications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Doctor Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Dr. Smith", specialty: "Cardiology", status: "available", nextFree: "11:30 AM" },
              { name: "Dr. Johnson", specialty: "Pediatrics", status: "busy", nextFree: "2:00 PM" },
              { name: "Dr. Brown", specialty: "Orthopedics", status: "available", nextFree: "Now" },
              { name: "Dr. Davis", specialty: "Dermatology", status: "break", nextFree: "1:00 PM" }
            ].map((doctor, index) => (
              <div key={index} className="p-3 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{doctor.name}</h4>
                  <span className={`w-2 h-2 rounded-full ${
                    doctor.status === 'available' ? 'bg-green-500' :
                    doctor.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{doctor.specialty}</p>
                <p className="text-xs text-gray-600">Next: {doctor.nextFree}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 