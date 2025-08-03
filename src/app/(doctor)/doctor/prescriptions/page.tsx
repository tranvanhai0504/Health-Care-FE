"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillIcon, Plus, User, Calendar } from "lucide-react";

export default function DoctorPrescriptions() {
  // Mock data - replace with actual API calls
  const prescriptions = [
    {
      id: "1",
      patientName: "John Doe",
      medication: "Amoxicillin 500mg",
      dosage: "3 times daily",
      duration: "7 days",
      date: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      patientName: "Jane Smith",
      medication: "Ibuprofen 400mg",
      dosage: "As needed",
      duration: "5 days",
      date: "2024-01-14",
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-2">Manage patient prescriptions and medications</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <div className="grid gap-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <PillIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {prescription.patientName}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {prescription.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescription.dosage} • {prescription.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                    {prescription.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 