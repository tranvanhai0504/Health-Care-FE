"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ShoppingCart,
  Package,
  Settings,
  Plus,
  Home,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { convertMarkdown } from "@/utils/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

// Services
import { consultationPackageService } from "@/services/consultationPackage.service";
import { consultationServiceApi } from "@/services";
import { ConsultationPackage, ConsultationService } from "@/types";
import { scheduleService } from "@/services/schedule.service";
import { Schedule, ScheduleStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";

// Components
import { PackageDetailsCard } from "@/components/booking/package-details-card";
import { ScheduleCard } from "@/components/booking/schedule-card";
import { BookingSteps } from "@/components/booking/booking-steps";
import { BookingConfirmationDialog } from "@/components/dialogs/booking-confirmation-dialog";
import { formatCurrency, formatDuration } from "@/utils";

// Service List Integration
import { useServiceListSafe } from "@/hooks/useServiceListSafe";
import { ServiceListDrawer } from "@/components/services-list/service-list-drawer";

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authenticateAction } = useAuth();
  const { t } = useTranslation();

  // Define time periods with translations
  const TIME_PERIODS = [
    {
      id: "morning",
      label: t("dashboard.booking.timePeriods.morning"),
      description: "08:00 - 12:00",
      start: "08:00",
      end: "12:00",
    },
    {
      id: "afternoon",
      label: t("dashboard.booking.timePeriods.afternoon"),
      description: "13:30 - 17:30",
      start: "13:30",
      end: "17:30",
    },
  ];

  // Get parameters from URL
  const packageId = searchParams.get("packageId");
  const serviceId = searchParams.get("serviceId");
  const bookingType =
    searchParams.get("type") ||
    (packageId ? "package" : serviceId ? "service" : "services");

  // Service List Integration
  const {
    items: serviceListItems,
    getTotalServices,
    getTotalPrice,
    toggleList,
    clearList,
  } = useServiceListSafe();

  // State variables
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(
    null
  );
  const [serviceData, setServiceData] = useState<ConsultationService | null>(
    null
  );
  const [servicesData, setServicesData] = useState<ConsultationService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<
    (typeof TIME_PERIODS)[0] | null
  >(null);
  const [selectedPriceOption, setSelectedPriceOption] = useState<string | null>(
    null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [description, setDescription] = useState<string>("");

  // Fetch data based on booking type
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (bookingType === "package" && packageId) {
          // Fetch package data
          const data = await consultationPackageService.getDetailById(
            packageId
          );
          setPackageData(data);
          const contentToConvert = data.content || data.description;
          setDescription(await convertMarkdown(contentToConvert));

          // Set default price option if available
          if (data.priceOptions && data.priceOptions.length > 0) {
            setSelectedPriceOption(
              data.priceOptions[0]._id || data.priceOptions[0].tier
            );
          }
        } else if (bookingType === "service" && serviceId) {
          // Fetch single service data
          const data = await consultationServiceApi.getById(serviceId);
          setServiceData(data);
          setDescription(await convertMarkdown(data.description));
        } else if (bookingType === "services" && serviceListItems.length > 0) {
          // Use services from the service list
          const services = serviceListItems.map((item) => item.service);
          setServicesData(services);

          // Create combined description
          const combinedDescription = services
            .map((s) => `**${s.name}**: ${s.description}`)
            .join("\n\n");
          setDescription(await convertMarkdown(combinedDescription));
        } else {
          setError(t("dashboard.booking.errors.noValidData"));
        }
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError(t("dashboard.booking.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [packageId, serviceId, bookingType, serviceListItems, t]);

  // Handle booking submission
  const processBooking = async () => {
    if (!selectedDate || !selectedTimePeriod) {
      toast.error(t("dashboard.booking.errors.selectDateTime"));
      return;
    }

    if (!user || !user._id) {
      toast.error(t("dashboard.booking.errors.userInfoNotAvailable"));
      return;
    }

    // Validate booking type specific requirements
    if (bookingType === "package") {
      if (!packageData) {
        toast.error(t("dashboard.booking.errors.packageDataNotAvailable"));
        return;
      }
      if (
        packageData.priceOptions &&
        packageData.priceOptions.length > 0 &&
        !selectedPriceOption
      ) {
        toast.error(t("dashboard.booking.errors.selectPackageOption"));
        return;
      }
    } else if (bookingType === "service") {
      if (!serviceData) {
        toast.error(t("dashboard.booking.errors.serviceDataNotAvailable"));
        return;
      }
    } else if (bookingType === "services") {
      if (servicesData.length === 0) {
        toast.error(t("dashboard.booking.errors.noServicesSelected"));
        return;
      }
    }

    setBookingInProgress(true);

    try {
      // Calculate week period and day offset (UTC-based)
      const weekPeriod = scheduleService.getWeekPeriod(selectedDate);
      const dayOffset = scheduleService.getDayOffset(selectedDate);
      const timeOffset = selectedTimePeriod.id === "morning" ? 0 : 1;

      // Create booking data based on type
      let bookingData: Partial<Schedule>;

      if (bookingType === "package") {
        // Validate price option if required
        if (packageData!.priceOptions && packageData!.priceOptions.length > 0) {
          const priceOption = packageData!.priceOptions.find(
            (option) =>
              option._id === selectedPriceOption ||
              option.tier === selectedPriceOption
          );
          if (!priceOption) {
            toast.error(t("dashboard.booking.errors.invalidPriceOption"));
            return;
          }
        }

        bookingData = {
          userId: user._id,
          weekPeriod: weekPeriod,
          dayOffset: dayOffset,
          timeOffset: timeOffset as 0 | 1,
          status: ScheduleStatus.CONFIRMED,
          type: "package",
          packageId: packageId!,
          services: [],
        };
      } else {
        // For both single service and multiple services
        const services =
          bookingType === "service" ? [serviceData!] : servicesData;

        bookingData = {
          userId: user._id,
          weekPeriod: weekPeriod,
          dayOffset: dayOffset,
          timeOffset: timeOffset as 0 | 1,
          status: ScheduleStatus.CONFIRMED,
          type: "services",
          services: services.map((service) => service._id),
        };
      }

      // Submit booking
      await scheduleService.create(bookingData);

      toast.success(t("dashboard.booking.success.bookingCreated"));
      setShowConfirmDialog(false);

      // Clear service list if booking services
      if (bookingType === "services") {
        clearList();
      }

      // Redirect to schedules page
      setTimeout(() => {
        router.push("/schedules");
      }, 1500);
    } catch (err) {
      console.error("Error creating booking:", err);
      toast.error(t("dashboard.booking.errors.bookingFailed"));
    } finally {
      setBookingInProgress(false);
    }
  };

  // Handle booking with authentication check
  const handleBooking = () => {
    authenticateAction(processBooking);
  };

  // Calculate total price based on booking type
  const getTotalBookingPrice = () => {
    if (bookingType === "package" && packageData) {
      return packageData.priceOptions && packageData.priceOptions.length > 0
        ? packageData.priceOptions.find(
            (option) =>
              option._id === selectedPriceOption ||
              option.tier === selectedPriceOption
          )?.price || 0
        : packageData.price;
    } else if (bookingType === "service" && serviceData) {
      return serviceData.price;
    } else if (bookingType === "services") {
      return getTotalPrice();
    }
    return 0;
  };

  const getBackText = () => {
    if (bookingType === "package") return t("dashboard.booking.backToPackages");
    if (bookingType === "service") return t("dashboard.booking.backToServices");
    return t("dashboard.booking.backToServices");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          {/* Error Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-primary/10 dark:bg-primary/90 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("dashboard.booking.error.title")}
            </h1>
            <div className="max-w-md mx-auto">
              <p className="text-lg text-muted-foreground mb-2">
                {t("dashboard.booking.error.description")}
              </p>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 border">
                {error}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("dashboard.booking.error.tryAgain")}
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              {t("dashboard.booking.error.goToHome")}
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              {t("dashboard.booking.error.goBack")}
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="mt-12 w-full max-w-2xl">
            <Separator className="mb-6" />
            <div className="text-center mb-4">
                              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("dashboard.booking.error.exploreServices")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.booking.error.browseServices")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push("/medical-services")}
              >
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-2">{t("dashboard.booking.error.medicalServices")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.booking.error.medicalServicesDesc")}
                  </p>
                  <div className="mt-3">
                    <span className="text-sm text-primary font-medium group-hover:underline">
                      {t("dashboard.booking.error.browseServicesLink")} →
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push("/health-packages")}
              >
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-2">{t("dashboard.booking.error.healthPackages")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.booking.error.healthPackagesDesc")}
                  </p>
                  <div className="mt-3">
                    <span className="text-sm text-primary font-medium group-hover:underline">
                      {t("dashboard.booking.error.browsePackagesLink")} →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md">
            <div className="text-center">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {t("dashboard.booking.error.needHelp")}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t("dashboard.booking.error.contactSupport")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Header with service list integration */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          {getBackText()}
        </button>

        {/* Service List Button */}
        {bookingType === "services" && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleList}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("dashboard.booking.services")} ({getTotalServices()})
            <Badge variant="secondary" className="ml-1">
              {formatCurrency(getTotalPrice())}
            </Badge>
          </Button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground/90">
          {t("dashboard.booking.title")}
        </h1>
        <p className="text-muted-foreground">
          {bookingType === "package" &&
            t("dashboard.booking.description.package")}
          {bookingType === "service" &&
            t("dashboard.booking.description.service")}
          {bookingType === "services" &&
            t("dashboard.booking.description.services")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details Card - Package, Service, or Services */}
        {bookingType === "package" && packageData ? (
          <PackageDetailsCard
            packageData={packageData}
            description={description}
            selectedPriceOption={selectedPriceOption}
            setSelectedPriceOption={setSelectedPriceOption}
            formatCurrency={formatCurrency}
          />
        ) : (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {bookingType === "service" ? (
                  <>
                    <Settings className="h-5 w-5 text-primary" />
                    {t("dashboard.booking.serviceDetails")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    {t("dashboard.booking.servicesSummary")}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingType === "service" && serviceData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {serviceData.name}
                    </h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: description }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dashboard.booking.duration")}:</span>
                      <span className="font-medium">
                        {formatDuration(serviceData.duration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dashboard.booking.price")}:</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(serviceData.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : bookingType === "services" && servicesData.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t("dashboard.booking.selectedServices")}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleList}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t("dashboard.booking.manage")}
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {servicesData.map((service) => (
                      <div
                        key={service._id}
                        className="border rounded-lg p-3 bg-muted/30"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">
                            {service.name}
                          </h4>
                          <span className="text-sm font-medium text-primary">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {service.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {t("dashboard.booking.duration")}: {formatDuration(service.duration)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("dashboard.booking.totalServices")}:
                      </span>
                      <span className="font-medium">{getTotalServices()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("dashboard.booking.totalPrice")}:
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("dashboard.booking.noBookingDetails")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule Booking */}
        <ScheduleCard
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTimeSlot={selectedTimePeriod}
          setSelectedTimeSlot={setSelectedTimePeriod}
          timeSlots={TIME_PERIODS}
          onContinue={() => setShowConfirmDialog(true)}
          onCancel={() => router.back()}
        />
      </div>

      {/* Booking Process Steps */}
      <BookingSteps />

      {/* Service List Drawer */}
      <ServiceListDrawer />

      {/* Confirmation Dialog */}
      <BookingConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        bookingType={bookingType as "package" | "service" | "services"}
        packageData={packageData || undefined}
        serviceData={serviceData || undefined}
        servicesData={servicesData.length > 0 ? servicesData : undefined}
        selectedPriceOption={selectedPriceOption}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimePeriod}
        totalPrice={getTotalBookingPrice()}
        formatCurrency={formatCurrency}
        onConfirm={handleBooking}
        onCancel={() => setShowConfirmDialog(false)}
        bookingInProgress={bookingInProgress}
        user={user as UserProfile | null}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
