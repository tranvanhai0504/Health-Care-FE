"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  scheduleService,
  userService,
  paymentService,
  roomService,
} from "@/services";
import { consultationServiceApi } from "@/services/consultationService.service";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { ScheduleResponse, ScheduleResponseGetSingle, ScheduleStatus } from "@/types/schedule";
import { ConsultationService } from "@/types/consultation";
import { ConsultationPackage } from "@/types/package";
import { User as UserType } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";
import { generatePaymentQrHtml } from "@/utils/paymentQrTemplate";

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
  Wallet,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Play,
  CheckCircle2,
  Loader2,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import SearchService from "@/components/dialogs/search-service";
import { useToast } from "@/hooks/useToast";
import { Room } from "@/types/room";

interface ScheduleDetailsProps {
  scheduleId: string;
  onClose: () => void;
  refetch: () => Promise<void>;
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

type PaymentAggregate = {
  totalPrice: number;
  totalPaid: number;
  paymentsCount: number;
};

type PaymentListItem = {
  _id: string;
  service?: string;
  amount?: number;
  method?: string;
  status?: string;
};

const getPaymentAggregate = (sch: ScheduleResponse): PaymentAggregate => {
  const candidate: unknown = (
    sch as unknown as {
      payments?: {
        totalPrice?: number;
        totalPaid?: number;
        payments?: unknown[];
      };
    }
  ).payments;
  if (candidate && typeof candidate === "object") {
    const agg = candidate as {
      totalPrice?: number;
      totalPaid?: number;
      payments?: unknown[];
    };
    return {
      totalPrice: typeof agg.totalPrice === "number" ? agg.totalPrice : 0,
      totalPaid: typeof agg.totalPaid === "number" ? agg.totalPaid : 0,
      paymentsCount: Array.isArray(agg.payments) ? agg.payments.length : 0,
    };
  }
  const legacy = sch.payment as unknown as
    | { totalPrice?: number; totalPaid?: number; payments?: unknown[] }
    | undefined;
  return {
    totalPrice:
      legacy && typeof legacy.totalPrice === "number" ? legacy.totalPrice : 0,
    totalPaid:
      legacy && typeof legacy.totalPaid === "number" ? legacy.totalPaid : 0,
    paymentsCount:
      legacy && Array.isArray(legacy.payments) ? legacy.payments.length : 0,
  };
};

const getPaymentsFromSchedule = (sch: ScheduleResponse): PaymentListItem[] => {
  const candidate: unknown = (
    sch as unknown as { payments?: { payments?: unknown[] } }
  ).payments;
  const arr: unknown[] =
    candidate &&
    typeof candidate === "object" &&
    Array.isArray((candidate as { payments?: unknown[] }).payments)
      ? ((candidate as { payments?: unknown[] }).payments as unknown[])
      : [];
  return arr
    .map((item) => {
      if (typeof item === "string") {
        return { _id: item } as PaymentListItem;
      }
      if (item && typeof item === "object") {
        const obj = item as {
          _id?: string;
          service?: string | { _id?: string };
          amount?: number;
          method?: string;
          status?: string;
        };
        const id = obj._id ? String(obj._id) : "";
        const serviceId =
          typeof obj.service === "string"
            ? obj.service
            : obj.service && typeof obj.service === "object"
            ? obj.service._id
            : undefined;
        return {
          _id: id,
          service: serviceId,
          amount: typeof obj.amount === "number" ? obj.amount : undefined,
          method: typeof obj.method === "string" ? obj.method : undefined,
          status: typeof obj.status === "string" ? obj.status : undefined,
        } as PaymentListItem;
      }
      return null;
    })
    .filter(
      (x): x is PaymentListItem =>
        !!x && typeof x._id === "string" && x._id.length > 0
    );
};

// Duplicate definitions cleanup

export function ScheduleDetails({
  scheduleId,
  onClose,
  refetch,
}: ScheduleDetailsProps) {
  const {
    data: schedule,
    error: fetchError,
    isLoading: loading,
    mutate: mutateSchedule,
  } = useSWR(
    scheduleId ? `schedule/${scheduleId}` : null,
    () => scheduleService.getById(scheduleId!),
    {
      refreshInterval: 5000, // Refresh every 5 seconds to get payment status updates
    }
  );

  const [serviceDetails, setServiceDetails] = useState<ConsultationService[]>(
    []
  );
  const [packageDetails, setPackageDetails] =
    useState<ConsultationPackage | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [packageLoading, setPackageLoading] = useState(false);
  const [updatingPaymentIds, setUpdatingPaymentIds] = useState<Set<string>>(
    new Set()
  );

  const [updatingPaymentMethod, setUpdatingPaymentMethod] = useState(false);
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<ScheduleResponseGetSingle | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // Payment editing states
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    totalPrice: 0,
    totalPaid: 0,
    paymentMethod: "cash",
    paymentNotes: "",
  });

  const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
  // Collapsible states
  const [isServicesOpen, setIsServicesOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);

  // Search service dialog state
  const [isSearchServiceOpen, setIsSearchServiceOpen] = useState(false);

  // User data state
  const [userData, setUserData] = useState<UserType | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  const [roomDetails, setRoomDetails] = useState<Room[]>([]);

  // Toast hook
  const {
    totalPaid,
    remainingBalance,
    paymentsCount,
    displayTotalPrice,
    isFullyPaid,
  } = useMemo(() => {
    if (!schedule) {
      return {
        totalPrice: 0,
        totalPaid: 0,
        remainingBalance: 0,
        paymentsCount: 0,
        displayTotalPrice: 0,
        isFullyPaid: false,
      };
    }
    const { totalPrice, totalPaid, paymentsCount } =
      getPaymentAggregate(schedule);
    const fallbackTotalPrice =
      schedule.type === "services"
        ? serviceDetails.reduce((sum, s) => sum + s.price, 0)
        : packageDetails?.price || 0;
    const displayTotalPrice = totalPrice > 0 ? totalPrice : fallbackTotalPrice;
    const remainingBalance = displayTotalPrice - totalPaid;
    const isFullyPaid = remainingBalance <= 0;
    return {
      totalPrice,
      totalPaid,
      remainingBalance,
      paymentsCount,
      displayTotalPrice,
      isFullyPaid,
    };
  }, [schedule, serviceDetails, packageDetails]);
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
    if (schedule) {
      setEditedSchedule(schedule);
      const initAgg = getPaymentAggregate(schedule);
      setPaymentForm({
        totalPrice: initAgg.totalPrice,
        totalPaid: initAgg.totalPaid,
        paymentMethod: "cash",
        paymentNotes: "",
      });

      if (schedule.userId && typeof schedule.userId === "string") {
        fetchUserData(schedule.userId);
      } else if (
        schedule.userId &&
        typeof schedule.userId === "object" &&
        schedule.userId._id
      ) {
        fetchUserData(schedule.userId._id);
      }
    }
  }, [schedule]);

  // Editing functions
  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedSchedule({ ...schedule! });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedSchedule(schedule!);
    setIsEditingPayment(false);
    if (schedule) {
      const agg = getPaymentAggregate(schedule);
      setPaymentForm({
        totalPrice: agg.totalPrice,
        totalPaid: agg.totalPaid,
        paymentMethod: "cash",
        paymentNotes: "",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editedSchedule) return;

    setSaving(true);
    try {
      const serviceIds =
        editedSchedule.services?.map((s) => {
          if (typeof s.service === "string") return s.service;
          return s.service._id;
        }) || [];

      const updatePayload = {
        ...editedSchedule,
        services: serviceIds,
        payment: {
          totalPrice: paymentForm.totalPrice,
          totalPaid: paymentForm.totalPaid,
          paymentMethod: paymentForm.paymentMethod,
          paymentNotes: paymentForm.paymentNotes,
        },
      };

      await scheduleService.update(scheduleId, updatePayload);
      await mutateSchedule(); // Re-fetch data to confirm changes

      setIsEditing(false);
      setIsEditingPayment(false);
      toast({
        title: "Success",
        description: "Schedule updated successfully.",
        type: "success",
      });
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
    const newServices = selectedServices.map((service) => ({
      _id: service._id,
      service: service,
      status: "pending" as const,
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
    return editedSchedule.services.map((s) =>
      typeof s === "string" ? s : (s.service as ConsultationService)._id
    );
  };

  // Status change functions
  const handleStatusChange = async (newStatus: ScheduleStatus) => {
    if (!schedule?._id) return;

    try {
      await scheduleService.update(schedule._id, { status: newStatus });

      // Optimistic update
      mutateSchedule(
        { ...schedule, status: newStatus } as ScheduleResponseGetSingle,
        false
      );
      setEditedSchedule({ ...schedule, status: newStatus } as ScheduleResponseGetSingle);

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

  const handleCheckIn = async () => {
    await handleStatusChange(ScheduleStatus.CHECKEDIN);
    await refetch();
  };

  const handleStartServing = async () => {
    await handleStatusChange(ScheduleStatus.SERVING);
    await refetch();
  };

  const handleComplete = async () => {
    await handleStatusChange(ScheduleStatus.COMPLETED);
    await refetch();
  };

  const handlePaymentFormChange = (field: string, value: string | number) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentMethodChange = async (newMethod: string) => {
    if (!schedule) return;
    const paymentIds = getPaymentsFromSchedule(schedule).map((p) => p._id);
    if (paymentIds.length === 0) {
      handlePaymentFormChange("paymentMethod", newMethod);
      return;
    }

    setUpdatingPaymentMethod(true);
    try {
      await paymentService.updatePaymentMethodByIds({
        paymentIds,
        method: newMethod,
      });
      await mutateSchedule(); // Re-fetch from server
      const refreshed = await scheduleService.getById(scheduleId);
      setEditedSchedule(refreshed);
      handlePaymentFormChange("paymentMethod", newMethod);
      toast({
        title: "Success",
        description: `Payment method updated to ${newMethod}`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        type: "error",
      });
    } finally {
      setUpdatingPaymentMethod(false);
    }
  };

  const handlePayWithCard = async () => {
    if (!schedule || !schedule._id || remainingBalance <= 0) return;

    setIsProcessingCardPayment(true);
    try {
      const paymentIds = getPaymentsFromSchedule(schedule)
        .filter((p) => p.status !== "paid")
        .map((p) => p._id);

      const paymentData = {
        amount: remainingBalance,
        orderId: schedule._id,
        orderInfo: `Payment for schedule ${schedule._id}`,
        paymentIds: paymentIds,
      };

      // Get the payment URL from the service (same as old logic)
      const response = await paymentService.createVNPayPayment(paymentData);
      if (!response.paymentUrl) {
        toast({
          title: "Error",
          description: "Could not get payment URL. Please try again.",
          type: "error",
        });
        return;
      }

      // Generate QR code with the payment URL
      const qrCodeDataURL = await QRCode.toDataURL(response.paymentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // Generate HTML content using template
      const htmlContent = generatePaymentQrHtml({
        scheduleId: schedule._id.slice(-6).toUpperCase(),
        amount: formatPrice(remainingBalance),
        orderInfo: paymentData.orderInfo,
        qrCodeDataUrl: qrCodeDataURL,
      });

      // Open new window with QR code
      const newWindow = window.open(
        "",
        "_blank",
        "width=500,height=700,scrollbars=yes,resizable=yes"
      );
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();

        toast({
          title: "QR Code Generated",
          description: "Bank transfer QR code opened in new window",
          type: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            "Could not open new window. Please check your popup blocker.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        type: "error",
      });
    } finally {
      setIsProcessingCardPayment(false);
    }
  };

  // Fetch service details if schedule has services
  useEffect(() => {
    if (!schedule || !schedule.services || schedule.services.length === 0) {
      setServiceDetails([]);
      return;
    }
    setServicesLoading(true);

    setServiceDetails(
      schedule.services.map((s) => s.service as ConsultationService)
    );

    const roomIds = schedule.services
      .map((s) => s.service.room)
      .filter((r): r is string => r !== undefined)
      .filter((r, i, arr) => arr.indexOf(r) === i);

    roomService.getByIds(roomIds).then((rooms) => {
      setRoomDetails(rooms);
    });

    setServicesLoading(false);
  }, [schedule]);

  console.log(roomDetails);

  // Ensure we have service details for any services referenced by payments as well
  useEffect(() => {
    if (!schedule) return;
    const payments = getPaymentsFromSchedule(schedule);
    const neededIds = Array.from(
      new Set(
        payments
          .map((p) => p.service)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );
    const existingIds = new Set(serviceDetails.map((s) => s._id));
    const missingIds = neededIds.filter((id) => !existingIds.has(id));
    if (missingIds.length === 0) return;
    consultationServiceApi.getByIds(missingIds).then((extras) => {
      if (!extras || extras.length === 0) return;
      // Merge uniquely by _id
      const byId = new Map<string, ConsultationService>();
      [...serviceDetails, ...extras].forEach((s) => byId.set(s._id, s));
      setServiceDetails(Array.from(byId.values()));
    });
  }, [schedule, serviceDetails]);

  const serviceById = useMemo(() => {
    const map = new Map<string, ConsultationService>();
    serviceDetails.forEach((s) => map.set(s._id, s));
    return map;
  }, [serviceDetails]);

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
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schedule details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Schedule
            </h3>
            <p className="text-red-600">{fetchError.message}</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Schedule Found
            </h3>
            <p className="text-gray-600">
              The schedule you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const scheduleDate = getScheduleDate(schedule);

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
                    <span>
                      {new Date(userData.dateOfBirth).toLocaleDateString()}
                    </span>
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
                    <span>
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
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
            <div>Day: {format(scheduleDate, "EEEE")}</div>
            <div>
              Time Slot:{" "}
              {schedule.timeOffset === 0
                ? "Morning (7:30 - 11:30)"
                : "Afternoon (13:30 - 17:30)"}
            </div>
          </div>
        </div>

        {/* Status Actions */}
        {schedule.status !== ScheduleStatus.COMPLETED &&
          schedule.status !== ScheduleStatus.CANCELLED && (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddService}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {editedSchedule?.services &&
                      editedSchedule.services.length > 0
                        ? "Manage Services"
                        : "Add Services"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEditing}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={saving}
                    >
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
                    {((isEditing ? editedSchedule?.services : schedule?.services) || []).map((scheduleService, index) => {
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 border"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {scheduleService.service.name || "Service"}
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
                              {scheduleService.service && (
                                <>
                                  <p className="text-xs text-gray-600 mb-2">
                                    {scheduleService.service.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      <span>
                                        {formatDuration(
                                          scheduleService.service.duration
                                        )}
                                      </span>
                                    </div>
                                    {scheduleService.service.room && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>
                                          {
                                            roomDetails.find(
                                              (r) =>
                                                r._id ===
                                                scheduleService.service.room
                                            )?.name
                                          }
                                        </span>
                                      </div>
                                    )}
                                    {scheduleService.service.specialization &&
                                      typeof scheduleService.service
                                        .specialization === "object" && (
                                        <div className="flex items-center gap-1">
                                          <Building2 className="h-3 w-3" />
                                          <span>
                                            {
                                              scheduleService.service
                                                .specialization.name
                                            }
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </>
                              )}
                            </div>
                            {scheduleService.service && (
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-700">
                                  {formatPrice(scheduleService.service.price)}
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
          </div>
          {isPaymentOpen && (
            <div className="ml-6">
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
                      <Select
                        value={paymentForm.paymentMethod || ""}
                        defaultValue={paymentForm.paymentMethod || ""}
                        onValueChange={handlePaymentMethodChange}
                        disabled={
                          isEditingPayment ||
                          updatingPaymentMethod ||
                          paymentForm.totalPaid === paymentForm.totalPrice
                        }
                      >
                        <SelectTrigger className="inline-flex h-auto p-1 border-none text-xs text-gray-500 bg-gray-100 rounded-sm w-fit">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">
                            Bank Transfer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingPaymentMethod && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Payments:</span>
                      <span className="text-xs">
                        {paymentsCount} transaction(s)
                      </span>
                    </div>
                    {/* Payment actions moved below to be full width */}
                  </div>
                </div>
                {/* Full-width payment actions */}
                {paymentForm.paymentMethod === "cash" && (
                  <div className="mt-3 border rounded-lg overflow-hidden w-full">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                      Confirm payments
                    </div>
                    <div className="divide-y">
                      {getPaymentsFromSchedule(schedule).map((p) => {
                        const s = p.service
                          ? serviceById.get(p.service)
                          : undefined;
                        const label =
                          s?.name ||
                          (p.service
                            ? `Service ${p.service.slice(-6)}`
                            : `Payment ${p._id.slice(-6)}`);
                        const disabled =
                          p.status === "paid" || updatingPaymentIds.has(p._id);
                        return (
                          <div
                            key={p._id}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {label}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <span>
                                  {p.amount ? formatPrice(p.amount) : "-"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xxs ${
                                  p.status === "paid"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                {p.status || "pending"}
                              </Badge>
                              <Button
                                size="sm"
                                variant={
                                  p.status === "paid" ? "outline" : "default"
                                }
                                disabled={disabled}
                                className={
                                  p.status === "paid"
                                    ? "text-gray-500"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }
                                onClick={async () => {
                                  try {
                                    setUpdatingPaymentIds((prev) =>
                                      new Set(prev).add(p._id)
                                    );
                                    await paymentService.updateStatus(p._id, {
                                      status: "paid",
                                    });
                                    await mutateSchedule(); // Re-fetch from server
                                    const refreshed =
                                      await scheduleService.getById(scheduleId);
                                    setEditedSchedule(refreshed);
                                    toast({
                                      title: "Payment updated",
                                      description: `${label} marked as paid`,
                                      type: "success",
                                    });
                                  } catch (err) {
                                    console.error(
                                      "Failed to update payment status",
                                      err
                                    );
                                    toast({
                                      title: "Error",
                                      description:
                                        "Failed to mark payment as paid",
                                      type: "error",
                                    });
                                  } finally {
                                    setUpdatingPaymentIds((prev) => {
                                      const clone = new Set(prev);
                                      clone.delete(p._id);
                                      return clone;
                                    });
                                  }
                                }}
                              >
                                {updatingPaymentIds.has(p._id) ? (
                                  <Loader2 className="animate-spin h-3 w-3" />
                                ) : p.status === "paid" ? (
                                  "Paid"
                                ) : (
                                  "Mark paid"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {getPaymentsFromSchedule(schedule).some(
                      (p) => p.status !== "paid"
                    ) && (
                      <div className="bg-gray-50 px-3 py-2 text-right">
                        <Button
                          size="sm"
                          disabled={Array.from(updatingPaymentIds).length > 0}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={async () => {
                            try {
                              const pending = getPaymentsFromSchedule(
                                schedule
                              ).filter((p) => p.status !== "paid");
                              setUpdatingPaymentIds(
                                new Set(pending.map((p) => p._id))
                              );
                              await Promise.all(
                                pending.map((p) =>
                                  paymentService.updateStatus(p._id, {
                                    status: "paid",
                                  })
                                )
                              );
                              await mutateSchedule(); // Re-fetch from server
                              const refreshed = await scheduleService.getById(
                                scheduleId
                              );
                              setEditedSchedule(refreshed);
                              toast({
                                title: "Payments updated",
                                description: `Marked ${pending.length} payment(s) as paid`,
                                type: "success",
                              });
                            } catch (err) {
                              console.error(
                                "Failed to update all payments",
                                err
                              );
                              toast({
                                title: "Error",
                                description:
                                  "Failed to mark all payments as paid",
                                type: "error",
                              });
                            } finally {
                              setUpdatingPaymentIds(new Set());
                            }
                          }}
                        >
                          Mark all as paid
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {paymentForm.paymentMethod === "bank_transfer" &&
                  !isFullyPaid && (
                    <div className="mt-4">
                      <Button
                        onClick={handlePayWithCard}
                        disabled={isProcessingCardPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isProcessingCardPayment ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Pay {formatPrice(remainingBalance)} via Bank Transfer
                      </Button>
                    </div>
                  )}
              </div>
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
