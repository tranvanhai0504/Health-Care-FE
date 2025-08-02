"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { scheduleService } from "@/services";
import { consultationServiceApi } from "@/services/consultationService.service";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { ScheduleResponse, ScheduleStatus } from "@/types/schedule";
import { ConsultationService } from "@/types/consultation";
import { ConsultationPackage } from "@/types/package";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Package,
  X,
  FileText,
  Stethoscope,
  Building2,
  Timer,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import { format } from "date-fns";

const getScheduleDate = (schedule: ScheduleResponse) => {
  if (!schedule.weekPeriod || !schedule.weekPeriod.from) return new Date();
  const base = new Date(schedule.weekPeriod.from);
  base.setDate(base.getDate() + (schedule.dayOffset || 0));
  return base;
};

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
      icon: Stethoscope,
    },
    [ScheduleStatus.SERVING]: {
      label: "In Progress",
      className:
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm animate-pulse",
      icon: Stethoscope,
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

const formatPrice = (price: number): string => {
  return (
    new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + "đ"
  );
};

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

export default function AdminScheduleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState<ConsultationService[]>(
    []
  );
  const [packageDetails, setPackageDetails] =
    useState<ConsultationPackage | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [packageLoading, setPackageLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    scheduleService
      .getById(id as string)
      .then((data) => setSchedule(data))
      .catch(() => setError("Failed to fetch schedule details."))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch service details if schedule has services
  useEffect(() => {
    if (!schedule || !schedule.services || schedule.services.length === 0) {
      setServiceDetails([]);
      return;
    }
    setServicesLoading(true);
    // Use ScheduleService type
    const serviceIds = schedule.services.map(
      (s: import("@/types/schedule").ScheduleService | string) =>
        typeof s === "string" ? s : s.service
    );
    consultationServiceApi
      .getByIds(serviceIds)
      .then((services) => setServiceDetails(services))
      .finally(() => setServicesLoading(false));
  }, [schedule]);

  // Fetch package details if type is package
  useEffect(() => {
    if (!schedule || schedule.type !== "package" || !schedule.packageId) {
      setPackageDetails(null);
      return;
    }
    setPackageLoading(true);
    const packageId =
      typeof schedule.packageId === "string"
        ? schedule.packageId
        : schedule.packageId._id;
    consultationPackageService
      .getById(packageId)
      .then((pkg) => setPackageDetails(pkg))
      .finally(() => setPackageLoading(false));
  }, [schedule]);

  if (loading) {
    return <div className="p-8 text-center">Loading schedule details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!schedule) {
    return <div className="p-8 text-center">No schedule found.</div>;
  }

  const scheduleDate = getScheduleDate(schedule);
  const totalPrice = schedule.payment?.totalPrice || 0;
  const totalPaid = schedule.payment?.totalPaid || 0;
  const remainingBalance = totalPrice - totalPaid;
  const isFullyPaid = remainingBalance <= 0;
  const fallbackTotalPrice =
    schedule.type === "services"
      ? serviceDetails.reduce((sum, s) => sum + s.price, 0)
      : packageDetails?.price || 0;
  const displayTotalPrice = totalPrice > 0 ? totalPrice : fallbackTotalPrice;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="capitalize">{schedule.type}</span>
              <span className="text-gray-400">•</span>
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {schedule._id?.slice(-6).toUpperCase()}
              </span>
              <span className="text-gray-400">•</span>
              {getStatusBadge(schedule.status)}
              {displayTotalPrice > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-gray-700 font-semibold">
                    <span>{formatPrice(displayTotalPrice)}</span>
                  </div>
                </>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Schedule Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">User</span>
              </div>
              <div className="ml-6">
                <div>Name: {schedule.userId?.name || "-"}</div>
                <div>Email: {schedule.userId?.email || "-"}</div>
                <div>Phone: {schedule.userId?.phoneNumber || "-"}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Date & Time</span>
              </div>
              <div className="ml-6">
                <div>Date: {format(scheduleDate, "MMM d, yyyy")}</div>
                <div>
                  Time Slot:{" "}
                  {schedule.timeOffset === 0
                    ? "Morning (7:30 - 11:30)"
                    : "Afternoon (13:30 - 17:30)"}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="font-medium">Payment</span>
              {displayTotalPrice > 0 && (
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
              )}
            </div>
            <div className="ml-6">
              <div>
                Total:{" "}
                {displayTotalPrice > 0 ? formatPrice(displayTotalPrice) : "-"}
              </div>
              <div>Paid: {totalPaid > 0 ? formatPrice(totalPaid) : "-"}</div>
              <div>
                Balance:{" "}
                {displayTotalPrice > 0 ? formatPrice(remainingBalance) : "-"}
              </div>
            </div>
          </div>

          {/* Services Details */}
          {schedule.services && schedule.services.length > 0 && (
            <div className="mb-6">
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
              {servicesLoading ? (
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
                  {schedule.services.map(
                    (
                      scheduleService:
                        | import("@/types/schedule").ScheduleService
                        | string,
                      index: number
                    ) => {
                      const serviceDetail = serviceDetails.find(
                        (s) =>
                          s._id ===
                          (typeof scheduleService === "string"
                            ? scheduleService
                            : scheduleService.service)
                      );
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border"
                        >
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
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
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
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* Package Details */}
          {schedule.type === "package" &&
            (packageDetails || packageLoading) && (
              <div className="mb-6">
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
                {packageLoading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-10 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-gray-900">
                      {packageDetails?.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {packageDetails?.description}
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* Important Notes */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">
                Important Notes
              </h3>
            </div>
            <div className="space-y-2 ml-6">
              {[
                { icon: Clock, text: "Arrive 15 minutes early" },
                { icon: User, text: "Bring ID and insurance card" },
                { icon: AlertCircle, text: "Fasting may be required" },
                { icon: Phone, text: "Call to reschedule/cancel" },
              ].map((note, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <note.icon className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">{note.text}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <X className="h-4 w-4 mr-2" /> Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
