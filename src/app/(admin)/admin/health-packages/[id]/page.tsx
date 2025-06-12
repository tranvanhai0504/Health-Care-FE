"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConsultationPackage,
  consultationPackageService,
} from "@/services/consultationPackage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import {
  Package,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
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

export default function ViewHealthPackagePage({ params }: { params: { id: string } }) {
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPackageData();
  }, [params.id]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const data = await consultationPackageService.getDetailById(params.id);
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
  };

  const handleEditPackage = () => {
    router.push(`/admin/health-packages/edit/${params.id}`);
  };

  const handleDeletePackage = async () => {
    try {
      await consultationPackageService.delete(params.id);
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

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">Features</h3>
                  </div>
                  <ul className="space-y-2">
                    {packageData.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">FAQ</h3>
                  </div>
                  {packageData.faq.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {packageData.faq.map((item, i) => (
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
                    <div className="flex flex-wrap gap-2">
                      {packageData.tests.map((test, i) => (
                        <Badge key={i} variant="secondary">
                          {test}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No tests specified for this package</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Pricing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packageData.priceOptions.map((option, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 py-3">
                      <CardTitle className="text-lg">{option.tier}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold text-primary mb-2">
                        {formatCurrency(option.price)}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <p>Tests included: {option.testsIncluded}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                  <p className="font-medium">{new Date(packageData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h4>
                  <p className="font-medium">{new Date(packageData.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Icon</h4>
                  <p className="font-medium">{packageData.icon || 'None'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Max Slots Per Period</h4>
                  <p className="font-medium">{packageData.maxSlotPerPeriod || 'Unlimited'}</p>
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