"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  Calendar, 
  Users, 

  PillIcon, 
  Stethoscope, 
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  todayAppointments: number;
  pendingPrescriptions: number;
  totalPatients: number;
  completedExaminations: number;
}

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingPrescriptions: 0,
    totalPatients: 0,
    completedExaminations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual data from API
    const fetchDashboardData = async () => {
      try {
        // Simulated data - replace with actual API calls
        setStats({
          todayAppointments: 8,
          pendingPrescriptions: 3,
          totalPatients: 156,
          completedExaminations: 42
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
      title: t("doctor.dashboard.quickActions.viewSchedule"),
      description: t("doctor.dashboard.quickActions.viewScheduleDesc"),
      href: "/doctor/schedules",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: t("doctor.dashboard.quickActions.createPrescription"),
      description: t("doctor.dashboard.quickActions.createPrescriptionDesc"),
      href: "/doctor/prescriptions/create",
      icon: <PillIcon className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: t("doctor.dashboard.quickActions.medicalExamination"),
      description: t("doctor.dashboard.quickActions.medicalExaminationDesc"),
      href: "/doctor/examinations/create",
      icon: <Stethoscope className="h-6 w-6" />,
      color: "bg-purple-500"
    },
    {
      title: t("doctor.dashboard.quickActions.patientRecords"),
      description: t("doctor.dashboard.quickActions.patientRecordsDesc"),
      href: "/doctor/patients",
      icon: <Users className="h-6 w-6" />,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("doctor.dashboard.title")}</h1>
        <p className="text-gray-600 mt-2">{t("doctor.dashboard.subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("doctor.dashboard.stats.todayAppointments")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> {t("doctor.dashboard.stats.fromYesterday")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("doctor.dashboard.stats.pendingPrescriptions")}</CardTitle>
            <PillIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              {t("doctor.dashboard.stats.requireAttention")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("doctor.dashboard.stats.totalPatients")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> {t("doctor.dashboard.stats.thisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("doctor.dashboard.stats.examinations")}</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.completedExaminations}</div>
            <p className="text-xs text-muted-foreground">
              {t("doctor.dashboard.stats.thisMonth")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("doctor.dashboard.quickActions.title")}
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("doctor.dashboard.recentAppointments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { patient: t("doctor.dashboard.samplePatients.johnDoe"), time: "10:00 AM", status: "completed" },
                { patient: t("doctor.dashboard.samplePatients.janeSmith"), time: "11:30 AM", status: "in-progress" },
                { patient: t("doctor.dashboard.samplePatients.robertJohnson"), time: "2:00 PM", status: "upcoming" }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">{appointment.patient}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/doctor/schedules">{t("doctor.dashboard.viewAllAppointments")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("doctor.dashboard.urgentTasks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: t("doctor.dashboard.sampleTasks.reviewLabResults"), priority: "high" },
                { task: t("doctor.dashboard.sampleTasks.completePrescription"), priority: "medium" },
                { task: t("doctor.dashboard.sampleTasks.followUpSurgery"), priority: "high" }
              ].map((task, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{task.task}</p>
                    <p className="text-xs text-gray-500 capitalize">{task.priority} {t("doctor.dashboard.priority")}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/doctor/tasks">{t("doctor.dashboard.viewAllTasks")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 