"use client";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import {
  ConsultationPackage as BaseConsultationPackage,
  consultationPackageService,
} from "@/services/consultationPackage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, PackageCheck, ArrowRight, Filter, Tag, BadgeCheck, Calendar, Clock, Users, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookPackageButton } from "@/components/packages/book-package-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend the base type with our UI-specific properties
interface ConsultationPackage extends BaseConsultationPackage {
  category?: string;
  isPopular?: boolean;
  duration?: string;
  consultations?: number;
  forFamily?: boolean;
  popularity?: number;
}

// Type for badge variants
type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const HealthPackagesPage = () => {
  const [packages, setPackages] = useState<ConsultationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true);
        const data = await consultationPackageService.getAll();
        // Cast as ConsultationPackage[] since we're extending the base type
        setPackages(data as ConsultationPackage[]);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, []);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get categories from packages
  const getCategories = () => {
    const categories = packages.map(pkg => pkg.category).filter(Boolean);
    return ["all", ...Array.from(new Set(categories as string[]))];
  };

  // Filter packages based on search query and category
  const filterPackages = () => {
    let filtered = packages;
    
    // Apply category filter (if not 'all')
    if (activeCategory !== "all") {
      filtered = filtered.filter(pkg => pkg.category === activeCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "price-low":
        return filtered.sort((a, b) => {
          const aMinPrice = Math.min(...(a.priceOptions?.map(opt => opt.price) || [0]));
          const bMinPrice = Math.min(...(b.priceOptions?.map(opt => opt.price) || [0]));
          return aMinPrice - bMinPrice;
        });
      case "price-high":
        return filtered.sort((a, b) => {
          const aMinPrice = Math.min(...(a.priceOptions?.map(opt => opt.price) || [0]));
          const bMinPrice = Math.min(...(b.priceOptions?.map(opt => opt.price) || [0]));
          return bMinPrice - aMinPrice;
        });
      case "popular":
        return filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case "newest":
        return filtered.sort((a, b) => 
          new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        );
      default:
        return filtered;
    }
  };

  const filteredPackages = filterPackages();

  const navigateToDetails = (id: string) => {
    router.push(`/health-packages/${id}`);
  };

  // Get a random badge type for visual variety
  const getBadgeVariant = (index: number): BadgeVariant => {
    const variants: BadgeVariant[] = ["default", "secondary", "outline", "destructive"];
    return variants[index % variants.length];
  };

  // Get a suitable background gradient for a package category
  const getCategoryGradient = (category?: string) => {
    if (!category) return "from-primary/10 to-primary/5";
    
    switch(category.toLowerCase()) {
      case "general":
        return "from-blue-100 to-blue-50 dark:from-blue-950/30 dark:to-blue-900/10";
      case "specialist":
        return "from-purple-100 to-purple-50 dark:from-purple-950/30 dark:to-purple-900/10";
      case "premium":
        return "from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-900/10";
      case "family":
        return "from-green-100 to-green-50 dark:from-green-950/30 dark:to-green-900/10";
      default:
        return "from-primary/10 to-primary/5";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Hero section */}
      <div className="mb-10 py-8 px-6 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent">
        <h1 className="text-4xl font-bold mb-3">Health Packages</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          Choose from our carefully designed health packages to ensure comprehensive care for you and your family. Each package is tailored to different healthcare needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="relative flex-grow max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search health packages..."
              className="pl-10 h-12 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-12 gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue placeholder="Sort packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Categories tabs */}
      <div className="mb-8">
        <Tabs 
          defaultValue="all" 
          value={activeCategory} 
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories:
          </div>
          <TabsList className="bg-muted/50 p-1 h-auto grid grid-cols-2 md:flex md:flex-wrap">
            {getCategories().map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="px-4 py-2 capitalize text-sm"
              >
                {category === "all" ? "All Packages" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border border-border/40">
              <div className="h-3 bg-primary/30 w-full" />
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-5 bg-muted rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-6 animate-pulse"></div>
                
                <div className="flex flex-col gap-2 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-muted/20">
          <PackageCheck className="mx-auto h-16 w-16 text-muted-foreground mb-6 opacity-70" />
          <h3 className="text-xl font-semibold mb-3">No packages found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery
              ? "We couldn't find any packages matching your search criteria."
              : "There are currently no health packages available in this category."}
          </p>
          <Button 
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredPackages.length}</span> packages
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <Card 
                key={pkg._id} 
                className="overflow-hidden flex flex-col h-full border border-border/40 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                {/* Colored top bar based on category */}
                <div className={cn(
                  "h-2 w-full bg-gradient-to-r", 
                  getCategoryGradient(pkg.category)
                )} />
                
                <CardHeader className="pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <CardTitle className="text-xl">{pkg.title}</CardTitle>
                        {pkg.isPopular && (
                          <Badge className="py-1 gap-1">
                            <Star className="h-3 w-3 fill-current" /> Popular
                          </Badge>
                        )}
                      </div>
                      {pkg.category && (
                        <Badge 
                          variant={getBadgeVariant(index)} 
                          className="mb-2 capitalize font-normal"
                        >
                          {pkg.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3 flex-grow">
                  {/* Package details */}
                  <div className="space-y-4">
                    {/* Starting price */}
                    {pkg.priceOptions && pkg.priceOptions.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm text-muted-foreground">Starting from</span>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(
                            Math.min(
                              ...pkg.priceOptions.map((option) => option.price)
                            )
                          )}
                        </p>
                      </div>
                    )}

                    {/* Package info */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      {pkg.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{pkg.duration}</span>
                        </div>
                      )}
                      
                      {pkg.consultations && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{pkg.consultations} visits</span>
                        </div>
                      )}
                      
                      {pkg.forFamily && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span>Family package</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Key benefits:</h4>
                      <ul className="space-y-1.5">
                        {pkg.features?.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <BadgeCheck className="h-4 w-4 text-primary mr-1.5 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{feature}</span>
                          </li>
                        ))}
                        {pkg.features && pkg.features.length > 3 && (
                          <li className="text-xs text-muted-foreground pl-6">
                            + {pkg.features.length - 3} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-3 flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors"
                    onClick={() => navigateToDetails(pkg._id)}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <BookPackageButton
                    packageId={pkg._id}
                    variant="default"
                    className="w-full"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Call to action section */}
      {!loading && filteredPackages.length > 0 && (
        <div className="mt-16 py-8 px-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-3">Need a custom health plan?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            We can create a customized health package specifically for your needs. Our healthcare specialists are ready to help.
          </p>
          <Button size="lg" className="gap-2">
            <PackageCheck className="h-5 w-5" />
            Request Custom Package
          </Button>
        </div>
      )}
    </div>
  );
};

export default HealthPackagesPage;
