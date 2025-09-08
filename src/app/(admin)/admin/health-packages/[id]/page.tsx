"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
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
import { formatDateTimeString } from "@/utils/date";


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
  Stethoscope,
  Timer,
  Building2,
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
  const { t } = useTranslation();
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [id, setId] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  // Helper function to safely render service text
  const renderServiceText = (service: string | ConsultationService): string => {
    if (typeof service === 'string') {
      return service;
    }
    if (typeof service === 'object' && service !== null) {
      return service.name || service.description || `Service ${service._id?.slice(-4) || ''}`;
    }
    return String(service);
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
        title: t("admin.toast.error"),
        description: t("admin.toast.failedToFetchPackageDetails"),
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
        title: t("admin.toast.success"),
        description: t("admin.toast.packageDeleted"),
        type: "success",
      });
      router.push("/admin/health-packages");
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: t("admin.toast.error"),
        description: t("admin.toast.failedToDeletePackage"),
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
        <h2 className="text-2xl font-bold mb-4">{t("admin.healthPackages.notFound.title")}</h2>
        <p className="mb-6">{t("admin.healthPackages.notFound.description")}</p>
        <Button onClick={() => router.push("/admin/health-packages")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("admin.healthPackages.notFound.backToPackages")}
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
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("admin.healthPackages.notFound.backToPackages")}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEditPackage}
          >
            <Pencil className="mr-2 h-4 w-4" /> {t("admin.healthPackages.details.editPackage")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteAlertOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> {t("admin.healthPackages.details.deletePackage")}
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
                    {t("admin.healthPackages.idLabel")} {packageData._id}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("admin.healthPackages.details.description")}</h3>
                  <p className="text-base">{packageData.description}</p>
                </div>

                {packageData.titleImage && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("admin.healthPackages.details.titleImage")}</h3>
                        <div className="relative w-full">
                          <Image
                            src={packageData.titleImage}
                            alt={packageData.title}
                            width={600}
                            height={280}
                            className="w-full h-70 aspect-video object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/images/package-placeholder.jpg';
                              e.currentTarget.alt = t("admin.healthPackages.imageNotAvailable");
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <h3 className="text-lg font-medium">{t("admin.healthPackages.details.price")}</h3>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-6 border border-primary/20 h-fit">
                          <p className="text-2xl font-bold text-primary mb-2">
                            {formatCurrency(packageData.price || 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.healthPackages.details.priceDescription")}
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
                        <h3 className="text-lg font-medium">{t("admin.healthPackages.details.price")}</h3>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                        <p className="text-2xl font-bold text-primary mb-2">
                          {formatCurrency(packageData.price || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.healthPackages.details.priceDescription")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">{t("admin.healthPackages.details.faq")}</h3>
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
                    <p className="text-muted-foreground">{t("admin.healthPackages.details.noFaqAvailable")}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">{t("admin.healthPackages.details.servicesIncluded")}</h3>
                  </div>
                  {packageData.tests && packageData.tests.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {packageData.tests.map((service, i) => (
                          <Card key={i} className="bg-muted/30 border-border hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Stethoscope className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-base text-gray-900">
                                      {renderServiceText(service)}
                                    </h4>
                                    {typeof service === 'object' && service !== null && (service as ConsultationService).price && (
                                      <div className="text-right">
                                        <span className="text-lg font-bold text-primary">
                                          {formatCurrency((service as ConsultationService).price)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {typeof service === 'object' && service !== null && (
                                    <div className="space-y-2">
                                      {(service as ConsultationService).description && (
                                        <p className="text-sm text-gray-600">
                                          {(service as ConsultationService).description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        {(service as ConsultationService).duration && (
                                          <div className="flex items-center gap-1">
                                            <Timer className="h-3 w-3" />
                                            <span>{(service as ConsultationService).duration} {t("admin.healthPackages.minutes")}</span>
                                          </div>
                                        )}

                                        {(service as ConsultationService).type && (
                                          <div className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            <span className="capitalize">{(service as ConsultationService).type}</span>
                                          </div>
                                        )}

                                        {(service as ConsultationService).specialization && (
                                          <div className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            <span>
                                              {(() => {
                                                const spec = (service as ConsultationService).specialization;
                                                if (typeof spec === 'string') return spec;
                                                if (spec && typeof spec === 'object') return (spec as Specialty).name;
                                                return t("admin.healthPackages.general");
                                              })()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">{t("admin.healthPackages.packageSummary")}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-blue-800">
                            <span className="font-medium">{t("admin.healthPackages.totalServices")}</span>
                            <div className="text-xl font-bold text-blue-900">{packageData.tests.length}</div>
                          </div>
                          <div className="text-blue-800">
                            <span className="font-medium">{t("admin.healthPackages.packagePrice")}</span>
                            <div className="text-xl font-bold text-blue-900">{formatCurrency(packageData.price || 0)}</div>
                          </div>
                          <div className="text-blue-800">
                            <span className="font-medium">{t("admin.healthPackages.categoryLabel2")}</span>
                            <div className="text-lg font-semibold text-blue-900">{packageData.category || t("admin.healthPackages.general")}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-blue-700">
                            💡 {t("admin.healthPackages.allServicesIncluded")} {t("admin.healthPackages.individualPricesReference")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                      <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-muted-foreground mb-2">{t("admin.healthPackages.details.noServicesSpecified")}</h4>
                      <p className="text-sm text-muted-foreground">{t("admin.healthPackages.details.noServicesConfigured")}</p>
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
                <Clock className="h-5 w-5 text-primary" /> {t("admin.healthPackages.packageDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.healthPackages.details.packageCategory")}</h4>
                  <p className="font-medium">{packageData.category || t("admin.healthPackages.notSpecified")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.healthPackages.details.createdAt")}</h4>
                  <p className="font-medium">{packageData.createdAt ? formatDateTimeString(packageData.createdAt) : 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.healthPackages.details.updatedAt")}</h4>
                  <p className="font-medium">{packageData.updatedAt ? formatDateTimeString(packageData.updatedAt) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> {t("admin.healthPackages.bookingOptions")}
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
                          {t("admin.healthPackages.actionUrl")} {option.actionUrl}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("admin.healthPackages.details.noBookingOptions")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.healthPackages.areYouAbsolutelySure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.healthPackages.deletePackageConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.healthPackages.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePackage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.healthPackages.deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 