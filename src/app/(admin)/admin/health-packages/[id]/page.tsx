"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ConsultationPackage, ConsultationService, Specialty } from "@/types";
import { consultationPackageService } from "@/services/consultationPackage.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import {
  Package,
  ArrowLeft,
  Pencil,
  Trash2,

  Clock,
  Tag,
  HelpCircle,
  Calendar,
  DollarSign,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export default function ViewHealthPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [id, setId] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  // Helper function to safely render test text
  const renderTestText = (test: string | ConsultationService): string => {
    if (typeof test === 'string') {
      return test;
    }
    if (typeof test === 'object' && test !== null) {
      return test.name || test.description || `Test ${test._id?.slice(-4) || ''}`;
    }
    return String(test);
  };


  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const fetchPackageData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await consultationPackageService.getDetailById(id);
      setPackageData(data);
    } catch (error) {
      console.error("Error fetching package details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch package details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPackageData();
    }
  }, [id, fetchPackageData]);

  const handleEditPackage = () => {
    router.push(`/admin/health-packages/edit/${id}`);
  };

  const handleDeletePackage = async () => {
    try {
      await consultationPackageService.delete(id);
      toast({
        title: "Success",
        description: "Health package deleted successfully",
        type: "success",
      });
      router.push("/admin/health-packages");
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete health package",
        type: "error",
      });
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

  if (!packageData) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Package Not Found</h2>
        <p className="mb-6">The health package you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push("/admin/health-packages")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Health Packages
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/health-packages")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Health Packages
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEditPackage}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Package
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteAlertOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Package
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{packageData.title}</CardTitle>
                  <CardDescription className="mt-1">
                    ID: {packageData._id}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-base">{packageData.description}</p>
                </div>

                {packageData.titleImage && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Title Image</h3>
                        <div className="relative w-full">
                          <Image
                            src={packageData.titleImage}
                            alt={packageData.title}
                            width={600}
                            height={280}
                            className="w-full h-70 aspect-video object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/images/package-placeholder.jpg';
                              e.currentTarget.alt = 'Image not available';
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <h3 className="text-lg font-medium">Price</h3>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-6 border border-primary/20 h-fit">
                          <p className="text-2xl font-bold text-primary mb-2">
                            {formatCurrency(packageData.price || 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Package price includes all listed tests
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!packageData.titleImage && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <h3 className="text-lg font-medium">Price</h3>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                        <p className="text-2xl font-bold text-primary mb-2">
                          {formatCurrency(packageData.price || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Package price includes all listed tests
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">FAQ</h3>
                  </div>
                  {packageData.faq && packageData.faq.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {packageData.faq?.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-muted-foreground">No FAQ available for this package</p>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">Tests Included</h3>
                  </div>
                  {packageData.tests && packageData.tests.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {packageData.tests.map((test, i) => (
                          <Card key={i} className="bg-muted/30 border-border">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">{i + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1">
                                    {renderTestText(test)}
                                  </h4>
                                  {typeof test === 'object' && test !== null && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      {(test as ConsultationService).description && (
                                        <p><span className="font-medium">Description:</span> {(test as ConsultationService).description}</p>
                                      )}
                                      {(test as ConsultationService).duration && (
                                        <p><span className="font-medium">Duration:</span> {(test as ConsultationService).duration}</p>
                                      )}
                                      {(test as ConsultationService).price && (
                                        <p><span className="font-medium">Price:</span> {formatCurrency((test as ConsultationService).price)}</p>
                                      )}
                                      {(test as ConsultationService).specialization && (
                                        <p>
                                          <span className="font-medium">Specialization:</span>{" "}
                                          {(() => {
                                            const spec = (test as ConsultationService).specialization;
                                            if (typeof spec === 'string') return spec;
                                            if (spec && typeof spec === 'object') return (spec as Specialty).name;
                                            return "Unknown";
                                          })()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Package Summary</h4>
                        </div>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><span className="font-medium">Total Tests:</span> {packageData.tests.length}</p>
                          <p><span className="font-medium">Package Price:</span> {formatCurrency(packageData.price || 0)}</p>
                          <p className="text-xs text-blue-600 mt-2">
                            All tests listed above are included in this health package at the package price.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No tests specified for this package</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Package Category</h4>
                  <p className="font-medium">{packageData.category || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                  <p className="font-medium">{packageData.createdAt ? new Date(packageData.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h4>
                  <p className="font-medium">{packageData.updatedAt ? new Date(packageData.updatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Booking Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {packageData.bookingOptions && packageData.bookingOptions.length > 0 ? (
                <div className="space-y-4">
                  {packageData.bookingOptions.map((option, i) => (
                    <Card key={i} className="bg-muted/30 border-border">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-1">{option.type}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                        <div className="text-xs text-muted-foreground truncate">
                          Action URL: {option.actionUrl}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No booking options specified</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the health package
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePackage}
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