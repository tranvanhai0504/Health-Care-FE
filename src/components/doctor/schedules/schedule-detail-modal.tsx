"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Package,
  Phone,
  FileText,
  Edit,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Activity,
  Stethoscope,
  Timer,
  CreditCard,
  DoorOpen,
} from "lucide-react";
import { format, isFuture } from "date-fns";
import {
  ScheduleResponse,
  ScheduleStatus,
  ConsultationService,
  ConsultationPackage,
  Room,
} from "@/types";
import { consultationServiceApi } from "@/services/consultationService.service";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { roomService } from "@/services/room.service";

interface ScheduleDetailModalProps {
  schedule: ScheduleResponse | null;
  packageName?: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (scheduleId: string) => void;
  onCancel?: (scheduleId: string) => void;
}

// Helper function to format schedule date from weekPeriod and dayOffset
const getScheduleDate = (schedule: ScheduleResponse): Date => {
  const startDate = new Date(schedule.weekPeriod.from);
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + schedule.dayOffset);
  return targetDate;
};

// Helper function to get status badge with enhanced styling
const getStatusBadge = (status: ScheduleStatus) => {
  const statusConfig = {
    [ScheduleStatus.CONFIRMED]: {
      label: "Confirmed",
      className:
        "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm",
      icon: CheckCircle,
    },
    [ScheduleStatus.CHECKEDIN]: {
      label: "Checked In",
      className:
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm",
      icon: Activity,
    },
    [ScheduleStatus.SERVING]: {
      label: "In Progress",
      className:
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm animate-pulse",
      icon: Activity,
    },
    [ScheduleStatus.CANCELLED]: {
      label: "Cancelled",
      className:
        "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm",
      icon: X,
    },
    [ScheduleStatus.COMPLETED]: {
      label: "Completed",
      className:
        "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-sm",
      icon: CheckCircle,
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className:
      "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm",
    icon: AlertCircle,
  };

  const IconComponent = config.icon;

  return (
    <Badge
      className={`${config.className} px-2 py-1 text-xs font-medium flex items-center gap-1`}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return (
    new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + "đ"
  );
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

type ServiceWithRoom = Omit<ConsultationService, 'room'> & {
  room: Room | undefined;
};

export default function ScheduleDetailModal({
  schedule,
  packageName,
  isOpen,
  onClose,
  onEdit,
  onCancel,
}: ScheduleDetailModalProps) {
  const [serviceDetails, setServiceDetails] = useState<ServiceWithRoom[]>(
    []
  );
  const [packageDetails, setPackageDetails] =
    useState<ConsultationPackage | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch service details when modal opens
  useEffect(() => {
    if (!schedule || !isOpen) {
      setServiceDetails([]);
      setPackageDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        if (schedule.services && schedule.services.length > 0) {
          // Extract service IDs from ScheduleService objects
          const serviceIds = schedule.services.map((s) =>
            typeof s === "string" ? s : s.service
          );

          // Fetch detailed service information
          const services = await consultationServiceApi.getByIds(serviceIds as string[]);

          const roomIds = services.map((s) => s.room).filter((r) => r !== undefined);
          const rooms = await roomService.getByIds(roomIds);

          const serviceWithRooms = services.map((s) => ({
            ...s,
            room: rooms.find((r) => r._id === s.room) || undefined,
          }));
          console.log(serviceWithRooms);
          setServiceDetails(serviceWithRooms);
        } else if (schedule.type === "package" && schedule.packageId) {
          // Fetch package details
          const packageId =
            typeof schedule.packageId === "string"
              ? schedule.packageId
              : schedule.packageId._id;

          if (packageId) {
            const packageData = await consultationPackageService.getById(
              packageId
            );
            setPackageDetails(packageData);
          }
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [schedule, isOpen]);

  if (!schedule) return null;

  const scheduleDate = getScheduleDate(schedule);
  const canEdit =
    isFuture(scheduleDate) &&
    (schedule.status === ScheduleStatus.CONFIRMED ||
      schedule.status === ScheduleStatus.CHECKEDIN);

  // Calculate payment status
  const totalPrice = schedule.payment?.totalPrice || 0;
  const totalPaid = schedule.payment?.totalPaid || 0;
  const remainingBalance = totalPrice - totalPaid;
  const isFullyPaid = remainingBalance <= 0;

  // Calculate fallback total price if payment.totalPrice is not available
  const calculateFallbackPrice = () => {
    if (schedule.type === "services" && serviceDetails.length > 0) {
      return serviceDetails.reduce((sum, service) => sum + service.price, 0);
    } else if (schedule.type === "package" && packageDetails) {
      return packageDetails.price || 0;
    }
    return 0;
  };

  const fallbackTotalPrice = calculateFallbackPrice();
  const displayTotalPrice = totalPrice > 0 ? totalPrice : fallbackTotalPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col bg-white">
        {/* Compact Fixed Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm p-4 pt-6 shadow-sm">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Schedule Details
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Package className="h-3 w-3 text-gray-500" />
                  {schedule.type === "package"
                    ? packageDetails?.title ||
                      packageName ||
                      "Package Consultation"
                    : "Medical Services"}
                  <span className="text-gray-400">•</span>
                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {schedule._id?.slice(-6).toUpperCase()}
                  </span>
                  {displayTotalPrice > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-gray-700 font-semibold">
                        <span>{formatPrice(displayTotalPrice)}</span>
                      </div>
                    </>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(schedule.status)}
                {!isFullyPaid && displayTotalPrice > 0 && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-2 py-1 text-xs">
                    Balance Due
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Schedule Information */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Schedule Information
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Date
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {format(scheduleDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(scheduleDate, "EEEE")}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Time
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {schedule.timeOffset === 0
                      ? "08:00 - 12:00"
                      : "13:30 - 17:30"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {schedule.timeOffset === 0 ? "Morning" : "Afternoon"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Location
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Medical Center
                  </p>
                  <p className="text-xs text-gray-500">Floor 2</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {displayTotalPrice > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <CreditCard className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Payment Information
                  </h3>
                  {schedule.payment ? (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        isFullyPaid
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {isFullyPaid ? "Fully Paid" : "Pending Payment"}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                    >
                      No Payment Data
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-600">
                        Total Cost
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(displayTotalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalPrice > 0
                        ? schedule.type === "package"
                          ? "Package Price"
                          : "Services Total"
                        : "Calculated from " +
                          (schedule.type === "package"
                            ? "package"
                            : "services")}
                    </p>
                  </div>

                  {schedule.payment ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-gray-600">
                            Amount Paid
                          </span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                          {formatPrice(totalPaid)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {schedule.payment.payments?.length || 0} payment
                          {(schedule.payment.payments?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle
                            className={`h-3 w-3 ${
                              isFullyPaid ? "text-green-600" : "text-orange-600"
                            }`}
                          />
                          <span className="text-xs font-medium text-gray-600">
                            Balance
                          </span>
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            isFullyPaid ? "text-green-700" : "text-orange-700"
                          }`}
                        >
                          {formatPrice(remainingBalance)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isFullyPaid ? "Paid in full" : "Outstanding"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">
                            Amount Paid
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-400">
                          No Data
                        </p>
                        <p className="text-xs text-gray-500">
                          Payment info unavailable
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          <span className="text-xs font-medium text-gray-600">
                            Status
                          </span>
                        </div>
                        <p className="text-lg font-bold text-orange-700">
                          Pending
                        </p>
                        <p className="text-xs text-gray-500">
                          Awaiting payment setup
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Services Details (for both types) */}
            {schedule.services && schedule.services.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {schedule.type === "package"
                      ? "Package Services"
                      : "Selected Services"}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {schedule.services.length} service
                    {schedule.services.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-16 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schedule.services.map((scheduleService, index) => {
                      const serviceDetail = serviceDetails.find(
                        (s) =>
                          s._id ===
                          (typeof scheduleService === "string"
                            ? scheduleService
                            : scheduleService.service)
                      );

                      return (
                        <div key={index} className="bg-white rounded-lg p-3">
                          <div className="flex items-start gap-x-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-start gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {serviceDetail?.name || "Service"}
                                </h4>
                                {typeof scheduleService === "object" &&
                                  scheduleService.status && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        scheduleService.status === "completed"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      }`}
                                    >
                                      {scheduleService.status}
                                    </Badge>
                                  )}
                              </div>
                              {serviceDetail && (
                                <>
                                  <p className="text-xs text-gray-600 mb-2">
                                    {serviceDetail.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      <span>
                                        {formatDuration(serviceDetail.duration)}
                                      </span>
                                    </div>
                                    {serviceDetail.specialization &&
                                      typeof serviceDetail.specialization ===
                                        "object" && (
                                        <div className="flex items-center gap-1">
                                          <Building2 className="h-3 w-3" />
                                          <span>
                                            {serviceDetail.specialization.name}
                                          </span>
                                        </div>
                                      )}
                                    {serviceDetail.room && (
                                      <div className="flex items-center gap-1">
                                        <DoorOpen className="h-3 w-3" />
                                        <span>
                                          {serviceDetail.room.name} (F{serviceDetail.room.roomFloor} - R{serviceDetail.room.roomNumber})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                            {serviceDetail && (
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-700">
                                  {formatPrice(serviceDetail.price)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Package Details (for package-type schedules) */}
            {schedule.type === "package" && (packageDetails || packageName) && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Package className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Package Details
                  </h3>
                  {packageDetails?.category && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      {packageDetails.category}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-gray-900">
                    {packageDetails?.title || packageName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {packageDetails?.description ||
                      "Comprehensive health package with multiple tests and consultations."}
                  </p>

                  {/* Remove fallback for features since features field is gone */}
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Important Notes
                </h3>
              </div>

              <div className="space-y-2">
                {[
                  {
                    icon: Clock,
                    text: "Arrive 15 minutes early",
                    color: "blue",
                  },
                  {
                    icon: User,
                    text: "Bring ID and insurance card",
                    color: "green",
                  },
                  {
                    icon: AlertCircle,
                    text: "Fasting may be required",
                    color: "orange",
                  },
                  {
                    icon: Phone,
                    text: "Call to reschedule/cancel",
                    color: "purple",
                  },
                ].map((note, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <note.icon className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">{note.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="border-t bg-white/90 backdrop-blur-sm p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              size="sm"
              className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
            >
              <X className="h-3 w-3 mr-1.5" />
              Close
            </Button>

            <div className="flex gap-2 flex-1">
              {canEdit && onEdit && (
                <Button
                  variant="default"
                  onClick={() => onEdit(schedule._id!)}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Edit className="h-3 w-3 mr-1.5" />
                  Reschedule
                </Button>
              )}

              {canEdit && onCancel && (
                <Button
                  variant="destructive"
                  onClick={() => onCancel(schedule._id!)}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <X className="h-3 w-3 mr-1.5" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
