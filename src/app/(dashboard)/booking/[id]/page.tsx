"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { convertMarkdown } from "@/utils/markdown";
import { Button } from "@/components/ui/button";

// Services
import {
  consultationPackageService,
  ConsultationPackage,
} from "@/services/consultationPackage";
import { scheduleService, CreateScheduleData } from "@/services/schedule";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/services/auth";

// Components
import { PackageDetailsCard } from "@/components/booking/package-details-card";
import { AppointmentCard } from "@/components/booking/appointment-card";
import { BookingSteps } from "@/components/booking/booking-steps";
import { BookingConfirmationDialog } from "@/components/dialogs/booking-confirmation-dialog";

// Define available time slots
const TIME_SLOTS = [
  { start: "08:00", end: "09:00" },
  { start: "09:30", end: "10:30" },
  { start: "11:00", end: "12:00" },
  { start: "13:30", end: "14:30" },
  { start: "15:00", end: "16:00" },
  { start: "16:30", end: "17:30" },
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;
  const { user, authenticateAction } = useAuth();

  // State variables
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    (typeof TIME_SLOTS)[0] | null
  >(null);
  const [selectedPriceOption, setSelectedPriceOption] = useState<string | null>(
    null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [description, setDescription] = useState<string>("");

  // Fetch package data
  useEffect(() => {
    async function fetchPackageData() {
      setLoading(true);
      try {
        const data = await consultationPackageService.getDetailById(packageId);
        setPackageData(data);
        // Use content if available, otherwise use description
        const contentToConvert = data.content || data.description;
        setDescription(await convertMarkdown(contentToConvert));

        // Set default price option if available
        if (data.priceOptions && data.priceOptions.length > 0) {
          setSelectedPriceOption(
            data.priceOptions[0]._id || data.priceOptions[0].tier
          );
        }
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("Failed to load package details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (packageId) {
      fetchPackageData();
    }
  }, [packageId]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Handle booking submission
  const processBooking = async () => {
    if (!packageData || !selectedDate || !selectedTimeSlot) {
      toast.error("Please select date and time for your appointment");
      return;
    }

    // Check if price option is required (when priceOptions exist)
    if (packageData.priceOptions && packageData.priceOptions.length > 0 && !selectedPriceOption) {
      toast.error("Please select a package option for your appointment");
      return;
    }

    if (!user || !user._id) {
      toast.error("User information not available");
      return;
    }

    setBookingInProgress(true);

    try {
      // Handle price options if they exist, otherwise use package price
      let packagePeriodId = selectedPriceOption;

      if (packageData.priceOptions && packageData.priceOptions.length > 0) {
        // Get the selected price option object
        const priceOption = packageData.priceOptions.find(
          (option) =>
            option._id === selectedPriceOption ||
            option.tier === selectedPriceOption
        );

        if (!priceOption) {
          toast.error("Invalid price option selected");
          return;
        }

        packagePeriodId = priceOption._id || selectedPriceOption;
      }

      // Create booking data
      const bookingData: CreateScheduleData = {
        userId: user._id, // Get user ID from auth system
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        status: "pending",
        package_id: packageId,
        packagePeriodId: packagePeriodId || "", // Ensure packagePeriodId is always a string
      };

      // Submit booking
      await scheduleService.create(bookingData);

      toast.success("Booking successful! Your appointment has been scheduled.");
      setShowConfirmDialog(false);

      // Redirect to appointments page
      setTimeout(() => {
        router.push("/appointments");
      }, 1500);
    } catch (err) {
      console.error("Error creating booking:", err);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setBookingInProgress(false);
    }
  };

  // Handle booking with authentication check
  const handleBooking = () => {
    authenticateAction(processBooking);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          {error || "Package not found"}
        </h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Calculate price based on selected tier or package price
  const selectedPrice = packageData.priceOptions && packageData.priceOptions.length > 0
    ? packageData.priceOptions.find(
        (option) =>
          option._id === selectedPriceOption ||
          option.tier === selectedPriceOption
      )?.price || 0
    : packageData.price;

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={() => router.back()} 
          className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Back to packages
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground/90">Book Appointment</h1>
        <p className="text-muted-foreground">Select your preferred date, time, and package option to schedule your appointment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Package Details */}
        <PackageDetailsCard 
          packageData={packageData}
          description={description}
          selectedPriceOption={selectedPriceOption}
          setSelectedPriceOption={setSelectedPriceOption}
          formatCurrency={formatCurrency}
        />

        {/* Appointment Scheduling */}
        <AppointmentCard 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
          timeSlots={TIME_SLOTS}
          onContinue={() => setShowConfirmDialog(true)}
          onCancel={() => router.back()}
        />
      </div>
      
      {/* Booking Process Steps */}
      <BookingSteps />

      {/* Confirmation Dialog */}
      <BookingConfirmationDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        packageData={packageData}
        selectedPriceOption={selectedPriceOption}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        selectedPrice={selectedPrice}
        formatCurrency={formatCurrency}
        onConfirm={handleBooking}
        onCancel={() => setShowConfirmDialog(false)}
        bookingInProgress={bookingInProgress}
        user={user as UserProfile | null}
      />
    </div>
  );
}
