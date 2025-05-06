"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Calendar,
  Stethoscope,
  AlertCircle,
  ChevronRight,
  Package,
  CheckCircle,
  X,
  FileText,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Award,
  Clock,
  Users,
} from "lucide-react";
import {
  ConsultationPackage,
  consultationPackageService,
} from "@/services/consultationPackage";
import { BookPackageButton } from "@/components/packages/book-package-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { remark } from "remark";
import html from "remark-html";

const HealthPackageDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [packageData, setPackageData] = useState<ConsultationPackage | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriceOption, setSelectedPriceOption] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("details");
  const [description, setDescription] = useState<string>("");

  const convertMarkDown = async (content: string) => {
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString().replace(/\\n/g, '<br/>');

    setDescription(contentHtml);
  };

  // Simple function to format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const data = await consultationPackageService.getById(id);
        setPackageData(data);
        convertMarkDown(data.description);
        // Default to first price option
        if (data.priceOptions && data.priceOptions.length > 0) {
          setSelectedPriceOption(data.priceOptions[0].tier);
        }
      } catch (err) {
        console.error("Failed to fetch package details:", err);
        setError("Failed to load package details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackageData();
    }
  }, [id]);

  // Get tier badge color
  const getTierColor = (tier: string) => {
    const lowerTier = tier.toLowerCase();
    if (lowerTier.includes("premium") || lowerTier.includes("gold")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    } else if (lowerTier.includes("standard") || lowerTier.includes("silver")) {
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
    } else if (lowerTier.includes("basic") || lowerTier.includes("bronze")) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    } else if (lowerTier.includes("family")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  };

  // Render appropriate icon for tier
  const getTierIcon = (tier: string) => {
    const lowerTier = tier.toLowerCase();
    if (lowerTier.includes("premium") || lowerTier.includes("gold")) {
      return <Award className="h-4 w-4" />;
    } else if (lowerTier.includes("family")) {
      return <Users className="h-4 w-4" />;
    } else if (lowerTier.includes("plus")) {
      return <Sparkles className="h-4 w-4" />;
    }
    return <ShieldCheck className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="py-8 space-y-8 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="md:w-1/3">
            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch space-y-3">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="w-full mt-8">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-64 w-full mt-6 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="py-16 flex flex-col items-center">
        <div className="bg-red-50 dark:bg-red-950/30 p-12 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Oops, something went wrong</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {error ||
            "Package not found. Please try again or select a different package."}
        </p>
        <Button
          onClick={() => window.history.back()}
          size="lg"
          className="gap-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Go Back
        </Button>
      </div>
    );
  }

  const selectedOption = packageData.priceOptions.find(
    (option) => option.tier === selectedPriceOption
  );

  return (
    <div className="pb-8 space-y-10 max-w-7xl mx-auto px-4">
      {/* Package Header */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="mb-6">
            <div className="inline-flex mb-3">
              <Badge
                variant="outline"
                className="gap-1 px-2 py-1 border-primary/20 bg-primary/5 text-primary"
              >
                <Package className="h-3.5 w-3.5" />
                Health Package
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{packageData.title}</h1>
            <div
              className="prose prose-sm max-w-none text-lg text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {/* Features highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {packageData.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-1/3">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Package Options
              </CardTitle>
              <CardDescription>
                Select the package tier that fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {/* Price options selection */}
              <div className="mb-4">
                <div className="flex flex-col space-y-3">
                  {packageData.priceOptions.map((option) => (
                    <div
                      key={option.tier}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        selectedPriceOption === option.tier
                          ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                          : "hover:border-primary/40 hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedPriceOption(option.tier)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{option.tier}</h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            <span>{option.testsIncluded} tests included</span>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(option.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-3 pt-2 pb-4">
              <BookPackageButton
                packageId={id}
                size="lg"
                className="gap-2 min-w-40 h-12"
                label="Book Online Now"
              >
                <Calendar className="h-5 w-5" />
              </BookPackageButton>

              {packageData.bookingOptions.map((option, index) => (
                <Button
                  key={index}
                  className="w-full h-11 flex gap-2 justify-center"
                  variant="outline"
                  asChild
                >
                  <a
                    href={`${option.actionUrl}?package=${id}&tier=${selectedPriceOption}`}
                    className="whitespace-normal text-wrap flex justify-center w-full"
                  >
                    {option.type === "Branch" ? (
                      <Stethoscope className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-center">{option.description}</span>
                  </a>
                </Button>
              ))}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Package Details Tabs */}
      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-8"
      >
        <TabsList className="bg-muted/50 p-1 h-auto w-full md:w-auto flex-wrap justify-start">
          <TabsTrigger
            value="details"
            className="px-4 py-2 data-[state=active]:bg-background"
          >
            <FileText className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="px-4 py-2 data-[state=active]:bg-background"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger
            value="faq"
            className="px-4 py-2 data-[state=active]:bg-background"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-4 bg-muted/30">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Package Details
              </CardTitle>
              <CardDescription>
                Everything included in the {selectedOption?.tier} package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-medium mb-3 text-lg flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Description
                </h3>
                <div 
                  className="text-muted-foreground pl-8 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>

              <div>
                <h3 className="font-medium mb-3 text-lg flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Features
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 pl-8">
                  {packageData.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-lg flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Package Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-8">
                  {packageData.priceOptions.map((option) => (
                    <Card
                      key={option.tier}
                      className={cn(
                        "border overflow-hidden transition-all hover:shadow-md",
                        option.tier === selectedPriceOption
                          ? "border-primary shadow-sm"
                          : "hover:border-primary/30"
                      )}
                    >
                      <div
                        className={cn(
                          "h-1.5 w-full",
                          getTierColor(option.tier)
                        )}
                      />
                      <CardHeader className="pb-2 pt-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {option.tier}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="text-xs font-normal px-1.5"
                          >
                            {getTierIcon(option.tier)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-2xl font-bold mb-1 text-primary">
                          {formatCurrency(option.price)}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          <span>Includes {option.testsIncluded} tests</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-4 bg-muted/30">
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                Included Tests
              </CardTitle>
              <CardDescription>
                Tests and examinations included in the {selectedOption?.tier}{" "}
                package
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {packageData.tests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageData.tests.map((test, index) => (
                    <div
                      key={index}
                      className="border border-border/60 rounded-md p-4 flex items-start hover:border-primary/30 hover:bg-muted/10 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Test {index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {test}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <X className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground">
                    No tests information available for this package
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-4 bg-muted/30">
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Common questions about the {packageData.title} package
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {packageData.faq.length > 0 ? (
                <div className="space-y-6">
                  {packageData.faq.map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-border/60 pb-5 last:border-b-0 last:pb-0"
                    >
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <HelpCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        {item.question}
                      </h3>
                      <p className="text-muted-foreground pl-7">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <X className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground">
                    No FAQs available for this package
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking CTA */}
      <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to book this package?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Take the first step towards better health by booking this package
          today. Our team of medical professionals is ready to assist you.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <BookPackageButton
            packageId={id}
            size="lg"
            className="gap-2 min-w-40 h-12"
            label="Book Online Now"
          >
            <Calendar className="h-5 w-5" />
          </BookPackageButton>

          {packageData.bookingOptions.map((option, index) => (
            <Button
              key={index}
              size="lg"
              variant="outline"
              className="h-12 min-w-40 gap-2"
              asChild
            >
              <a
                href={`${option.actionUrl}?package=${id}&tier=${selectedPriceOption}`}
              >
                {option.type === "Branch" ? (
                  <Stethoscope className="h-5 w-5" />
                ) : (
                  <Calendar className="h-5 w-5" />
                )}
                {option.type === "Branch"
                  ? "Book at Clinic"
                  : "Book Home Visit"}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthPackageDetailsPage;
