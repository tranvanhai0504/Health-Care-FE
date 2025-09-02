"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import { useTranslation } from "react-i18next";
import { consultationPackageService } from "@/services/consultationPackage.service";
import {
  ConsultationPackage,
  PaginationInfo,
} from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  CalendarDays,
  Filter,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminHealthPackagesPage() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<ConsultationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const router = useRouter();
  const { toast } = useToast();

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const itemsPerPage = 10;

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await consultationPackageService.getMany({
          options: {
            filter: {},
            pagination: { page: 1, limit: 1000 }, // Get all for categories
            sort: { category: 1 },
          },
        });
        const categories = [
          ...new Set(response.data.map((pkg) => pkg.category)),
        ];
        setAllCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch packages with pagination
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Set searching state when there's a debounced search query
        if (debouncedSearchQuery.trim()) {
          setIsSearching(true);
        } else {
          setLoading(true);
        }

        // Build MongoDB-style filter object
        const filter: Record<string, unknown> = {};

        // Add search as title filter (using regex for partial matching)
        if (debouncedSearchQuery.trim()) {
          filter.title = { $regex: debouncedSearchQuery.trim(), $options: "i" };
        }

        // Add category filter
        if (categoryFilter !== "all") {
          filter.category = categoryFilter;
        }

        // Add price range filter
        if (minPriceFilter || maxPriceFilter) {
          const priceFilter: Record<string, number> = {};
          if (minPriceFilter) {
            priceFilter.$gte = parseFloat(minPriceFilter);
          }
          if (maxPriceFilter) {
            priceFilter.$lte = parseFloat(maxPriceFilter);
          }
          filter.price = priceFilter;
        }

        // Build the options object with MongoDB-style syntax
        const options = {
          filter,
          pagination: {
            page: currentPage,
            limit: itemsPerPage,
          },
          sort: { createdAt: -1 }, // Sort by newest first
        };

        console.log("Making API call with options:", options);
        const response = await consultationPackageService.getMany({
          options,
        });
        setPackages(response.data);
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast({
          title: "Error",
          description: "Failed to fetch health packages",
          type: "error",
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    debouncedSearchQuery,
    categoryFilter,
    minPriceFilter,
    maxPriceFilter,
  ]);

  // Reset to first page when filters change (but not when currentPage changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, categoryFilter, minPriceFilter, maxPriceFilter]); // Only depend on filters, not currentPage

  const handleCreatePackage = () => {
    router.push("/admin/health-packages/create");
  };

  const handleEditPackage = (id: string) => {
    router.push(`/admin/health-packages/edit/${id}`);
  };

  const handleViewPackage = (id: string) => {
    router.push(`/admin/health-packages/${id}`);
  };

  const confirmDelete = (id: string) => {
    setPackageToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;

    try {
      await consultationPackageService.delete(packageToDelete);
      // Refresh the current page with all current filters
      const refreshFilter: Record<string, unknown> = {};

      // Add search as title filter (using regex for partial matching)
      if (debouncedSearchQuery.trim()) {
        refreshFilter.title = { $regex: debouncedSearchQuery.trim(), $options: "i" };
      }

      // Add category filter
      if (categoryFilter !== "all") {
        refreshFilter.category = categoryFilter;
      }

      // Add price range filter
      if (minPriceFilter || maxPriceFilter) {
        const priceFilter: Record<string, number> = {};
        if (minPriceFilter) {
          priceFilter.$gte = parseFloat(minPriceFilter);
        }
        if (maxPriceFilter) {
          priceFilter.$lte = parseFloat(maxPriceFilter);
        }
        refreshFilter.price = priceFilter;
      }

      // Build the options object with MongoDB-style syntax
      const refreshOptions = {
        filter: refreshFilter,
        pagination: {
          page: currentPage,
          limit: itemsPerPage,
        },
        sort: { createdAt: -1 },
      };

      const response = await consultationPackageService.getMany({
        options: refreshOptions,
      });
      setPackages(response.data);
      setPaginationInfo(response.pagination);

      toast({
        title: "Success",
        description: "Health package deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete health package",
        type: "error",
      });
    } finally {
      setPackageToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="h-5 w-5" /> {t("admin.healthPackages.title")}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {t("admin.healthPackages.subtitle")}
              </CardDescription>
            </div>
            <Button onClick={handleCreatePackage} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> {t("admin.healthPackages.createNewPackage")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={
                  isSearching ? t("admin.healthPackages.searching") : t("admin.healthPackages.searchPackages")
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
                disabled={loading && !isSearching}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gray-600"
                  disabled={isSearching}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder={t("admin.healthPackages.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.healthPackages.allCategories")}</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t("admin.healthPackages.minPrice")}
                    value={minPriceFilter}
                    onChange={(e) => setMinPriceFilter(e.target.value)}
                    className="pl-10 w-[120px]"
                    type="number"
                    min="0"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t("admin.healthPackages.maxPrice")}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                    className="pl-10 w-[120px]"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setMinPriceFilter("");
                  setMaxPriceFilter("");
                }}
                className="w-full sm:w-auto"
                disabled={isSearching}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("admin.healthPackages.resetAll")}
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(searchQuery ||
            categoryFilter !== "all" ||
            minPriceFilter ||
            maxPriceFilter) && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg flex-wrap">
              <span className="text-sm text-muted-foreground">
                {t("admin.healthPackages.activeFilters")}:
              </span>
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
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {minPriceFilter && (
                <Badge variant="secondary" className="gap-1">
                  Min: ${minPriceFilter}
                  <button
                    onClick={() => setMinPriceFilter("")}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {maxPriceFilter && (
                <Badge variant="secondary" className="gap-1">
                  Max: ${maxPriceFilter}
                  <button
                    onClick={() => setMaxPriceFilter("")}
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
            <div className="mb-4">
              <Badge variant="outline" className="text-sm">
                Showing {(paginationInfo.page - 1) * paginationInfo.limit + 1}-
                {Math.min(
                  paginationInfo.page * paginationInfo.limit,
                  paginationInfo.total
                )}{" "}
                of {paginationInfo.total} package
                {paginationInfo.total !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t("admin.healthPackages.noPackagesFound")}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ||
                categoryFilter !== "all" ||
                minPriceFilter ||
                maxPriceFilter
                  ? t("admin.healthPackages.noPackagesMatchFilters")
                  : t("admin.healthPackages.noPackagesCreated")}
              </p>
              {searchQuery ||
              categoryFilter !== "all" ||
              minPriceFilter ||
              maxPriceFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setMinPriceFilter("");
                    setMaxPriceFilter("");
                  }}
                >
                  {t("admin.healthPackages.clearFilters")}
                </Button>
              ) : (
                <Button onClick={handleCreatePackage}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.healthPackages.createFirstPackage")}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">{t("admin.healthPackages.packageTitle")}</TableHead>
                      <TableHead>{t("admin.healthPackages.category")}</TableHead>
                      <TableHead>{t("admin.healthPackages.price")}</TableHead>
                      <TableHead>{t("admin.healthPackages.created")}</TableHead>
                      <TableHead className="text-right">{t("admin.healthPackages.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg._id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[280px]">
                            <p className="truncate text-sm font-medium">
                              {pkg.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {pkg.description
                                ? pkg.description.substring(0, 80) + "..."
                                : t("admin.healthPackages.noDescription")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {pkg.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-primary">
                            {pkg.price === 0
                              ? t("admin.healthPackages.free")
                              : formatCurrency(pkg.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {pkg.createdAt ? formatDate(pkg.createdAt) : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t("admin.healthPackages.openMenu")}</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("admin.healthPackages.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewPackage(pkg._id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {t("admin.healthPackages.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditPackage(pkg._id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("admin.healthPackages.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => confirmDelete(pkg._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("admin.healthPackages.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              health package and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePackage}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
