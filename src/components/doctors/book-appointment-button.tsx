"use client";

import { useState } from "react";
import { CalendarClock, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ButtonHTMLAttributes } from "react";

interface BookAppointmentButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  doctorId: string;
  doctorName: string;
  onSuccessfulBooking?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookAppointmentButton({
  doctorId,
  doctorName,
  onSuccessfulBooking,
  children,
  ...props
}: BookAppointmentButtonProps) {
  const { authenticateAction, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isBooking, setIsBooking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      // This is where you would make the API call to book an appointment
      // For example: await appointmentService.bookAppointment(doctorId);
      console.log(`Booking appointment with doctor ${doctorId}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Appointment Booked",
        description: `Your appointment with Dr. ${doctorName} has been scheduled successfully.`,
        type: "success"
      });
      
      if (onSuccessfulBooking) {
        onSuccessfulBooking();
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        type: "error"
      });
      console.error("Error booking appointment:", error);
    } finally {
      setIsBooking(false);
    }
  };

  // Use the authenticateAction to ensure user is logged in before booking
  const handleClick = () => {
    authenticateAction(handleBooking);
  };

  return (
    <div className="relative inline-block">
      <Button 
        onClick={handleClick} 
        disabled={isBooking}
        onMouseEnter={() => !isAuthenticated && setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        onFocus={() => !isAuthenticated && setShowHint(true)}
        onBlur={() => setShowHint(false)}
        {...props}
      >
        {isBooking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          <>
            <CalendarClock className="mr-2 h-4 w-4" />
            {children || "Book Appointment"}
            {!isAuthenticated && <LogIn className="ml-2 h-4 w-4" />}
          </>
        )}
      </Button>
      
      {showHint && !isAuthenticated && (
        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-background border px-3 py-1.5 text-sm shadow-md z-50">
          Sign in to book an appointment
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-background h-0 w-0"></div>
        </div>
      )}
    </div>
  );
} 