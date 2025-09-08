"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { ConsultationService, Specialty } from "@/types";
import { consultationServiceApi } from "@/services/consultationService.service";
import { specialtyService } from "@/services/specialties.service";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Stethoscope,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Schema for form validation
const createFormSchema = (t: (key: string) => string) => {
  try {
    return z.object({
      name: z.string().min(3, t("admin.healthServices.editPagePage.validation.nameMinLength") || "Service name must be at least 3 characters"),
      description: z.string().min(10, t("admin.healthServices.editPagePage.validation.descriptionMinLength") || "Description must be at least 10 characters"),
      specialization: z.string().min(1, t("admin.healthServices.editPagePage.validation.specializationRequired") || "Specialization is required"),
      duration: z.number().min(1, t("admin.healthServices.editPagePage.validation.durationMinValue") || "Duration must be at least 1 minute"),
      price: z.number().min(0, t("admin.healthServices.editPagePage.validation.priceMinValue") || "Price must be a positive number"),
    });
  } catch (error) {
    console.warn("Translation error in form schema, using fallback messages:", error);
    return z.object({
      name: z.string().min(3, "Service name must be at least 3 characters"),
      description: z.string().min(10, "Description must be at least 10 characters"),
      specialization: z.string().min(1, "Specialization is required"),
      duration: z.number().min(1, "Duration must be at least 1 minute"),
      price: z.number().min(0, "Price must be a positive number"),
    });
  }
};

export default function EditHealthServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalService, setOriginalService] = useState<ConsultationService | null>(null);
  const [id, setId] = useState<string>("");
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  // Create form schema with proper error handling
  const formSchema = useMemo(() => createFormSchema(t), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      specialization: "",
      duration: 30,
      price: 0,
    },
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fetch specialties on component mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await specialtyService.getAll();
        setSpecialties(data);
      } catch (error) {
        console.error("Error fetching specialties:", error);
        toast.error(t("admin.healthServices.editPage.messages.fetchSpecialtiesError"));
      }
    };

    fetchSpecialties();
  }, [t]);

  useEffect(() => {
    if (!id) return;

    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const data = await consultationServiceApi.getById(id);
        setOriginalService(data);

        // Set form values from fetched data
        form.reset({
          name: data.name,
          description: data.description || "",
          specialization: typeof data.specialization === "string" 
            ? data.specialization 
            : data.specialization?.name || "",
          duration: data.duration || 30,
          price: data.price || 0,
        });
      } catch (error) {
        console.error("Error fetching service details:", error);
        toast.error(t("admin.healthServices.editPage.messages.fetchServiceError"));
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id, form, t]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!originalService) return;

    try {
      setIsSubmitting(true);

      await consultationServiceApi.update(id, data);

      toast.success(t("admin.healthServices.editPage.messages.updateSuccess"));

      // Redirect to the service details
      router.push(`/admin/health-services/${id}`);
    } catch (error) {
      console.error("Error updating health service:", error);
      toast.error(t("admin.healthServices.editPage.messages.updateError"));
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
        onClick={() => router.push(`/admin/health-services/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("admin.healthServices.editPage.backToDetails")}
      </Button>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Stethoscope className="h-5 w-5" /> {t("admin.healthServices.editPage.title")}
          </CardTitle>
          <CardDescription>
            {t("admin.healthServices.editPage.subtitle")} {originalService?.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.healthServices.editPage.form.serviceName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("admin.healthServices.editPage.form.serviceNamePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.healthServices.editPage.form.specialization")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("admin.healthServices.editPage.form.selectSpecialization")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty._id} value={specialty.name}>
                                {specialty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.healthServices.editPage.form.description")}</FormLabel>
                      <FormControl>
                        <div className="w-full">
                          <MDEditor
                            value={field.value}
                            onChange={(value) => field.onChange(value || "")}
                            data-color-mode="light"
                            height={300}
                            textareaProps={{
                              placeholder: t("admin.healthServices.editPage.form.descriptionPlaceholder"),
                            }}
                            preview="live"
                            hideToolbar={false}
                            visibleDragbar={false}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t("admin.healthServices.editPage.form.descriptionHelper")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.healthServices.editPage.form.duration")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("admin.healthServices.editPage.form.durationHelper")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.healthServices.editPage.form.price")}</FormLabel>
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
                          {t("admin.healthServices.editPage.form.priceHelper")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        {t("admin.healthServices.editPage.form.updating")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {t("admin.healthServices.editPage.form.saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}