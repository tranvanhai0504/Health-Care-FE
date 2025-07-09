import React from "react";
import { Stethoscope } from "lucide-react";

export function BookingSteps() {
  return (
    <div className="mt-12 mb-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        Booking Process
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col items-center text-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-medium">1</span>
          </div>
          <h3 className="font-medium mb-2">Select Package Options</h3>
          <p className="text-sm text-muted-foreground">Choose your preferred package tier and review details</p>
        </div>
        <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col items-center text-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-medium">2</span>
          </div>
          <h3 className="font-medium mb-2">Pick Date & Time</h3>
                      <p className="text-sm text-muted-foreground">Select a convenient time slot for your schedule</p>
        </div>
        <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col items-center text-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-medium">3</span>
          </div>
          <h3 className="font-medium mb-2">Confirm Booking</h3>
                      <p className="text-sm text-muted-foreground">Review your details and confirm your schedule</p>
        </div>
      </div>
    </div>
  );
} 