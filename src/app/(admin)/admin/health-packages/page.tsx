"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { ConsultationPackage, PaginationInfo } from "@/types";
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
  CalendarDays
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
  const [packages, setPackages] = useState<ConsultationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const router = useRouter();
  const { toast } = useToast();

  const itemsPerPage = 10;

  // Fetch packages with pagination
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: itemsPerPage
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (categoryFilter !== "all") {
          params.category = categoryFilter;
        }

        if (sortBy !== "createdAt") {
          params.sortBy = sortBy;
        }

        const response = await consultationPackageService.getPaginated(params);
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
      }
    };

    fetchPackages();
  }, [categoryFilter, currentPage, searchQuery, sortBy, toast]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy]);

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
      // Refresh the current page
      const refreshParams: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchQuery.trim()) {
        refreshParams.search = searchQuery.trim();
      }

      if (categoryFilter !== "all") {
        refreshParams.category = categoryFilter;
      }

      if (sortBy !== "createdAt") {
        refreshParams.sortBy = sortBy;
      }

      const response = await consultationPackageService.getPaginated(refreshParams);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
                <Package className="h-5 w-5" /> Health Packages Management
              </CardTitle>
              <CardDescription className="mt-1.5">
                Manage all health packages available to users
              </CardDescription>
            </div>
            <Button onClick={handleCreatePackage} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Create New Package
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
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
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Sort by Date</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setSortBy("createdAt");
                }}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(searchQuery || categoryFilter !== "all" || sortBy !== "createdAt") && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
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
              {sortBy !== "createdAt" && (
                <Badge variant="secondary" className="gap-1">
                  Sort: {sortBy}
                  <button
                    onClick={() => setSortBy("createdAt")}
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
                Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1}-{Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of {paginationInfo.total} package{paginationInfo.total !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
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
              <h3 className="text-lg font-medium mb-2">No packages found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || categoryFilter !== "all" || sortBy !== "createdAt"
                  ? "No packages match your current filters."
                  : "No health packages have been created yet."
                }
              </p>
              {searchQuery || categoryFilter !== "all" || sortBy !== "createdAt" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setSortBy("createdAt");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={handleCreatePackage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first package
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Package Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg._id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[280px]">
                            <p className="truncate text-sm font-medium">{pkg.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {pkg.description ? pkg.description.substring(0, 80) + "..." : "No description"}
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
                            {pkg.price === 0 ? "Free" : formatCurrency(pkg.price)}
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
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewPackage(pkg._id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPackage(pkg._id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(pkg._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
              This action cannot be undone. This will permanently delete the health package
              and remove all associated data.
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
