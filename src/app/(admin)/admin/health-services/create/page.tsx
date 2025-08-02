"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { consultationServiceApi } from "@/services/consultationService.service";

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Stethoscope,
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  X,
} from "lucide-react";

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  specialization: z.string().min(1, "Specialization is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  price: z.number().min(0, "Price must be a positive number"),
  serviceType: z.string().optional(),
  isActive: z.boolean().default(true),
  requirements: z.array(z.string()).default([]),
  contraindications: z.array(z.string()).default([]),
});

export default function CreateHealthServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      specialization: "",
      duration: 30,
      price: 0,
      serviceType: "consultation",
      isActive: true,
      requirements: [],
      contraindications: [],
    },
  });

  // Watch requirements and contraindications for dynamic updates
  const requirements = form.watch("requirements");
  const contraindications = form.watch("contraindications");

  // Add a new requirement
  const addRequirement = () => {
    form.setValue("requirements", [...requirements, ""]);
  };

  // Remove a requirement at specified index
  const removeRequirement = (index: number) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    form.setValue("requirements", updatedRequirements);
  };

  // Add a new contraindication
  const addContraindication = () => {
    form.setValue("contraindications", [...contraindications, ""]);
  };

  // Remove a contraindication at specified index
  const removeContraindication = (index: number) => {
    const updatedContraindications = contraindications.filter((_, i) => i !== index);
    form.setValue("contraindications", updatedContraindications);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Remove any empty requirements and contraindications
      const sanitizedData = {
        ...data,
        requirements: data.requirements.filter(req => req.trim() !== ""),
        contraindications: data.contraindications.filter(contra => contra.trim() !== ""),
      };

      await consultationServiceApi.create(sanitizedData);

      toast.success("Health service created successfully");

      // Redirect to the health services list
      router.push("/admin/health-services");
    } catch (error) {
      console.error("Error creating health service:", error);
      toast.error("Failed to create health service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/admin/health-services")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Health Services
      </Button>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Stethoscope className="h-5 w-5" /> Create New Health Service
          </CardTitle>
          <CardDescription>
            Add a new consultation service with details and requirements
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
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. General Consultation"
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
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Cardiology, General Medicine"
                            {...field}
                          />
                        </FormControl>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the consultation service..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of what this service includes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Details */}
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
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
                          Estimated consultation time
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
                          Service price (0 for free)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="consultation"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Type of service offered
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Service</FormLabel>
                        <FormDescription>
                          Enable this service for booking and display
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Requirements Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Requirements</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRequirement}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Requirement
                    </Button>
                  </div>

                  {requirements.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <div className="text-muted-foreground">
                        <p>No requirements added yet</p>
                        <p className="text-sm mt-1">
                          Click &quot;Add Requirement&quot; to specify any prerequisites
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`requirements.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder={`Requirement ${index + 1}`}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRequirement(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contraindications Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Contraindications</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addContraindication}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Contraindication
                    </Button>
                  </div>

                  {contraindications.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <div className="text-muted-foreground">
                        <p>No contraindications added yet</p>
                        <p className="text-sm mt-1">
                          Click &quot;Add Contraindication&quot; to specify any restrictions
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contraindications.map((contraindication, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`contraindications.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder={`Contraindication ${index + 1}`}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeContraindication(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Service
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