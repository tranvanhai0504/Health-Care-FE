"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PillIcon, Plus, User, Calendar, Search, Frown } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

// Mock data structure - replace with actual API calls and types
interface Prescription {
  id: string;
  patientName: string;
  medication: string;
  dosage: string;
  duration: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

const mockPrescriptions: Prescription[] = [
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
  },
  {
    id: "3",
    patientName: "Peter Jones",
    medication: "Lisinopril 10mg",
    dosage: "Once daily",
    duration: "30 days",
    date: "2024-01-12",
    status: "active"
  },
  {
    id: "4",
    patientName: "Mary Johnson",
    medication: "Metformin 500mg",
    dosage: "Twice daily",
    duration: "90 days",
    date: "2023-12-20",
    status: "completed"
  },
  {
    id: "5",
    patientName: "David Williams",
    medication: "Amlodipine 5mg",
    dosage: "Once daily",
    duration: "60 days",
    date: "2024-01-05",
    status: "cancelled"
  }
];

const getStatusBadgeVariant = (status: Prescription['status']) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function DoctorPrescriptions() {
  const { user, isLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    if (user) {
      setPrescriptions(mockPrescriptions);
    }
  }, [user]);

  const filteredPrescriptions = useMemo(() => {
    if (!searchTerm) {
      return prescriptions;
    }
    return prescriptions.filter(p =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medication.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prescriptions, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view and manage prescriptions.</p>
          <Button asChild className="mt-4">
            <a href="/login">Log In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-2">Manage patient prescriptions and medications</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by patient name or medication..."
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <PillIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
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
                      <div className="flex items-center space-x-3 self-start sm:self-center">
                        <Badge variant={getStatusBadgeVariant(prescription.status)}>
                          {prescription.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Frown className="h-12 w-12 text-gray-400 mx-auto"/>
                <h3 className="mt-4 text-lg font-semibold">No Prescriptions Found</h3>
                <p className="mt-1 text-sm text-gray-600">No prescriptions matched your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}