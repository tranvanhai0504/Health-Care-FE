import React from "react";
import { format, addDays } from "date-fns";
import { DayPicker } from "react-day-picker";
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
  ArrowRightIcon,
  Calendar,
  CalendarCheck,
  CheckCircle,
  Clock,
} from "lucide-react";
import "react-day-picker/dist/style.css";

// Define time slots type
type TimeSlot = {
  start: string;
  end: string;
};

interface AppointmentCardProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimeSlot: TimeSlot | null;
  setSelectedTimeSlot: (slot: TimeSlot) => void;
  timeSlots: TimeSlot[];
  onContinue: () => void;
  onCancel: () => void;
}

export function AppointmentCard({
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  timeSlots,
  onContinue,
  onCancel,
}: AppointmentCardProps) {
  return (
    <Card className="lg:col-span-2 border-border/60 shadow-md">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Schedule Your Appointment
        </CardTitle>
        <CardDescription>
          Select a convenient date and time slot for your visit
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="flex flex-col">
            <Label className="mb-3 flex items-center text-base font-medium">
              <Calendar className="w-4 h-4 mr-2 text-primary" /> Select Date
            </Label>
            <div className="border border-border/60 rounded-lg p-4 shadow-sm bg-background flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={new Date()}
                toDate={addDays(new Date(), 30)}
                disabled={{ before: new Date() }}
                className="mx-auto"
                classNames={{
                  button: "text-primary",
                  chevron: "text-primary",
                }}
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground",
                  today: "bg-muted text-foreground font-medium",
                }}
                styles={{
                  caption: { color: "var(--primary)" },
                  table: { margin: "0 auto" },
                  day: { margin: "0.15rem" },
                  button: { margin: 0 },
                  nav: { margin: "0 auto", color: "var(--primary)" },
                }}
                footer={
                  <div className="mt-3 text-xs text-muted-foreground text-center">
                    Showing 30 days from today
                  </div>
                }
              />
            </div>
          </div>

          {/* Time Slots */}
          <div className="flex flex-col h-full">
            <Label className="mb-3 flex items-center text-base font-medium">
              <Clock className="w-4 h-4 mr-2 text-primary" /> Select Time
            </Label>
            <div className="border border-border/60 rounded-lg p-4 lg:h-[calc(100%-3rem)] shadow-sm bg-background">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer text-center transition-all ${
                      selectedTimeSlot === slot
                        ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                    }`}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    <div className="flex flex-col items-center">
                      <Clock
                        className={`w-4 h-4 mb-1 ${
                          selectedTimeSlot === slot
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`${
                          selectedTimeSlot === slot
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-4 pt-3 border-t border-border/40">
                All time slots are in local time
              </div>
            </div>
          </div>
        </div>

        {selectedDate && selectedTimeSlot && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>
                You selected{" "}
                <span className="font-medium text-foreground">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>{" "}
                at{" "}
                <span className="font-medium text-foreground">
                  {selectedTimeSlot.start} - {selectedTimeSlot.end}
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/40 pt-4 mt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-border/60"
        >
          Cancel
        </Button>
        <Button
          disabled={!selectedDate || !selectedTimeSlot}
          onClick={onContinue}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        >
          Continue to Booking <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
