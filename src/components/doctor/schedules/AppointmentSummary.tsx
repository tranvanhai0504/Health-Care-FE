"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Appointment } from "@/types/appointment";

interface AppointmentSummaryProps {
  appointments: Appointment[];
}

export function AppointmentSummary({ appointments }: AppointmentSummaryProps) {
  const getStatusCount = (status: string) => {
    return appointments.filter((a) => a.status === status).length;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          Today&apos;s Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {getStatusCount("upcoming")}
            </div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {getStatusCount("in-progress")}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {getStatusCount("completed")}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {getStatusCount("cancelled")}
            </div>
            <div className="text-xs text-gray-600">Cancelled</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
