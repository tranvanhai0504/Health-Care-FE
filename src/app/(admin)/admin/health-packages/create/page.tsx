"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreateConsultationPackageData,
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Package,
  Plus,
  Trash2,
  ArrowLeft,
  Info,
  Tag,
  DollarSign,
  HelpCircle,
  CalendarClock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Schema for price option
const priceOptionSchema = z.object({
  tier: z.string().min(1, "Tier name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  testsIncluded: z.number().min(0, "Number of tests must be a positive number"),
});

// Schema for FAQ
const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

// Schema for booking option
const bookingOptionSchema = z.object({
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  actionUrl: z.string().url("Action URL must be a valid URL"),
});

// Main form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  icon: z.string().min(1, "Icon is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(z.string()),
  priceOptions: z.array(priceOptionSchema),
  tests: z.array(z.string()),
  faq: z.array(faqSchema),
  bookingOptions: z.array(bookingOptionSchema),
  maxSlotPerPeriod: z.number().optional(),
});

export default function CreateHealthPackagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  
  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      icon: "package",
      description: "",
      features: [""],
      priceOptions: [
        {
          tier: "Basic",
          price: 0,
          testsIncluded: 0,
        },
      ],
      tests: [""],
      faq: [
        {
          question: "",
          answer: "",
        },
      ],
      bookingOptions: [
        {
          type: "Online",
          description: "Book your appointment online",
          actionUrl: "https://example.com/book",
        },
      ],
      maxSlotPerPeriod: 10,
    },
  });
  
  // Watch form values to enable dynamic updates
  const features = form.watch("features");
  const priceOptions = form.watch("priceOptions");
  const tests = form.watch("tests");
  const faq = form.watch("faq");
  const bookingOptions = form.watch("bookingOptions");
  
  // Add a new empty feature field
  const addFeature = () => {
    form.setValue("features", [...features, ""]);
  };
  
  // Remove a feature at specified index
  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    form.setValue("features", updatedFeatures);
  };
  
  // Add a new empty test field
  const addTest = () => {
    form.setValue("tests", [...tests, ""]);
  };
  
  // Remove a test at specified index
  const removeTest = (index: number) => {
    const updatedTests = tests.filter((_, i) => i !== index);
    form.setValue("tests", updatedTests);
  };
  
  // Add a new price option with default values
  const addPriceOption = () => {
    form.setValue("priceOptions", [
      ...priceOptions,
      {
        tier: "",
        price: 0,
        testsIncluded: 0,
      },
    ]);
  };
  
  // Remove a price option at specified index
  const removePriceOption = (index: number) => {
    const updatedPriceOptions = priceOptions.filter((_, i) => i !== index);
    form.setValue("priceOptions", updatedPriceOptions);
  };
  
  // Add a new FAQ with default values
  const addFaq = () => {
    form.setValue("faq", [
      ...faq,
      {
        question: "",
        answer: "",
      },
    ]);
  };
  
  // Remove an FAQ at specified index
  const removeFaq = (index: number) => {
    const updatedFaq = faq.filter((_, i) => i !== index);
    form.setValue("faq", updatedFaq);
  };
  
  // Add a new booking option with default values
  const addBookingOption = () => {
    form.setValue("bookingOptions", [
      ...bookingOptions,
      {
        type: "",
        description: "",
        actionUrl: "",
      },
    ]);
  };
  
  // Remove a booking option at specified index
  const removeBookingOption = (index: number) => {
    const updatedBookingOptions = bookingOptions.filter((_, i) => i !== index);
    form.setValue("bookingOptions", updatedBookingOptions);
  };
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Remove any empty features
      const sanitizedData = {
        ...data,
        features: data.features.filter(feature => feature.trim() !== ""),
        tests: data.tests.filter(test => test.trim() !== ""),
      };
      
      await consultationPackageService.create(sanitizedData);
      
      toast({
        title: "Success",
        description: "Health package created successfully",
        type: "success",
      });
      
      // Redirect to the health packages list
      router.push("/admin/health-packages");
    } catch (error) {
      console.error("Error creating health package:", error);
      toast({
        title: "Error",
        description: "Failed to create health package",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.push("/admin/health-packages")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Health Packages
      </Button>
      
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="h-5 w-5" /> Create New Health Package
          </CardTitle>
          <CardDescription>
            Add a new health package with details, pricing, and features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
                  <TabsTrigger value="basic" className="flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    <span className="hidden sm:inline">Basic Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span className="hidden sm:inline">Features</span>
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Pricing</span>
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">FAQ</span>
                  </TabsTrigger>
                  <TabsTrigger value="booking" className="flex items-center gap-1">
                    <CalendarClock className="h-4 w-4" />
                    <span className="hidden sm:inline">Booking</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
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
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. package" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter an icon name from Lucide Icons
                          </FormDescription>
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
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
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
                    
                    <div className="space-y-3">
                      {tests.map((test, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`tests.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder={`Test ${index + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTest(index)}
                            disabled={tests.length <= 1}
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
                      type="button" 
                      onClick={() => setActiveTab("pricing")}
                    >
                      Next: Pricing
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-6 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Price Options</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addPriceOption}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Price Option
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {priceOptions.map((option, index) => (
                        <Card key={index} className="relative">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex justify-between items-center">
                              <span>Price Option {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removePriceOption(index)}
                                disabled={priceOptions.length <= 1}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`priceOptions.${index}.tier`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tier Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Basic, Premium" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`priceOptions.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`priceOptions.${index}.testsIncluded`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tests Included</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("features")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("faq")}
                    >
                      Next: FAQ
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="faq" className="space-y-6 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addFaq}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add FAQ
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {faq.map((item, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex justify-between items-center">
                              <span>FAQ {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFaq(index)}
                                disabled={faq.length <= 1}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`faq.${index}.question`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Question</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter question" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`faq.${index}.answer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Answer</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Enter answer" 
                                      className="min-h-[100px]" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("pricing")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("booking")}
                    >
                      Next: Booking Options
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="booking" className="space-y-6 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Booking Options</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addBookingOption}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Booking Option
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {bookingOptions.map((option, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex justify-between items-center">
                              <span>Booking Option {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBookingOption(index)}
                                disabled={bookingOptions.length <= 1}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`bookingOptions.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Online, Phone" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`bookingOptions.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Brief description" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`bookingOptions.${index}.actionUrl`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Action URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/book" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("faq")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Health Package"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 