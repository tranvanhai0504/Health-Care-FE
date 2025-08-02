"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsultationService } from "@/types";
import { consultationServiceApi } from "@/services/consultationService.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Stethoscope,
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ViewHealthServicePage({ params }: { params: Promise<{ id: string }> }) {
  const [serviceData, setServiceData] = useState<ConsultationService | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [id, setId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const fetchServiceData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await consultationServiceApi.getById(id);
      setServiceData(data);
    } catch (error) {
      console.error("Error fetching service details:", error);
      toast.error("Failed to fetch service details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchServiceData();
    }
  }, [id, fetchServiceData]);

  const handleEditService = () => {
    router.push(`/admin/health-services/edit/${id}`);
  };

  const handleDeleteService = async () => {
    try {
      await consultationServiceApi.delete(id);
      toast.success("Health service deleted successfully");
      router.push("/admin/health-services");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete health service");
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <p className="mb-6">The health service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push("/admin/health-services")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Health Services
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/health-services")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Health Services
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEditService}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Service
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteAlertOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{serviceData.name}</CardTitle>
                  <CardDescription className="mt-1">
                    ID: {serviceData._id}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-base">{serviceData.description || "No description available"}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-medium">Price</h3>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                      <p className="text-2xl font-bold text-primary mb-2">
                        {serviceData.price === 0
                          ? "Free"
                          : formatCurrency(serviceData.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Per consultation service
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-medium">Duration</h3>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {serviceData.duration} minutes
                      </p>
                      <p className="text-sm text-blue-600">
                        Estimated consultation time
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">Specialization</h3>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {typeof serviceData.specialization === "string"
                        ? serviceData.specialization
                        : serviceData.specialization?.name || "General"}
                    </Badge>
                    {typeof serviceData.specialization === "object" && 
                     serviceData.specialization?.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {serviceData.specialization.description}
                      </p>
                    )}
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                  <p className="font-medium">
                    {serviceData.createdAt 
                      ? new Date(serviceData.createdAt).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h4>
                  <p className="font-medium">
                    {serviceData.updatedAt 
                      ? new Date(serviceData.updatedAt).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Service Information */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> Service Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{serviceData.duration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {serviceData.price === 0 
                      ? "Free" 
                      : formatCurrency(serviceData.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Specialization</span>
                  <span className="font-medium text-right max-w-[120px] truncate">
                    {typeof serviceData.specialization === "string"
                      ? serviceData.specialization
                      : serviceData.specialization?.name || "General"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the health service
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}