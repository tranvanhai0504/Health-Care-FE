"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Stethoscope,
  Clock,
  Grid,
  List,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { consultationServiceApi } from "@/services/consultationService.service";
import { specialtyService } from "@/services/specialties.service";
import { ConsultationService, PaginationInfo, Specialty } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { AddToListButton } from "@/components/services-list";
import { useServiceListSafe } from "@/hooks/useServiceListSafe";
import { formatPrice, formatDuration } from "@/utils";

export default function ConsultationsPage() {
  const [consultationServices, setConsultationServices] = useState<
    ConsultationService[]
  >([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  });
  const router = useRouter();

  // Service list store for cart functionality
  const { getTotalServices, getTotalPrice, toggleList } = useServiceListSafe();

  // Fetch specialties for dropdown
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await specialtyService.getAll();

        // Handle different response structures
        let specialtiesData: Specialty[] = [];
        if (Array.isArray(response)) {
          specialtiesData = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response
        ) {
          const dataProperty = (response as { data: unknown }).data;
          if (Array.isArray(dataProperty)) {
            specialtiesData = dataProperty;
          }
        }

        setSpecialties(specialtiesData);
      } catch (error) {
        console.error("Error fetching specialties:", error);
        setSpecialties([]);
      }
    };
    fetchSpecialties();
  }, []);

  // Fetch services with pagination and filters
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Build filter object
        const filter: Record<string, unknown> = {};

        // Add search as name filter
        if (searchTerm.trim()) {
          filter.name = { $regex: searchTerm.trim(), $options: "i" };
        }

        // Add specialty filter
        if (selectedSpecialty !== "all") {
          filter.specialization = selectedSpecialty;
        }

        // Add type filter
        filter.type = "consultation";

        // Map sort options to appropriate field names
        let sortField = "name";
        let sortOrder = 1; // Default: A-Z

        if (sortBy === "price-low") {
          sortField = "price";
          sortOrder = 1;
        } else if (sortBy === "price-high") {
          sortField = "price";
          sortOrder = -1;
        } else if (sortBy === "duration") {
          sortField = "duration";
          sortOrder = 1;
        } else if (sortBy === "name") {
          sortField = "name";
          sortOrder = 1;
        }

        // Build the options object
        const options = {
          filter,
          pagination: {
            page: currentPage,
            limit: itemsPerPage,
          },
          sort: { [sortField]: sortOrder },
        };

        const response = await consultationServiceApi.getMany({
          options,
        });

        setConsultationServices(response.data as ConsultationService[]);
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error("Error fetching services:", error);
        setConsultationServices([]);
        setPaginationInfo({
          total: 0,
          page: 1,
          limit: itemsPerPage,
          totalPages: 0,
        });
      }
    };

    startTransition(() => {
      fetchServices();
    });
  }, [currentPage, itemsPerPage, searchTerm, selectedSpecialty, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty, sortBy]);

  const getSpecialtyName = (specialtyId?: string) => {
    if (!specialtyId) return "General";
    const specialty = specialties.find((s) => s._id === specialtyId);
    return specialty?.name || "Unknown";
  };

  // Pagination helpers
  const totalPages = paginationInfo?.totalPages || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Medical Consultation Services
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse our comprehensive range of medical services offered by expert
            healthcare professionals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm text-nowrap">
            {paginationInfo.total} total services
          </Badge>
          {getTotalServices() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleList}
              className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="font-medium">{getTotalServices()}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-semibold text-primary">
                {formatPrice(getTotalPrice())}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-6 mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty._id} value={specialty._id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-full"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none h-full"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {(searchTerm || selectedSpecialty !== "all") && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: &quot;{searchTerm}&quot;
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSpecialty !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {getSpecialtyName(selectedSpecialty)}
                <button
                  onClick={() => setSelectedSpecialty("all")}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("all");
              }}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
            {getTotalServices() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleList}
                className="gap-2 bg-primary/5 border-primary/20"
              >
                <ClipboardList className="h-4 w-4" />
                {getTotalServices()} in list
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isPending ? (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : consultationServices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm || selectedSpecialty !== "all"
              ? "No services match your current filters. Try adjusting your search criteria."
              : "No services are currently available."}
          </p>
          {getTotalServices() > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-2">
                You have {getTotalServices()} service
                {getTotalServices() !== 1 ? "s" : ""} in your list
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleList}
                className="gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                View Service List
              </Button>
            </div>
          )}
          {(searchTerm || selectedSpecialty !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("all");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {Array.isArray(consultationServices) &&
              consultationServices.map((service) => (
                <Card
                  key={service._id}
                  className={`group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/20 ${
                    viewMode === "list"
                      ? "flex flex-col sm:flex-row"
                      : "flex flex-col"
                  }`}
                >
                  <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                    <CardHeader
                      className={`${viewMode === "list" ? "pb-2" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary font-medium"
                        >
                          {formatPrice(service.price)}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 group-hover:text-primary transition-colors leading-tight">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent
                      className={`space-y-3 ${
                        viewMode === "list" ? "pt-0" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(service.duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getSpecialtyName(
                            typeof service.specialization === "string"
                              ? service.specialization
                              : undefined
                          )}
                        </Badge>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter
                    className={`pt-2 flex-grow ${
                      viewMode === "list"
                        ? "flex-col justify-center gap-2 min-w-[160px] grow-0"
                        : "flex-col gap-2 justify-end"
                    }`}
                  >
                    <div
                      className={`flex ${
                        viewMode === "list" ? "flex-col" : "flex-row"
                      } gap-2 w-full`}
                    >
                      <Button
                        variant="outline"
                        size={viewMode === "list" ? "sm" : "default"}
                        className={viewMode === "list" ? "w-full" : "flex-1"}
                        onClick={() =>
                          router.push(`/medical-services/${service._id}`)
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        size={viewMode === "list" ? "sm" : "default"}
                        className={viewMode === "list" ? "w-full" : "flex-1"}
                        onClick={() =>
                          router.push(
                            `/booking?type=service&serviceId=${service._id}`
                          )
                        }
                      >
                        Book Now
                      </Button>
                    </div>
                    <AddToListButton
                      service={service}
                      size={viewMode === "list" ? "sm" : "default"}
                      className="w-full"
                      variant="outline"
                    />
                  </CardFooter>
                </Card>
              ))}
          </div>

          {/* Pagination Controls */}
          <PaginationWrapper
            paginationInfo={paginationInfo}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={(newItemsPerPage) => {
              setCurrentPage(1);
              setItemsPerPage(newItemsPerPage);
            }}
            itemName="services"
            showItemsPerPage={true}
            showJumpToPage={true}
          />
        </>
      )}
    </div>
  );
}
