"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ConsultationPackage, ConsultationService } from "@/types";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { consultationServiceApi } from "@/services/consultationService.service";
import SearchService from "@/components/dialogs/search-service";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Package,
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Schema for form validation - updated to match ConsultationPackage interface
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  titleImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  price: z.number().min(0, "Price must be a positive number"),
  maxSlotPerPeriod: z.number().min(1, "Must be at least 1").optional(),
});

export default function EditHealthPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPackage, setOriginalPackage] =
    useState<ConsultationPackage | null>(null);
  const [id, setId] = useState<string>("");

  // Service selection state
  const [selectedServices, setSelectedServices] = useState<
    ConsultationService[]
  >([]);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      titleImage: "",
      price: 0,
      maxSlotPerPeriod: 10,
    },
  });

  // Handle service selection from dialog
  const handleServiceSelection = (services: ConsultationService[]) => {
    setSelectedServices(services);
  };

  // Remove a selected service
  const removeSelectedService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.filter((service) => service._id !== serviceId)
    );
  };

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const data = await consultationPackageService.getById(id);
        setOriginalPackage(data);

        // Set form values from fetched data
        form.reset({
          title: data.title,
          description: data.description,
          category: data.category,
          titleImage: data.titleImage || "",
          price: data.price || 0,
          maxSlotPerPeriod: data.maxSlotPerPeriod || 10,
        });

        // Fetch service details if tests (service IDs) exist
        if (data.tests && data.tests.length > 0) {
          try {
            const services = await consultationServiceApi.getByIds(data.tests);
            setSelectedServices(services);
          } catch (serviceError) {
            console.error("Error fetching service details:", serviceError);
            toast.error("Some services could not be loaded");
          }
        }
      } catch (error) {
        console.error("Error fetching package details:", error);
        toast.error("Failed to fetch package details");
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [id, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!originalPackage) return;

    try {
      setIsSubmitting(true);

      // Convert selected services to service IDs for the tests field
      const serviceIds = selectedServices.map((service) => service._id);

      await consultationPackageService.update(id, {
        ...data,
        tests: serviceIds, // Store service IDs in the tests field
        // Preserve other fields from the original package that aren't in the form
        icon: originalPackage.icon,
        priceOptions: originalPackage.priceOptions,
        faq: originalPackage.faq,
        bookingOptions: originalPackage.bookingOptions,
      });

      toast.success("Health package updated successfully");

      // Redirect to the package details
      router.push(`/admin/health-packages/${id}`);
    } catch (error) {
      console.error("Error updating health package:", error);
      toast.error("Failed to update health package");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-36" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(`/admin/health-packages/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Package Details
      </Button>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="h-5 w-5" /> Edit Health Package
          </CardTitle>
          <CardDescription>
            Update details for {originalPackage?.title}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Complete Health Checkup"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <div className="w-full">
                          <MDEditor
                            value={field.value}
                            onChange={(value) => field.onChange(value || "")}
                            data-color-mode="light"
                            height={300}
                            textareaProps={{
                              placeholder:
                                "Describe the health package using markdown...",
                            }}
                            preview="live"
                            hideToolbar={false}
                            visibleDragbar={false}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Use markdown formatting to describe the health package.
                        You can use headers, lists, bold text, and more.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. General Health, Specialized Care"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="titleImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL of the image to display for this package
                      </FormDescription>
                      <FormMessage />

                      {/* Image Preview Section */}
                      {field.value && field.value.trim() !== "" && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Preview
                          </h4>
                          <div className="relative w-full max-w-md">
                            <Image
                              src={field.value}
                              alt="Package preview"
                              width={400}
                              height={192}
                              className="w-full h-48 aspect-video object-cover rounded-lg border shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const errorDiv = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = "block";
                              }}
                              onLoad={(e) => {
                                e.currentTarget.style.display = "block";
                                const errorDiv = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = "none";
                              }}
                            />
                            <div className="hidden w-full h-48 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center bg-red-50">
                              <div className="text-center">
                                <div className="text-red-500 mb-2">
                                  <svg
                                    className="w-8 h-8 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-red-600 font-medium">
                                  Failed to load image
                                </p>
                                <p className="text-xs text-red-500 mt-1">
                                  Please check the URL
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Package price in currency units
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSlotPerPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Slots Per Period</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of schedules that can be booked for this
                        package per period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Services/Tests Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Services & Tests Included
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsServiceDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Select Services
                    </Button>
                  </div>

                  {selectedServices.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <div className="text-muted-foreground">
                        <Stethoscope className="h-8 w-8 mx-auto mb-2" />
                        <p>No services selected yet</p>
                        <p className="text-sm mt-1">
                          Click &quot;Select Services&quot; to include
                          consultation services and tests in this package
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedServices.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {service.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Duration: {service.duration} min</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(service.price)}
                              </span>
                              {service.specialization &&
                                typeof service.specialization === "string" && (
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {service.specialization}
                                  </span>
                                )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSelectedService(service._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedServices.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-800">
                        <p>
                          <span className="font-medium">
                            Total Services & Tests:
                          </span>{" "}
                          {selectedServices.length}
                        </p>
                        <p>
                          <span className="font-medium">
                            Total Service Value:
                          </span>{" "}
                          {formatCurrency(
                            selectedServices.reduce(
                              (total, service) => total + service.price,
                              0
                            )
                          )}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          All services and tests listed above will be included
                          in this health package.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          {/* Search Service Dialog */}
          <SearchService
            isOpen={isServiceDialogOpen}
            onOpenChange={setIsServiceDialogOpen}
            onApply={handleServiceSelection}
            multiple={true}
            initialSelectedIds={selectedServices.map((service) => service._id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
