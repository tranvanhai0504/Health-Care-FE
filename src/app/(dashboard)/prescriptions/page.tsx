"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { prescriptionService } from "@/services";
import { Prescription } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  LogIn,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function PrescriptionsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);

  // Fetch prescriptions when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPrescriptions();
    }
  }, [isAuthenticated, user]);

  // Filter prescriptions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPrescriptions(prescriptions);
    } else {
      const filtered = prescriptions.filter((prescription) =>
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        prescription.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrescriptions(filtered);
    }
  }, [searchTerm, prescriptions]);

  const fetchPrescriptions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await prescriptionService.getPatientPrescriptions({ 
        patientId: user._id 
      });
      setPrescriptions(response);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      dispensed: {
        label: "Dispensed",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: X,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} px-2 py-1 text-xs font-medium flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Clock,
      },
      paid: {
        label: "Paid",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: X,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} px-2 py-1 text-xs font-medium flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Your Prescriptions
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view and search your prescription history.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="text-gray-600">
              View and search your prescription history
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by diagnosis, medication, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Prescriptions Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No prescriptions found" : "No prescriptions yet"}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? "Try adjusting your search terms"
              : "Your prescriptions will appear here after your medical consultations"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {prescription.diagnosis}
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(prescription.status)}
                    {getPaymentStatusBadge(prescription.paymentStatus)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(prescription.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Medications */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Medications ({prescription.medications.length})
                  </h4>
                  <div className="space-y-2">
                    {prescription.medications.slice(0, 2).map((med, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">{med.name}</div>
                        <div className="text-gray-600 text-xs">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </div>
                      </div>
                    ))}
                    {prescription.medications.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{prescription.medications.length - 2} more medications
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {prescription.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                {/* Schedule Info */}
                {prescription.scheduleId && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>From scheduled consultation</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {prescriptions.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            onClick={fetchPrescriptions}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Refresh Prescriptions
          </Button>
        </div>
      )}
    </div>
  );
}
