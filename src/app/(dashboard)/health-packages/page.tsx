"use client";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { PaginationInfo, ConsultationPackage as BaseConsultationPackage } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";
import {
  Calendar,
  Star,
  Users,
  Clock,
  ArrowRight,
  Filter,
  Search,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Tag,
} from "lucide-react";
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
  isPopular?: boolean;
  duration?: string;
  consultations?: number;
  forFamily?: boolean;
  popularity?: number;
}

const HealthPackagesPage = () => {
  const [packages, setPackages] = useState<ConsultationPackage[]>([]);
  const [allPackages, setAllPackages] = useState<ConsultationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  const router = useRouter();

  const itemsPerPage = 12;

  // Fetch initial data for categories
  useEffect(() => {
    async function fetchAllPackages() {
      try {
        setLoading(true);
        const data = await consultationPackageService.getAll();
        setAllPackages(data as ConsultationPackage[]);
      } catch (error) {
        console.error("Error fetching all packages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPackages();
  }, []);

  // Fetch paginated packages
  useEffect(() => {
    async function fetchPaginatedPackages() {
      try {
        if (loading) return; // Don't fetch if still loading all packages
        
        // Build query parameters
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: itemsPerPage
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (activeCategory !== "all") {
          params.category = activeCategory;
        }

        if (sortOption !== "default") {
          params.sortBy = sortOption;
        }

        const response = await consultationPackageService.getPaginated(params);
        console.log(response);
        setPackages(response.data as ConsultationPackage[]);
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error("Error fetching paginated packages:", error);
      }
    }

    fetchPaginatedPackages();
  }, [currentPage, searchQuery, sortOption, activeCategory, loading]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption, activeCategory]);

  // Get categories from all packages
  const getCategories = () => {
    const categories = allPackages.map((pkg) => pkg.category);
    return ["all", ...Array.from(new Set(categories))];
  };

  const navigateToDetails = (id: string) => {
    router.push(`/health-packages/${id}`);
  };

  // Get a suitable background gradient for a package category
  const getCategoryGradient = (category?: string) => {
    if (!category) return "from-primary/10 to-primary/5";

    switch (category.toLowerCase()) {
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

  // Pagination helpers
  const totalPages = paginationInfo?.totalPages || 0;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    if (totalPages === 0) return [];
    
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - halfVisible);
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Hero section */}
      <div className="mb-10 py-8 px-6 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent">
        <h1 className="text-4xl font-bold mb-3">Health Packages</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          Choose from our carefully designed health packages to ensure
          comprehensive care for you and your family. Each package is tailored
          to different healthcare needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="relative flex-grow max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search health packages..."
              className="pl-10 h-12 w-full bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={sortOption} onValueChange={setSortOption}>
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
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSortOption("default");
              setActiveCategory("all");
            }}
            className="h-12 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
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
          <TabsList className="bg-muted/50 p-4 h-auto grid grid-cols-2 md:flex md:flex-wrap gap-2 justify-start">
            {getCategories().map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                asChild
                className="w-fit"
              >
                <Button
                  variant="ghost"
                  className="px-4 py-2 capitalize text-sm !w-fit"
                >
                  {category === "all" ? "All Packages" : category}
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Active filters display */}
      {(searchQuery || activeCategory !== "all" || sortOption !== "default") && (
        <div className="flex items-center gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {activeCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Category: {activeCategory}
              <button
                onClick={() => setActiveCategory("all")}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {sortOption !== "default" && (
            <Badge variant="secondary" className="gap-1">
              Sort: {sortOption}
              <button
                onClick={() => setSortOption("default")}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      {paginationInfo && (
        <div className="mb-6">
          <Badge variant="outline" className="text-sm">
            Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1}-{Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of {paginationInfo.total} package{paginationInfo.total !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

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
      ) : packages.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-muted/20">
          <PackageCheck className="mx-auto h-16 w-16 text-muted-foreground mb-6 opacity-70" />
          <h3 className="text-xl font-semibold mb-3">No packages found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || activeCategory !== "all" || sortOption !== "default"
              ? "We couldn't find any packages matching your search criteria."
              : "There are currently no health packages available."}
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setSortOption("default");
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg._id}
                className="overflow-hidden flex flex-col h-full border border-border/40 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                {/* Colored top bar based on category */}
                <div
                  className={cn(
                    "h-2 w-full bg-gradient-to-r",
                    getCategoryGradient(pkg.category)
                  )}
                />

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
                      <Badge
                        variant={"outline"}
                        className="mb-2 capitalize font-normal"
                      >
                        {pkg.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3 flex-grow">
                  {/* Package details */}
                  <div className="space-y-4">
                    {/* Package price */}
                    <div className="mb-4">
                      <span className="text-sm text-muted-foreground">
                        Price
                      </span>
                      <p className="text-2xl font-bold text-primary">
                        {pkg.price === 0 ? "Free" : formatCurrency(pkg.price)}
                      </p>
                    </div>

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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {getVisiblePages().map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Call to action section */}
      {!loading && packages.length > 0 && (
        <div className="mt-16 py-8 px-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Need a custom health plan?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            We can create a customized health package specifically for your
            needs. Our healthcare specialists are ready to help.
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
