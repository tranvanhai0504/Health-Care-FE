"use client";

import React, { useEffect, useState } from "react";
import { scheduleService, userService } from "@/services";
import { consultationServiceApi } from "@/services/consultationService.service";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { ScheduleResponse, ScheduleStatus } from "@/types/schedule";
import { ConsultationService } from "@/types/consultation";
import { ConsultationPackage } from "@/types/package";
import { User as UserType } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Calendar,
  User,
  Package,
  Stethoscope,
  CreditCard,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  Timer,
  Edit3,
  Save,
  Plus,
  Trash2,
  Receipt,
  CreditCard as PaymentIcon,
  Banknote,
  Wallet,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Play,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import SearchService from "@/components/dialogs/search-service";
import { useToast } from "@/hooks/useToast";

interface ScheduleDetailsProps {
  scheduleId: string;
  onClose: () => void;
}

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

export function ScheduleDetails({ scheduleId, onClose }: ScheduleDetailsProps) {
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

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<ScheduleResponse | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // Payment editing states
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    totalPrice: 0,
    totalPaid: 0,
    paymentMethod: "",
    paymentNotes: "",
  });

  // Collapsible states
  const [isServicesOpen, setIsServicesOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);

  // Search service dialog state
  const [isSearchServiceOpen, setIsSearchServiceOpen] = useState(false);

  // User data state
  const [userData, setUserData] = useState<UserType | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // Toast hook
  const { toast } = useToast();

  // Function to fetch user data
  const fetchUserData = async (userId: string) => {
    if (!userId) return;

    try {
      setUserLoading(true);
      const user = await userService.getUserById(userId);
      setUserData(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Don't show error toast for user data, just log it
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (!scheduleId) return;
    setLoading(true);
    setError(null);
    setUserData(null); // Reset user data

    scheduleService
      .getById(scheduleId)
      .then((data) => {
        setSchedule(data);
        setEditedSchedule(data);
        // Initialize payment form
        setPaymentForm({
          totalPrice: data.payment?.totalPrice || 0,
          totalPaid: data.payment?.totalPaid || 0,
          paymentMethod: "cash", // Default payment method
          paymentNotes: "", // Default notes
        });

        // Fetch user data if userId exists
        if (data.userId && typeof data.userId === 'string') {
          fetchUserData(data.userId);
        } else if (data.userId && typeof data.userId === 'object' && data.userId._id) {
          fetchUserData(data.userId._id);
        }
      })
      .catch(() => setError("Failed to fetch schedule details."))
      .finally(() => setLoading(false));
  }, [scheduleId]);

  // Editing functions
  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedSchedule({ ...schedule! });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedSchedule(schedule);
    setIsEditingPayment(false);
    if (schedule) {
      setPaymentForm({
        totalPrice: schedule.payment?.totalPrice || 0,
        totalPaid: schedule.payment?.totalPaid || 0,
        paymentMethod: "cash",
        paymentNotes: "",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editedSchedule) return;

    setSaving(true);
    try {
      // TODO: Implement save functionality
      // await scheduleService.update(scheduleId, editedSchedule);
      setSchedule(editedSchedule);
      setIsEditing(false);
      setIsEditingPayment(false);
      console.log("Saving changes:", editedSchedule, paymentForm);
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveService = (serviceIndex: number) => {
    if (!editedSchedule?.services) return;
    const updatedServices = editedSchedule.services.filter(
      (_, index) => index !== serviceIndex
    );
    setEditedSchedule({
      ...editedSchedule,
      services: updatedServices,
    });
  };

  const handleAddService = () => {
    setIsSearchServiceOpen(true);
  };

  const handleServicesSelected = (selectedServices: ConsultationService[]) => {
    if (!editedSchedule) return;

    // Convert selected services to schedule service format
    const newServices = selectedServices.map(service => ({
      service: service._id,
      status: 'pending' as const,
    }));

    // Replace all services with the newly selected ones
    setEditedSchedule({
      ...editedSchedule,
      services: newServices,
    });
  };

  // Get currently selected service IDs for the dialog
  const getCurrentlySelectedServiceIds = () => {
    if (!editedSchedule?.services) return [];
    return editedSchedule.services.map(s =>
      typeof s === 'string' ? s : s.service
    );
  };

  // Status change functions
  const handleStatusChange = async (newStatus: ScheduleStatus) => {
    if (!schedule?._id) return;

    try {
      await scheduleService.update(schedule._id, { status: newStatus });

      // Update local state
      const updatedSchedule = { ...schedule, status: newStatus };
      setSchedule(updatedSchedule);
      setEditedSchedule(updatedSchedule);

      toast({
        title: "Success",
        description: `Schedule status updated to ${newStatus.toLowerCase()}`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating schedule status:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        type: "error",
      });
    }
  };

  const handleCheckIn = () => handleStatusChange(ScheduleStatus.CHECKEDIN);
  const handleStartServing = () => handleStatusChange(ScheduleStatus.SERVING);
  const handleComplete = () => handleStatusChange(ScheduleStatus.COMPLETED);

  const handlePaymentFormChange = (field: string, value: string | number) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch service details if schedule has services
  useEffect(() => {
    if (!schedule || !schedule.services || schedule.services.length === 0) {
      setServiceDetails([]);
      return;
    }
    setServicesLoading(true);
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
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Schedule Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schedule details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Details
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Schedule</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Details
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Found</h3>
            <p className="text-gray-600">The schedule you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
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
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Schedule Details
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="capitalize">{schedule.type}</span>
          <span className="text-gray-400">•</span>
          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            {schedule._id?.slice(-6).toUpperCase()}
          </span>
          <span className="text-gray-400">•</span>
          {getStatusBadge(schedule.status)}
          {isEditing && (
            <>
              <span className="text-gray-400">•</span>
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                Editing Mode
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Information */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">User Information</span>
            {userLoading && (
              <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            )}
          </div>
          <div className="ml-6 space-y-1 text-sm">
            {userLoading ? (
              <div className="space-y-2">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-48"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-56"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-40"></div>
              </div>
            ) : userData ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{userData.name || "-"}</span>
                  {userData.role && (
                    <Badge variant="outline" className="text-xs">
                      {userData.role}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{userData.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>{userData.phoneNumber || "-"}</span>
                </div>
                {userData.address && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Address:</span>
                    <span className="flex-1">{userData.address}</span>
                  </div>
                )}
                {userData.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Date of Birth:</span>
                    <span>{new Date(userData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {userData.gender && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Gender:</span>
                    <span className="capitalize">{userData.gender}</span>
                  </div>
                )}
                {userData.occupation && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Occupation:</span>
                    <span>{userData.occupation}</span>
                  </div>
                )}
                {userData.createdAt && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Member Since:</span>
                    <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            ) : (
              // Fallback to schedule user data if detailed user fetch failed
              <>
                <div>Name: {schedule.userId?.name || "-"}</div>
                <div>Email: {schedule.userId?.email || "-"}</div>
                <div>Phone: {schedule.userId?.phoneNumber || "-"}</div>
              </>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Date & Time</span>
          </div>
          <div className="ml-6 space-y-1 text-sm">
            <div>Date: {format(scheduleDate, "MMM d, yyyy")}</div>
            <div>
              Time Slot:{" "}
              {schedule.timeOffset === 0
                ? "Morning (7:30 - 11:30)"
                : "Afternoon (13:30 - 17:30)"}
            </div>
          </div>
        </div>

        {/* Status Actions */}
        {schedule.status !== ScheduleStatus.COMPLETED && schedule.status !== ScheduleStatus.CANCELLED && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Status Actions</span>
            </div>
            <div className="ml-6 flex flex-wrap gap-2">
              {schedule.status === ScheduleStatus.CONFIRMED && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCheckIn}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Check In Patient
                </Button>
              )}
              {schedule.status === ScheduleStatus.CHECKEDIN && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartServing}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start Service
                </Button>
              )}
              {schedule.status === ScheduleStatus.SERVING && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleComplete}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Services Details */}
        {(schedule.services && schedule.services.length > 0) || isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <Stethoscope className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">
                  {schedule.type === "package"
                    ? "Package Services"
                    : "Selected Services"}
                </span>
                {schedule.services && schedule.services.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {schedule.services.length} service
                    {schedule.services.length !== 1 ? "s" : ""}
                  </Badge>
                )}
                {isServicesOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEditing}
                    disabled={schedule.status === ScheduleStatus.CONFIRMED}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleAddService}>
                      <Plus className="h-3 w-3 mr-1" />
                      {editedSchedule?.services && editedSchedule.services.length > 0
                        ? "Manage Services"
                        : "Add Services"
                      }
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEditing}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveChanges} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {isServicesOpen && (
              <div className="ml-6">
                {servicesLoading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-12 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                  {(schedule.services || []).map((scheduleService, index) => {
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
                        className="bg-gray-50 rounded-lg p-3 border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
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
                              {isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveService(index)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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
                  })}
                </div>
              )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">No services selected</span>
            </div>
          </div>
        )}

        {/* Package Details */}
        {schedule.type === "package" && (packageDetails || packageLoading) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Package Details</span>
              {packageDetails?.category && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  {packageDetails.category}
                </Badge>
              )}
            </div>
            <div className="ml-6">
              {packageLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse h-8 bg-gray-200 rounded"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {packageDetails?.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {packageDetails?.description}
                  </p>
                  {packageDetails?.price && (
                    <div className="text-sm font-bold text-gray-700">
                      {formatPrice(packageDetails.price)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
            >
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Payment Information</span>
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
              {isPaymentOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {!isEditingPayment && isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPayment(true)}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit Payment
              </Button>
            )}
          </div>
          {isPaymentOpen && (
            <div className="ml-6">
              {!isEditingPayment ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Amount:
                      </span>
                      <span className="font-semibold">
                        {displayTotalPrice > 0
                          ? formatPrice(displayTotalPrice)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Amount Paid:
                      </span>
                      <span className="font-semibold text-green-600">
                        {totalPaid > 0 ? formatPrice(totalPaid) : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Balance:</span>
                      <span
                        className={`font-semibold ${
                          remainingBalance > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {displayTotalPrice > 0
                          ? formatPrice(remainingBalance)
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Payment Method:
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {paymentForm.paymentMethod || "Not specified"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Payments:</span>
                      <span className="text-xs">
                        {schedule.payment?.payments?.length || 0} transaction(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Total Amount
                    </label>
                    <Input
                      type="number"
                      value={paymentForm.totalPrice}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "totalPrice",
                          Number(e.target.value)
                        )
                      }
                      placeholder="Enter total amount"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Amount Paid
                    </label>
                    <Input
                      type="number"
                      value={paymentForm.totalPaid}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "totalPaid",
                          Number(e.target.value)
                        )
                      }
                      placeholder="Enter paid amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Payment Method
                  </label>
                  <Select
                    value={paymentForm.paymentMethod}
                    onValueChange={(value) =>
                      handlePaymentFormChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <PaymentIcon className="h-4 w-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="digital_wallet">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Digital Wallet
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Payment Notes
                  </label>
                  <Textarea
                    value={paymentForm.paymentNotes}
                    onChange={(e) =>
                      handlePaymentFormChange("paymentNotes", e.target.value)
                    }
                    placeholder="Add payment notes or instructions..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPayment(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // TODO: Implement payment update
                      setIsEditingPayment(false);
                      console.log("Updating payment:", paymentForm);
                    }}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Search Service Dialog */}
      <SearchService
        isOpen={isSearchServiceOpen}
        onOpenChange={setIsSearchServiceOpen}
        onApply={handleServicesSelected}
        multiple={true}
        initialSelectedIds={getCurrentlySelectedServiceIds()}
      />
    </div>
  );
}
