"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ConsultationPackage,
  consultationPackageService,
} from "@/services/consultationPackage";
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
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Package,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Schema for form validation - simplified version
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(z.string()),
  maxSlotPerPeriod: z.number().optional(),
});

export default function EditHealthPackagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPackage, setOriginalPackage] = useState<ConsultationPackage | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      features: [""],
      maxSlotPerPeriod: 10,
    },
  });

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const data = await consultationPackageService.getById(params.id);
        setOriginalPackage(data);
        
        // Set form values from fetched data
        form.reset({
          title: data.title,
          description: data.description,
          features: data.features.length > 0 ? data.features : [""],
          maxSlotPerPeriod: data.maxSlotPerPeriod || 10,
        });
      } catch (error) {
        console.error("Error fetching package details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch package details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [params.id, form]);

  // Watch form values to enable dynamic updates
  const features = form.watch("features");

  // Add a new empty feature field
  const addFeature = () => {
    form.setValue("features", [...features, ""]);
  };

  // Remove a feature at specified index
  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    form.setValue("features", updatedFeatures);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!originalPackage) return;
    
    try {
      setIsSubmitting(true);
      
      // Remove any empty features
      const sanitizedData = {
        ...data,
        features: data.features.filter(feature => feature.trim() !== ""),
      };
      
      await consultationPackageService.update(params.id, {
        ...sanitizedData,
        // Preserve other fields from the original package
        icon: originalPackage.icon,
        priceOptions: originalPackage.priceOptions,
        tests: originalPackage.tests,
        faq: originalPackage.faq,
        bookingOptions: originalPackage.bookingOptions,
      });
      
      toast({
        title: "Success",
        description: "Health package updated successfully",
      });
      
      // Redirect to the package details
      router.push(`/admin/health-packages/${params.id}`);
    } catch (error) {
      console.error("Error updating health package:", error);
      toast({
        title: "Error",
        description: "Failed to update health package",
        variant: "destructive",
      });
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
        onClick={() => router.push(`/admin/health-packages/${params.id}`)}
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
              <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Complete Health Checkup" {...field} />
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
                          <Textarea 
                            placeholder="Describe the health package" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of appointments that can be booked for this package per period
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("features")}
                    >
                      Next: Features
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="space-y-6 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Package Features</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addFeature}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`features.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder={`Feature ${index + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                            disabled={features.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Previous
                    </Button>
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
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
} 