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
import { cn } from "@/lib/utils";

// Define time period type
type TimePeriod = {
  id: string;
  label: string;
  description: string;
  start: string;
  end: string;
};

interface ScheduleCardProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimeSlot: TimePeriod | null;
  setSelectedTimeSlot: (period: TimePeriod) => void;
  timeSlots: TimePeriod[];
  onContinue: () => void;
  onCancel: () => void;
}

export function ScheduleCard({
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  timeSlots,
  onContinue,
  onCancel,
}: ScheduleCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card className="lg:col-span-2 border-border/60 shadow-md">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Schedule Your Session
        </CardTitle>
        <CardDescription>
          Choose your preferred date and time period
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
                fromDate={today}
                toDate={addDays(new Date(), 30)}
                disabled={(date) => date < today}
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

          {/* Time Periods */}
          <div className="flex flex-col h-full">
            <Label className="mb-3 flex items-center text-base font-medium">
              <Clock className="w-4 h-4 mr-2 text-primary" /> Select Time Period
            </Label>
            <div className="border border-border/60 rounded-lg p-4 flex-1 shadow-sm bg-background flex flex-col">
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                {timeSlots.map((period) => (
                  <div
                    key={period.id}
                    className={cn(
                      "flex-1 p-6 border rounded-lg cursor-pointer transition-all min-h-[80px]",
                      selectedTimeSlot?.id === period.id
                        ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                    )}
                    onClick={() => setSelectedTimeSlot(period)}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex items-center gap-4">
                        <Clock
                          className={`w-6 h-6 ${
                            selectedTimeSlot?.id === period.id
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <div>
                          <div
                            className={`text-lg font-semibold ${
                              selectedTimeSlot?.id === period.id
                                ? "text-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {period.label}
                          </div>
                          <div
                            className={`text-base ${
                              selectedTimeSlot?.id === period.id
                                ? "text-muted-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {period.description}
                          </div>
                        </div>
                      </div>
                      {selectedTimeSlot?.id === period.id && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-4 pt-3 border-t border-border/40 flex-shrink-0">
                All times are in local time
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
                in the{" "}
                <span className="font-medium text-foreground">
                  {selectedTimeSlot.label} ({selectedTimeSlot.description})
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
