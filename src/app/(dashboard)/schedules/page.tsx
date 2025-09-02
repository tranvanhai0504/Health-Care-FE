"use client";
import React, { useEffect, useState, useTransition } from "react";
import { scheduleService } from "@/services/schedule.service";
import { ScheduleResponse, ScheduleStatus } from "@/types";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { cn } from "@/lib/utils";
import ScheduleDetailModal from "@/components/doctor/schedules/schedule-detail-modal";
import { getScheduleDate } from "@/utils/formatters";

// Extended interface for schedules with additional details
interface ScheduleWithDetails extends ScheduleResponse {
  serviceName?: string;
  packageName?: string;
}

// Helper function to get schedule date from schedule object
const getScheduleDateFromSchedule = (schedule: ScheduleResponse): Date => {
  return getScheduleDate(schedule.weekPeriod, schedule.dayOffset);
};

// Custom Badge component
const Badge = ({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "success"
    | "warning"
    | "error"
    | "secondary";
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "secondary":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "outline":
        return "bg-transparent border-gray-300 text-gray-700";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVariantStyles()} ${
        className || ""
      }`}
    >
      {children}
    </span>
  );
};

// Helper function to get time period description
const getTimePeriodDescription = (timeOffset: 0 | 1, t: (key: string) => string): string => {
  return timeOffset === 0
    ? t("dashboard.schedules.timePeriods.morning")
    : t("dashboard.schedules.timePeriods.afternoon");
};

const SchedulesPage = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const router = useRouter();

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);

        // Get all user schedules for the calendar view
        const response = await scheduleService.getUserSchedules();

        // Enhancement: Fetch service/package details for each schedule
        const schedulesWithDetails = await Promise.all(
          response.data.map(async (schedule) => {
            try {
              let packageName = undefined;

              // Only try to fetch package details if type is 'package' and packageInfo exists
              if (schedule.type === "package" && schedule.packageId) {
                const packageId =
                  typeof schedule.packageId === "string"
                    ? schedule.packageId
                    : schedule.packageId._id;

                if (packageId) {
                  const packageDetails =
                    await consultationPackageService.getById(packageId);
                  packageName = packageDetails.title;
                }
              }

              return {
                ...schedule,
                packageName,
              };
            } catch (err) {
              console.error(
                `Error fetching details for schedule ${schedule._id}:`,
                err
              );
              return schedule;
            }
          })
        );

        setSchedules(schedulesWithDetails);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    startTransition(() => {
      fetchSchedules();
    });
  }, []);

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.CONFIRMED:
        return <Badge variant="success">Confirmed</Badge>;
      case ScheduleStatus.CHECKEDIN:
        return <Badge variant="warning">Checked In</Badge>;
      case ScheduleStatus.SERVING:
        return <Badge variant="warning">In Progress</Badge>;
      case ScheduleStatus.CANCELLED:
        return <Badge variant="error">Cancelled</Badge>;
      case ScheduleStatus.COMPLETED:
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = getScheduleDateFromSchedule(schedule);
      return isSameDay(scheduleDate, date);
    });
  };

  // Get filtered schedules for sidebar
  const getFilteredSchedules = () => {
    let filtered = schedules;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.packageName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          schedule._id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (schedule) => schedule.status === statusFilter
      );
    }

    return filtered;
  };

  // Get schedules for selected date
  const selectedDateSchedules = getSchedulesForDate(selectedDate);

  // Modal handlers
  const handleViewSchedule = (schedule: ScheduleWithDetails) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };



  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-gray-50">
      {/* Main Calendar Area */}
      <div className="w-full md:flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-0 md:px-6 py-3 md:py-4">
          <div className="flex flex-col gap-2 lg:gap-0 lg:flex-row lg:items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t("dashboard.schedules.title")}</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {t("dashboard.schedules.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="outline" size="sm" onClick={goToToday}>
                {t("dashboard.schedules.today")}
              </Button>
              <Button size="sm" onClick={() => router.push("/booking")}>
                <Calendar className="h-4 w-4 mr-2" />
                {t("dashboard.schedules.newSchedule")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setShowSidebarMobile((s) => !s)}
              >
                {showSidebarMobile ? t("dashboard.schedules.hideDetails") : t("dashboard.schedules.dayDetails")}
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white border-b px-0 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="hidden md:flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-700 border border-green-400"></div>
                    <span>{t("dashboard.schedules.today")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border border-blue-300"></div>
                    <span>{t("dashboard.schedules.legend.oneToTwo")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border border-orange-300"></div>
                    <span>{t("dashboard.schedules.legend.threePlus")}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>
                {selectedDateSchedules.length} {selectedDateSchedules.length !== 1 ? t("dashboard.schedules.schedules") : t("dashboard.schedules.schedule")} {t("dashboard.schedules.on")}{" "}
                {format(selectedDate, "MMM d, yyyy")}
              </span>
              {selectedDateSchedules.length > 0 && (
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    selectedDateSchedules.length >= 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {selectedDateSchedules.length >= 5
                    ? t("dashboard.schedules.status.high")
                    : selectedDateSchedules.length >= 3
                    ? t("dashboard.schedules.status.busy")
                    : t("dashboard.schedules.status.normal")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white">
          <div className="py-4 md:p-6 overflow-x-auto md:overflow-visible">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 w-full md:min-w-0">
              {[t("dashboard.schedules.days.sun"), t("dashboard.schedules.days.mon"), t("dashboard.schedules.days.tue"), t("dashboard.schedules.days.wed"), t("dashboard.schedules.days.thu"), t("dashboard.schedules.days.fri"), t("dashboard.schedules.days.sat")].map((day) => (
                <div
                  key={day}
                  className="p-2 text-xs md:text-sm font-medium text-gray-500 text-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 w-full md:min-w-0">
              {calendarDays.map((day, dayIdx) => {
                const daySchedules = getSchedulesForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={dayIdx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "min-h-[70px] lg:min-h-[100px] p-2 border border-gray-100 text-left transition-all duration-200 relative group",
                      isSelected && "bg-blue-50 border-blue-200 shadow-sm",
                      !isCurrentMonth && "text-gray-300 bg-gray-50/50",
                      isToday &&
                        "bg-green-50 border-green-200 ring-1 ring-green-200",
                      daySchedules.length > 0 &&
                        isCurrentMonth &&
                        !isSelected &&
                        !isToday &&
                        "hover:bg-blue-25 hover:border-blue-150 hover:shadow-sm",
                      daySchedules.length === 0 &&
                        isCurrentMonth &&
                        "hover:bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs md:text-sm font-semibold mb-1 transition-colors duration-200",
                        isToday && "text-green-700",
                        isSelected && "text-blue-700",
                        !isToday &&
                          !isSelected &&
                          daySchedules.length > 0 &&
                          isCurrentMonth &&
                          "text-gray-900",
                        !isToday &&
                          !isSelected &&
                          daySchedules.length === 0 &&
                          isCurrentMonth &&
                          "text-gray-600"
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Schedule indicator badge */}
                    {daySchedules.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <div
                          className={cn(
                            "relative size-5 lg:size-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 transition-all duration-200 hover:scale-110",
                            isSelected
                              ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400 shadow-blue-200"
                              : isToday
                              ? "bg-gradient-to-br from-green-500 to-green-700 text-white border-green-400 shadow-green-200"
                              : daySchedules.length >= 3
                              ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-300 shadow-orange-200"
                              : "bg-gradient-to-br from-blue-400 to-blue-500 text-white border-blue-300 shadow-blue-100"
                          )}
                        >
                          <span className="relative z-10">
                            {daySchedules.length}
                          </span>
                          {/* Pulse animation for today */}
                          {isToday && (
                            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40"></div>
                          )}
                          {/* High schedule count indicator */}
                          {daySchedules.length >= 5 && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        className={cn(
          "bg-white border-l md:border-l flex flex-col",
          "w-full md:w-96",
          showSidebarMobile ? "flex" : "hidden md:flex"
        )}
      >
        {/* Sidebar Header */}
        <div className="border-b p-4">
          <h3 className="font-semibold text-lg mb-3">
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>

          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("dashboard.schedules.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("dashboard.schedules.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.schedules.status.all")}</SelectItem>
                <SelectItem value={ScheduleStatus.CONFIRMED}>
                  {t("dashboard.schedules.status.confirmed")}
                </SelectItem>
                <SelectItem value={ScheduleStatus.CHECKEDIN}>
                  {t("dashboard.schedules.status.checkedIn")}
                </SelectItem>
                <SelectItem value={ScheduleStatus.SERVING}>
                  {t("dashboard.schedules.status.inProgress")}
                </SelectItem>
                <SelectItem value={ScheduleStatus.CANCELLED}>
                  {t("dashboard.schedules.status.cancelled")}
                </SelectItem>
                <SelectItem value={ScheduleStatus.COMPLETED}>
                  {t("dashboard.schedules.status.completed")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Schedule List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : selectedDateSchedules.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">{t("dashboard.schedules.noSchedulesForDate")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/booking")}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {t("dashboard.schedules.addSchedule")}
                
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {getFilteredSchedules()
                .filter((schedule) =>
                  isSameDay(getScheduleDateFromSchedule(schedule), selectedDate)
                )
                .map((schedule) => (
                  <div
                    key={schedule._id}
                    className="hover:shadow-md transition-shadow cursor-pointer rounded-lg"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {schedule.packageName || t("dashboard.schedules.medicalConsultation")}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getTimePeriodDescription(schedule.timeOffset, t)}
                          </div>
                        </div>
                        {getStatusBadge(schedule.status)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          ID: {schedule._id?.slice(-6).toUpperCase()}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleViewSchedule(schedule)}
                          >
                            {t("dashboard.schedules.view")}
                          </Button>

                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-gray-500 mb-3">
            {t("dashboard.schedules.total")}: {getFilteredSchedules().length} {getFilteredSchedules().length !== 1 ? t("dashboard.schedules.schedules") : t("dashboard.schedules.schedule")}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/schedules")}
          >
            {t("dashboard.schedules.viewAllSchedules")}
          </Button>
          <div className="md:hidden mt-3">
            <Button variant="ghost" className="w-full" onClick={() => setShowSidebarMobile(false)}>
              {t("dashboard.schedules.close")}
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      <ScheduleDetailModal
        schedule={selectedSchedule}
        packageName={selectedSchedule?.packageName}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SchedulesPage;
