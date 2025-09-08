"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import { useTranslation } from "react-i18next";
import { consultationServiceApi } from "@/services/consultationService.service";
import { specialtyService } from "@/services";
import { ConsultationService, PaginationInfo, Specialty } from "@/types";
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
import { formatDate } from "@/utils/date";
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
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  CalendarDays,
  Clock,
  Filter,
  DollarSign,
  User,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
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

export default function AdminHealthServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<
    string | null
  >(null);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
  const [allDoctors, setAllDoctors] = useState<string[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const router = useRouter();

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const itemsPerPage = 10;

  // Fetch specialties and doctors for filter dropdowns
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoadingFilters(true);

        // Fetch specialties from dedicated service - this is much more efficient
        const specialties = await specialtyService.getAll();
        setAllSpecialties(specialties);

        // Fetch services to extract unique doctors (could be improved with dedicated endpoint)
        const response = await consultationServiceApi.getMany({
          options: {
            filter: {},
            pagination: { page: 1, limit: 1000 }, // Get all for filter options
            sort: { createdAt: -1 },
          },
        });

        const doctors = [
          ...new Set(
            response.data.map((service) => service.doctor).filter(Boolean)
          ),
        ];

        setAllDoctors(doctors as string[]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
        toast.error("Failed to load filter options");
      } finally {
        setIsLoadingFilters(false);
      }
    };
    fetchFilterData();
  }, []);

  // Fetch services with pagination
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Set searching state when there's a debounced search query
        if (debouncedSearchQuery.trim()) {
          setIsSearching(true);
        } else {
          setLoading(true);
        }

        // Build MongoDB-style filter object
        const filter: Record<string, unknown> = {};

        // Add search as name filter (using regex for partial matching)
        if (debouncedSearchQuery.trim()) {
          filter.name = { $regex: debouncedSearchQuery.trim(), $options: "i" };
        }

        // Add specialization filter
        if (specializationFilter !== null) {
          filter.specialization = specializationFilter; // Now filtering by _id
        } else {
          delete filter.specialization;
        }

        // Add doctor filter
        if (doctorFilter !== "all") {
          filter.doctor = doctorFilter;
        }

        // Add duration filter
        if (durationFilter) {
          filter.duration = parseInt(durationFilter);
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
          populateOptions: {
            path: "specialization",
            select: ["name", "description"],
          },
          sort: { createdAt: -1 }, // Sort by newest first
        };

        const response = await consultationServiceApi.getMany({
          options,
        });
        setServices(response.data);
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to fetch health services");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchServices();
  }, [
    currentPage,
    debouncedSearchQuery,
    specializationFilter,
    doctorFilter,
    durationFilter,
    minPriceFilter,
    maxPriceFilter,
  ]);

  // Reset to first page when search query changes (but not when currentPage changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchQuery,
    specializationFilter,
    doctorFilter,
    durationFilter,
    minPriceFilter,
    maxPriceFilter,
  ]); // Only depend on filters, not currentPage

  const handleCreateService = () => {
    router.push("/admin/health-services/create");
  };

  const handleEditService = (id: string) => {
    router.push(`/admin/health-services/edit/${id}`);
  };

  const handleViewService = (id: string) => {
    router.push(`/admin/health-services/${id}`);
  };

  const confirmDelete = (id: string) => {
    setServiceToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      await consultationServiceApi.delete(serviceToDelete);
      // Refresh the current page with all current filters
      const refreshFilter: Record<string, unknown> = {};

      // Add search as name filter (using regex for partial matching)
      if (debouncedSearchQuery.trim()) {
        refreshFilter.name = {
          $regex: debouncedSearchQuery.trim(),
          $options: "i",
        };
      }

      // Add specialization filter
      if (specializationFilter !== null) {
        refreshFilter.specialization = specializationFilter; // Now filtering by _id
      }

      // Add doctor filter
      if (doctorFilter !== "all") {
        refreshFilter.doctor = doctorFilter;
      }

      // Add duration filter
      if (durationFilter) {
        refreshFilter.duration = parseInt(durationFilter);
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

      const response = await consultationServiceApi.getMany({
        options: refreshOptions,
      });
      setServices(response.data);
      setPaginationInfo(response.pagination);

      toast.success("Health service deleted successfully");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete health service");
    } finally {
      setServiceToDelete(null);
      setIsDeleteAlertOpen(false);
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
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> {t("admin.healthServices.title")}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {t("admin.healthServices.subtitle")}
              </CardDescription>
            </div>
            <Button onClick={handleCreateService} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> {t("admin.healthServices.createNewService")}
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
                  isSearching ? t("admin.healthServices.searching") : t("admin.healthServices.searchServices")
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
              {/* Specialization Filter */}
              <Select
                value={specializationFilter || "all"}
                onValueChange={setSpecializationFilter}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="w-4 h-4" />
                  <SelectValue
                    placeholder={
                      isLoadingFilters ? t("admin.healthServices.loading") : t("admin.healthServices.specialization")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.healthServices.allSpecializations")}</SelectItem>
                  {allSpecialties.map((specialty) => (
                    <SelectItem
                      key={specialty._id}
                      value={specialty._id}
                      className="capitalize"
                    >
                      {specialty.name}
                      {specialty.description && (
                        <span className="text-xs text-muted-foreground block">
                          {specialty.description.length > 50
                            ? `${specialty.description.substring(0, 50)}...`
                            : specialty.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Doctor Filter */}
              <Select
                value={doctorFilter}
                onValueChange={setDoctorFilter}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <User className="w-4 h-4" />
                  <SelectValue
                    placeholder={isLoadingFilters ? t("admin.healthServices.loading") : t("admin.healthServices.doctor")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.healthServices.allDoctors")}</SelectItem>
                  {allDoctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>
                      {doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Duration Filter */}
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t("admin.healthServices.durationMin")}
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="pl-10 w-[140px]"
                  type="number"
                  min="0"
                />
              </div>

              {/* Price Range Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t("admin.healthServices.minPrice")}
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
                    placeholder={t("admin.healthServices.maxPrice")}
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
                  setSpecializationFilter("all");
                  setDoctorFilter("all");
                  setDurationFilter("");
                  setMinPriceFilter("");
                  setMaxPriceFilter("");
                }}
                className="w-full sm:w-auto"
                disabled={isSearching}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("admin.healthServices.resetAll")}
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(searchQuery ||
            specializationFilter !== null ||
            doctorFilter !== "all" ||
            durationFilter ||
            minPriceFilter ||
            maxPriceFilter) && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg flex-wrap">
              <span className="text-sm text-muted-foreground">
                {t("admin.healthServices.activeFilters")}:
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
              {specializationFilter !== null && (
                <Badge variant="secondary" className="gap-1">
                  Specialization:{" "}
                  {allSpecialties.find((s) => s._id === specializationFilter)
                    ?.name || specializationFilter}
                  <button
                    onClick={() => setSpecializationFilter(null)}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {doctorFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Doctor: {doctorFilter}
                  <button
                    onClick={() => setDoctorFilter("all")}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {durationFilter && (
                <Badge variant="secondary" className="gap-1">
                  Duration: {durationFilter} min
                  <button
                    onClick={() => setDurationFilter("")}
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
                of {paginationInfo.total} service
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
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Stethoscope className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t("admin.healthServices.noServicesFound")}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ||
                specializationFilter !== "all" ||
                doctorFilter !== "all" ||
                durationFilter ||
                minPriceFilter ||
                maxPriceFilter
                  ? t("admin.healthServices.noServicesMatchFilters")
                  : t("admin.healthServices.noServicesCreated")}
              </p>
              {searchQuery ||
              specializationFilter !== "all" ||
              doctorFilter !== "all" ||
              durationFilter ||
              minPriceFilter ||
              maxPriceFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSpecializationFilter("all");
                    setDoctorFilter("all");
                    setDurationFilter("");
                    setMinPriceFilter("");
                    setMaxPriceFilter("");
                  }}
                >
                  {t("admin.healthServices.clearFilters")}
                </Button>
              ) : (
                <Button onClick={handleCreateService}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.healthServices.createFirstService")}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">{t("admin.healthServices.serviceName")}</TableHead>
                      <TableHead>{t("admin.healthServices.specialization")}</TableHead>
                      <TableHead>{t("admin.healthServices.duration")}</TableHead>
                      <TableHead>{t("admin.healthServices.price")}</TableHead>
                      <TableHead>{t("admin.healthServices.created")}</TableHead>
                      <TableHead className="text-right">{t("admin.healthServices.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[280px]">
                            <p className="truncate text-sm font-medium">
                              {service.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {service.description
                                ? service.description.substring(0, 80) + "..."
                                : t("admin.healthServices.noDescription")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {typeof service.specialization === "string"
                              ? service.specialization
                              : service.specialization?.name || t("admin.healthServices.general")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {service.duration} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-primary">
                            {service.price === 0
                              ? t("admin.healthServices.free")
                              : formatCurrency(service.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {service.createdAt
                              ? formatDate(service.createdAt)
                              : t("admin.healthServices.notAvailable")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t("admin.healthServices.openMenu")}</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("admin.healthServices.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewService(service._id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {t("admin.healthServices.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditService(service._id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("admin.healthServices.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => confirmDelete(service._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("admin.healthServices.delete")}
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
                    {t("admin.healthServices.previous")}
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
                    {t("admin.healthServices.next")}
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
            <AlertDialogTitle>{t("admin.healthServices.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.healthServices.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.healthServices.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t("admin.healthServices.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
