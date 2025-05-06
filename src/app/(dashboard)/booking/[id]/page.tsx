"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";
import { Calendar, Clock, ArrowRightIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

// Services
import { consultationPackageService, ConsultationPackage } from "@/services/consultationPackage";
import { scheduleService, CreateScheduleData } from "@/services/schedule";
import { useAuth } from "@/hooks/useAuth";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// CSS for react-day-picker
import "react-day-picker/dist/style.css";

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
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<typeof TIME_SLOTS[0] | null>(null);
  const [selectedPriceOption, setSelectedPriceOption] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Fetch package data
  useEffect(() => {
    async function fetchPackageData() {
      setLoading(true);
      try {
        const data = await consultationPackageService.getDetailById(packageId);
        setPackageData(data);
        
        // Set default price option if available
        if (data.priceOptions && data.priceOptions.length > 0) {
          setSelectedPriceOption(data.priceOptions[0]._id || data.priceOptions[0].tier);
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
      currency: "VND"
    }).format(amount);
  };

  // Handle booking submission
  const processBooking = async () => {
    if (!packageData || !selectedDate || !selectedTimeSlot || !selectedPriceOption) {
      toast.error("Please select date, time, and package option for your appointment");
      return;
    }

    if (!user || !user._id) {
      toast.error("User information not available");
      return;
    }

    setBookingInProgress(true);
    
    try {
      // Get the selected price option object
      const priceOption = packageData.priceOptions.find(
        option => option._id === selectedPriceOption || option.tier === selectedPriceOption
      );

      if (!priceOption) {
        toast.error("Invalid price option selected");
        return;
      }

      // Create booking data
      const bookingData: CreateScheduleData = {
        userId: user._id, // Get user ID from auth system
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedTimeSlot.start,
        end_time: selectedTimeSlot.end,
        status: "pending",
        package_id: packageId,
        package_period_id: priceOption._id || selectedPriceOption, // Add the package_period_id
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

  // Calculate price based on selected tier
  const selectedPrice = packageData.priceOptions.find(
    option => option._id === selectedPriceOption || option.tier === selectedPriceOption
  )?.price || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Book Appointment</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Package Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
            <CardDescription>Review your selected package</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{packageData.title}</h3>
              <p className="text-gray-700">{packageData.description}</p>
              
              {/* Price Options */}
              <div className="mt-4">
                <Label htmlFor="price-options">Select Package Tier</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {packageData.priceOptions.map((option) => (
                    <div
                      key={option._id || option.tier}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        (option._id === selectedPriceOption || option.tier === selectedPriceOption)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary"
                      }`}
                      onClick={() => setSelectedPriceOption(option._id || option.tier)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.tier}</span>
                        <span className="text-primary font-bold">
                          {formatCurrency(option.price)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {option.testsIncluded} tests included
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Schedule Your Appointment</CardTitle>
            <CardDescription>Select a date and time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="flex flex-col">
                <Label className="mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> Select Date
                </Label>
                <div className="border rounded-md p-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    fromDate={new Date()}
                    toDate={addDays(new Date(), 30)}
                    disabled={{ before: new Date() }}
                    className="mx-auto"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="flex flex-col">
                <Label className="mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Select Time
                </Label>
                <div className="border rounded-md p-4 h-[calc(100%-2rem)]">
                  <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto">
                    {TIME_SLOTS.map((slot, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-md cursor-pointer text-center transition-colors ${
                          selectedTimeSlot === slot
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {slot.start} - {slot.end}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              disabled={!selectedDate || !selectedTimeSlot} 
              onClick={() => setShowConfirmDialog(true)}
            >
              Continue to Booking <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Package:</span>
              <span>{packageData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Plan:</span>
              <span>{packageData.priceOptions.find(
                option => option._id === selectedPriceOption || option.tier === selectedPriceOption
              )?.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Price:</span>
              <span className="text-primary font-bold">{formatCurrency(selectedPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Time:</span>
              <span>{selectedTimeSlot ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}` : ""}</span>
            </div>
          </div>
          
          <div className="flex items-center border-t border-gray-200 pt-4 mt-4">
            <UserIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {user ? (
                <span className="text-green-600">Logged in as {user.name || user.phoneNumber}</span>
              ) : (
                <span className="text-amber-600">You&apos;ll need to login before booking</span>
              )}
            </span>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={bookingInProgress}
            >
              Go Back
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={bookingInProgress}
            >
              {bookingInProgress ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 