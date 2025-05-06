"use client";
import React, { useEffect, useState, useTransition } from "react";
import { ConsultationService, consultationServiceApi } from "@/services/consultationService";
import { WeeklyPackage, weeklyPackageService } from "@/services/weeklyPackage";
import { PeriodPackage } from "@/services/periodPackage";
import { ConsultationPackage } from "@/services/consultationPackage";
import { scheduleService } from "@/services/schedule";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, Check, UserIcon } from "lucide-react";
import { format, addDays, isSameDay, parseISO } from "date-fns";

// Simple Separator component
const Separator = ({ className }: { className?: string }) => (
  <div className={`h-px bg-gray-200 w-full ${className || ''}`} />
);

interface SchedulePageProps {
  params: {
    id: string;
  };
}

// Simple Calendar component
const SimpleCalendar = ({ 
  value,
  onSelect 
}: { 
  value: Date;
  onSelect: (date: Date) => void;
}) => {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {dates.map((date) => (
        <button
          key={date.toISOString()}
          className={`p-2 rounded-md ${isSameDay(date, value) ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => onSelect(date)}
        >
          <div className="text-xs font-medium">{format(date, 'EEE')}</div>
          <div className="text-lg font-bold">{format(date, 'd')}</div>
        </button>
      ))}
    </div>
  );
};

interface DayPackageWithPeriods {
  _id: string;
  day_offset: number;
  period_pkgs: PeriodPackageWithPkg[];
}

interface PeriodPackageWithPkg extends PeriodPackage {
  pkg: ConsultationPackage;
}

const SchedulePage = ({ params }: SchedulePageProps) => {
  const { id } = params;
  const { user, authenticateAction } = useAuth();
  const [service, setService] = useState<ConsultationService | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<PeriodPackage[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchServiceAndSchedule = async () => {
      try {
        setLoading(true);
        
        // Fetch service details
        const serviceData = await consultationServiceApi.getById(id);
        setService(serviceData);
        
        // Fetch weekly schedule - in a real app, you would use an API that
        // gets the schedule for a specific service
        const weeklySchedules = await weeklyPackageService.getAll();
        if (weeklySchedules.length > 0) {
          const scheduleDetails = await weeklyPackageService.getDetailById(weeklySchedules[0]._id);
          setWeeklySchedule(scheduleDetails);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load schedule data. Please try again later.");
        setLoading(false);
      }
    };

    startTransition(() => {
      fetchServiceAndSchedule();
    });
  }, [id]);

  // Update available time slots when the selected date changes
  useEffect(() => {
    if (weeklySchedule && weeklySchedule.packageDays) {
      // This is a simplified example. In a real app, you would match the selected date
      // to the correct day in the weekly schedule and get the available periods for that day.
      const timeSlots: PeriodPackage[] = [];
      
      // For each day package in the weekly schedule
      (weeklySchedule.packageDays as DayPackageWithPeriods[]).forEach(dayPackage => {
        // For each period package in the day package
        if (dayPackage.period_pkgs && Array.isArray(dayPackage.period_pkgs)) {
          dayPackage.period_pkgs.forEach((periodPkg: PeriodPackageWithPkg) => {
            if (periodPkg.pkg) {
              // Check if the selected service is contained in the package's tests
              if (periodPkg.pkg.tests.includes(id)) {
                // Add slots for the selected date if slots are available
                if (periodPkg.booked < (periodPkg.pkg.maxSlotPerPeriod || 1)) {
                  timeSlots.push(periodPkg);
                }
              }
            }
          });
        }
      });
      
      setAvailableTimeSlots(timeSlots);
    }
  }, [weeklySchedule, selectedDate, id]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (periodId: string) => {
    setSelectedTimeSlot(periodId);
  };

  const processBooking = async () => {
    if (!service || !selectedTimeSlot) return;
    
    // Check if user is authenticated
    if (!user || !user._id) {
      setError("User information not available. Please login to continue.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the selected time slot details
      const timeSlot = availableTimeSlots.find(slot => slot._id === selectedTimeSlot);
      if (!timeSlot) {
        setError("Selected time slot is no longer available");
        setLoading(false);
        return;
      }
      
      // Prepare booking data
      const bookingData = {
        userId: user._id,
        date: selectedDate.toISOString(),
        start_time: formatTime(timeSlot.startTime),
        end_time: formatTime(timeSlot.endTime),
        status: "pending" as const,
        package_id: typeof timeSlot.pkg === 'object' && timeSlot.pkg?._id ? timeSlot.pkg._id : id,
        package_period_id: selectedTimeSlot, // Use the time slot ID as the period ID
      };
      
      // Create booking
      await scheduleService.create(bookingData);
      
      setBookingSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError("Failed to create booking. Please try again later.");
      setLoading(false);
    }
  };

  // Add wrapper for authentication check
  const handleBooking = () => {
    authenticateAction(processBooking);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch {
      return dateString;
    }
  };

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push(`/consultations/${id}`)}>
          Back to Service
        </Button>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check size={32} />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Booking Confirmed!</CardTitle>
              <CardDescription className="text-center">
                Your appointment has been scheduled successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-500">Service:</div>
                  <div className="font-medium">{service?.name}</div>
                  
                  <div className="text-gray-500">Date:</div>
                  <div className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
                  
                  <div className="text-gray-500">Time:</div>
                  <div className="font-medium">
                    {availableTimeSlots.find(slot => slot._id === selectedTimeSlot)
                      ? `${formatTime(availableTimeSlots.find(slot => slot._id === selectedTimeSlot)!.startTime)} - ${formatTime(availableTimeSlots.find(slot => slot._id === selectedTimeSlot)!.endTime)}`
                      : 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
                <p className="font-medium mb-1">What&apos;s Next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You&apos;ll receive a confirmation email with all details</li>
                  <li>Please arrive 15 minutes before your appointment time</li>
                  <li>Bring any relevant medical records or test results</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full"
                onClick={() => router.push('/appointments')}
              >
                View My Appointments
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => router.push(`/consultations/${id}`)}
      >
        <ChevronLeft size={16} />
        Back to Service Details
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book Appointment</CardTitle>
          <CardDescription>
            {service?.name}: {service?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4">Select a Date</h3>
            <div className="p-2 border rounded-md">
              <SimpleCalendar
                value={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>
          </div>

          <Separator />

          {/* Time Slot Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4">Select a Time Slot</h3>
            
            {availableTimeSlots.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">No available time slots for the selected date.</p>
                <p className="text-gray-500 text-sm mt-2">Please select a different date or contact us for assistance.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot._id}
                    className={`p-3 border rounded-md flex items-center justify-between ${
                      selectedTimeSlot === slot._id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleTimeSlotSelect(slot._id)}
                  >
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      <span>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    {selectedTimeSlot === slot._id && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
            <p className="font-medium mb-2">Important Information</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Please arrive 15 minutes before your appointment</li>
              <li>Bring any relevant medical records or test results</li>
              <li>Appointments can be cancelled or rescheduled up to 24 hours in advance</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          {/* Add user status indicator above the confirm booking button */}
          <div className="w-full space-y-4">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {user ? (
                  <span className="text-green-600">Logged in as {user.name || user.phoneNumber}</span>
                ) : (
                  <span className="text-amber-600">You&apos;ll need to login before booking</span>
                )}
              </span>
            </div>
            
            <Button 
              className="w-full"
              disabled={!selectedTimeSlot || availableTimeSlots.length === 0}
              onClick={handleBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SchedulePage; 