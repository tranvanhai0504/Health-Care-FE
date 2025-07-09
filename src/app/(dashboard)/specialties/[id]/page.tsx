"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Stethoscope,
  Clock,
  Grid,
  List,
  ShoppingCart,
} from "lucide-react";
import { specialtyService } from "@/services/specialties.service";
import { consultationServiceApi } from "@/services/consultationService.service";
import { Specialty, ConsultationService, PaginationInfo } from "@/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import Image from "next/image";

export default function SpecialtyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const specialtyId = params.id as string;

  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [consultationServices, setConsultationServices] = useState<
    ConsultationService[]
  >([]);
  const [allServicesCount, setAllServicesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  });

  // Service list store for cart functionality
  const { getTotalServices, getTotalPrice, toggleList } = useServiceListSafe();

  useEffect(() => {
    const fetchSpecialtyData = async () => {
      try {
        setLoading(true);
        const specialtyData = await specialtyService.getSpecialtyOnly(
          specialtyId
        );
        setSpecialty(specialtyData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch specialty:", error);
        setError("Failed to load specialty information");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialtyData();
  }, [specialtyId]);

  // Fetch all services count for display (non-paginated)
  useEffect(() => {
    const fetchAllServicesCount = async () => {
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (sortBy !== "name") {
          params.sortBy = sortBy;
        }

        const response = await consultationServiceApi.getBySpecialization(
          specialtyId,
          params
        );

        console.log(response);

        setConsultationServices(
          Array.isArray(response.data) ? response.data : []
        );
        setPaginationInfo(response.pagination);

        setAllServicesCount(response.pagination.total);
      } catch (error) {
        console.error("Failed to fetch all services count:", error);
        setAllServicesCount(0);
        setConsultationServices([]);
        setPaginationInfo({
          total: 0,
          page: 1,
          limit: itemsPerPage,
          totalPages: 0,
        });
      } finally {
        setServicesLoading(false);
      }
    };

    if (specialtyId) {
      startTransition(() => {
        fetchAllServicesCount();
      });
    }
  }, [specialtyId, currentPage, itemsPerPage, searchQuery, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Pagination helpers
  const totalPages = paginationInfo?.totalPages || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4 mb-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !specialty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Specialty not found</h3>
          <p className="text-muted-foreground mb-4">
            {error || "The specialty you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/specialties")}>
            Back to Specialties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/specialties">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Specialties</span>
          </Button>
        </Link>
      </div>

      {/* Specialty Information */}
      <div className="mb-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <div className="w-20 h-20 relative">
              <Image
                src={`/icons/specialties/${specialty._id}.svg`}
                alt={specialty.name}
                fill
                sizes="80px"
                className="specialty-icon"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {specialty.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {specialty.description}
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Available Services</h2>
            <p className="text-muted-foreground">
              Browse consultation services for {specialty.name}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-sm">
                {allServicesCount} total services
              </Badge>
              {getTotalServices() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleList}
                  className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium">{getTotalServices()}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-semibold text-primary">
                    {formatPrice(getTotalPrice())}
                  </span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-full w-full sm:w-64"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="price">Sort by Price</SelectItem>
                <SelectItem value="duration">Sort by Duration</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-full aspect-square"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none h-full aspect-square border"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {servicesLoading || isPending ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : consultationServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No services available</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No services found matching your search. Try adjusting your search terms."
                : `No consultation services are currently available for ${specialty.name}.`}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Badge variant="outline" className="text-sm">
                Showing {consultationServices.length} of {paginationInfo.total}{" "}
                service{paginationInfo.total !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {consultationServices.map((service) => (
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
                      <div
                        className={`flex gap-2 ${
                          viewMode === "list"
                            ? "items-center"
                            : "justify-between items-start"
                        }`}
                      >
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
                      <CardTitle className="mt-3 group-hover:text-primary transition-colors leading-snug">
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
                      className={`flex w-full ${
                        viewMode === "list" ? "flex-col" : "flex-row"
                      } gap-2`}
                    >
                      <Button
                        variant="outline"
                        size={viewMode === "list" ? "sm" : "default"}
                        className={viewMode === "list" ? "w-full" : "flex-1"}
                        onClick={() =>
                          router.push(`/consultations/${service._id}`)
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
    </div>
  );
}
