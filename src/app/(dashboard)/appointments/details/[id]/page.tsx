import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function AppointmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real app, you would fetch appointment details based on this ID
  const appointmentId = params.id;
  
  // Mock appointment data
  const appointment = {
    id: appointmentId,
    doctor: {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      image: "/images/doctors/sarah-johnson.jpg"
    },
    date: "Wednesday, Oct 12, 2023",
    time: "10:00 AM - 10:30 AM",
    type: "In-person",
    location: "HealthCare Medical Center, 123 Main St, Floor 3, Room 302",
    status: "Confirmed",
    notes: "Please arrive 15 minutes early to complete registration. Bring your insurance card and ID.",
    reason: "Annual heart checkup and ECG examination"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Appointment Details</h2>
        <p className="text-muted-foreground">Appointment #{appointmentId}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Information</CardTitle>
              <CardDescription>Details about your upcoming appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                  <p>{appointment.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                  <p>{appointment.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <p>{appointment.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <p className="text-primary font-medium">{appointment.status}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                <p>{appointment.location}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Reason for Visit</h4>
                <p>{appointment.reason}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
              <CardDescription>Your healthcare provider</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 mb-4" />
              <h3 className="font-medium text-lg">{appointment.doctor.name}</h3>
              <p className="text-muted-foreground">{appointment.doctor.specialty}</p>
              
              <div className="w-full mt-6 space-y-2">
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md">
                  Message
                </button>
                <button className="w-full border border-input bg-background py-2 rounded-md">
                  Reschedule
                </button>
                <button className="w-full border border-input bg-background py-2 rounded-md text-destructive hover:bg-destructive/10">
                  Cancel Appointment
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 