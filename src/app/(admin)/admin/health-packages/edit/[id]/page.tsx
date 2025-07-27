"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConsultationPackage } from "@/types";
import { consultationPackageService } from "@/services/consultationPackage.service";
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
  Trash2,
  Edit,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Schema for form validation - updated to match ConsultationPackage interface
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  titleImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.number().min(0, "Price must be a positive number"),
  maxSlotPerPeriod: z.number().min(1, "Must be at least 1").optional(),
  tests: z.array(z.string().min(1, "Test name cannot be empty")),
});

export default function EditHealthPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPackage, setOriginalPackage] = useState<ConsultationPackage | null>(null);
  const [id, setId] = useState<string>("");
  const [editingTestIndex, setEditingTestIndex] = useState<number | null>(null);
  const [editingTestValue, setEditingTestValue] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      titleImage: "",
      price: 0,
      maxSlotPerPeriod: 10,
      tests: [],
    },
  });

  // Watch form values to enable dynamic updates
  const tests = form.watch("tests");

  // Add a new empty test field
  const addTest = () => {
    form.setValue("tests", [...tests, ""]);
  };

  // Remove a test at specified index
  const removeTest = (index: number) => {
    const updatedTests = tests.filter((_, i) => i !== index);
    form.setValue("tests", updatedTests);
  };

  // Start editing a test
  const startEditingTest = (index: number) => {
    setEditingTestIndex(index);
    setEditingTestValue(tests[index]);
  };

  // Save edited test
  const saveEditingTest = () => {
    if (editingTestIndex !== null && editingTestValue.trim() !== "") {
      const updatedTests = [...tests];
      updatedTests[editingTestIndex] = editingTestValue.trim();
      form.setValue("tests", updatedTests);
      setEditingTestIndex(null);
      setEditingTestValue("");
    }
  };

  // Cancel editing test
  const cancelEditingTest = () => {
    setEditingTestIndex(null);
    setEditingTestValue("");
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
          tests: data.tests || [],
        });
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
      
      // Filter out any empty tests
      const sanitizedData = {
        ...data,
        tests: data.tests.filter(test => test.trim() !== ""),
      };
      
      await consultationPackageService.update(id, {
        ...sanitizedData,
        // Preserve other fields from the original package that aren't in the form
        icon: originalPackage.icon,
        priceOptions: originalPackage.priceOptions,
        faq: originalPackage.faq,
        bookingOptions: originalPackage.bookingOptions,
        features: originalPackage.features,
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. General Health, Specialized Care" {...field} />
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
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL of the image to display for this package
                      </FormDescription>
                      <FormMessage />
                      
                      {/* Image Preview Section */}
                      {field.value && field.value.trim() !== "" && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Preview</h4>
                          <div className="relative w-full max-w-md">
                            <img
                              src={field.value}
                              alt="Package preview"
                              className="w-full h-48 aspect-video object-cover rounded-lg border shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = 'block';
                              }}
                              onLoad={(e) => {
                                e.currentTarget.style.display = 'block';
                                const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = 'none';
                              }}
                            />
                            <div 
                              className="hidden w-full h-48 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center bg-red-50"
                            >
                              <div className="text-center">
                                <div className="text-red-500 mb-2">
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-red-600 font-medium">Failed to load image</p>
                                <p className="text-xs text-red-500 mt-1">Please check the URL</p>
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of schedules that can be booked for this package per period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tests Management Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Tests Included</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addTest}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Test
                    </Button>
                  </div>
                  
                  {tests.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <div className="text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2" />
                        <p>No tests added yet</p>
                        <p className="text-sm mt-1">Click "Add Test" to include tests in this package</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tests.map((test, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                          
                          {editingTestIndex === index ? (
                            <>
                              <Input
                                value={editingTestValue}
                                onChange={(e) => setEditingTestValue(e.target.value)}
                                placeholder="Enter test name"
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveEditingTest();
                                  } else if (e.key === 'Escape') {
                                    cancelEditingTest();
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={saveEditingTest}
                                disabled={editingTestValue.trim() === ""}
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditingTest}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{test || "Unnamed test"}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingTest(index)}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTest(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {tests.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <p><span className="font-medium">Total Tests:</span> {tests.length}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          All tests listed above will be included in this health package.
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
        </CardContent>
      </Card>
    </div>
  );
} 