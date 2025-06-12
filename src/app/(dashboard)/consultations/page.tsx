"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Stethoscope, Clock, Grid, List, ArrowLeft } from "lucide-react";
import { ConsultationService, consultationServiceApi } from "@/services/consultationService";
import { specialtyService, Specialty } from "@/services/specialties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConsultationsPage() {
  const [consultationServices, setConsultationServices] = useState<ConsultationService[]>([]);
  const [filteredServices, setFilteredServices] = useState<ConsultationService[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      try {
        const [services, specialtiesData] = await Promise.all([
          consultationServiceApi.getAll(),
          specialtyService.getAll()
        ]);
        setConsultationServices(services);
        setFilteredServices(services);
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    });
  }, []);

  useEffect(() => {
    let filtered = consultationServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === "all" || 
                              service.specialization === selectedSpecialty;

      const matchesPriceRange = (() => {
        switch (priceRange) {
          case "under-50000":
            return service.price < 50000;
          case "50000-100000":
            return service.price >= 50000 && service.price <= 100000;
          case "100000-200000":
            return service.price > 100000 && service.price <= 200000;
          case "over-200000":
            return service.price > 200000;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesSpecialty && matchesPriceRange;
    });

    // Sort services
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "duration":
          return a.duration - b.duration;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServices(filtered);
  }, [searchTerm, selectedSpecialty, priceRange, sortBy, consultationServices]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    return `${duration} minutes`;
  };

  const getSpecialtyName = (specialtyId?: string) => {
    if (!specialtyId) return "General";
    const specialty = specialties.find(s => s._id === specialtyId);
    return specialty?.name || "Unknown";
  };

  const getPriceRangeStats = () => {
    const ranges = {
      "under-50000": 0,
      "50000-100000": 0,
      "100000-200000": 0,
      "over-200000": 0
    };

    consultationServices.forEach(service => {
      if (service.price < 50000) ranges["under-50000"]++;
      else if (service.price <= 100000) ranges["50000-100000"]++;
      else if (service.price <= 200000) ranges["100000-200000"]++;
      else ranges["over-200000"]++;
    });

    return ranges;
  };

  const priceRangeStats = getPriceRangeStats();

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
            Browse our comprehensive range of medical consultation services offered by expert healthcare professionals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {consultationServices.length} total services
          </Badge>
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
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
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

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50000">
                  Under ₫50,000 ({priceRangeStats["under-50000"]})
                </SelectItem>
                <SelectItem value="50000-100000">
                  ₫50,000 - ₫100,000 ({priceRangeStats["50000-100000"]})
                </SelectItem>
                <SelectItem value="100000-200000">
                  ₫100,000 - ₫200,000 ({priceRangeStats["100000-200000"]})
                </SelectItem>
                <SelectItem value="over-200000">
                  Over ₫200,000 ({priceRangeStats["over-200000"]})
                </SelectItem>
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

        {(searchTerm || selectedSpecialty !== "all" || priceRange !== "all") && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
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
            {priceRange !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Price filter
                <button
                  onClick={() => setPriceRange("all")}
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
                setPriceRange("all");
              }}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {isPending ? (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
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
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm || selectedSpecialty !== "all" || priceRange !== "all"
              ? "No services match your current filters. Try adjusting your search criteria."
              : "No consultation services are currently available."
            }
          </p>
          {(searchTerm || selectedSpecialty !== "all" || priceRange !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("all");
                setPriceRange("all");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className="text-sm">
              Showing {filteredServices.length} of {consultationServices.length} services
            </Badge>
          </div>

          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredServices.map((service) => (
              <Card
                key={service._id}
                className={`group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/20 ${
                  viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                }`}
              >
                <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                  <CardHeader className={`${viewMode === "list" ? "pb-2" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                        {formatPrice(service.price)}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 group-hover:text-primary transition-colors">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className={`space-y-3 ${viewMode === "list" ? "pt-0" : ""}`}>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getSpecialtyName(service.specialization)}
                      </Badge>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className={`pt-2 ${viewMode === "list" ? "flex-col justify-center gap-2 min-w-[160px]" : "flex-row gap-2"}`}>
                  <Button
                    variant="outline"
                    size={viewMode === "list" ? "sm" : "default"}
                    className={viewMode === "list" ? "w-full" : "flex-1"}
                    onClick={() => router.push(`/consultations/${service._id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size={viewMode === "list" ? "sm" : "default"}
                    className={viewMode === "list" ? "w-full" : "flex-1"}
                    onClick={() => router.push(`/consultations/${service._id}/schedule`)}
                  >
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
