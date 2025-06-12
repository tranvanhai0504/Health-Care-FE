"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Stethoscope, Clock, Grid, List } from "lucide-react";
import { specialtyService, Specialty } from "@/services/specialties";
import { consultationServiceApi, ConsultationService } from "@/services/consultationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

export default function SpecialtyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const specialtyId = params.id as string;

  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [consultationServices, setConsultationServices] = useState<ConsultationService[]>([]);
  const [filteredServices, setFilteredServices] = useState<ConsultationService[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialtyData = async () => {
      try {
        setLoading(true);
        const specialtyData = await specialtyService.getSpecialtyOnly(specialtyId);
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

  useEffect(() => {
    const fetchConsultationServices = async () => {
      try {
        setServicesLoading(true);
        const services = await consultationServiceApi.getBySpecialization(specialtyId);
        setConsultationServices(services);
        setFilteredServices(services);
      } catch (error) {
        console.error("Failed to fetch consultation services:", error);
        // Don't set error here, just show empty services
        setConsultationServices([]);
        setFilteredServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    if (specialtyId) {
      fetchConsultationServices();
    }
  }, [specialtyId]);

  useEffect(() => {
    let filtered = consultationServices.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort services
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          return a.duration - b.duration;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServices(filtered);
  }, [searchQuery, sortBy, consultationServices]);

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
          <Button onClick={() => router.push('/specialties')}>
            Back to Specialties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
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

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {servicesLoading ? (
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
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
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No services available</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No services found matching your search. Try adjusting your search terms."
                : `No consultation services are currently available for ${specialty.name}.`
              }
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
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
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

      <style jsx global>{`
        .specialty-icon {
          color: #24ae7c;
        }

        .specialty-icon path,
        .specialty-icon rect,
        .specialty-icon circle {
          stroke: #1a7f5a !important;
          fill: #24ae7c !important;
        }
      `}</style>
    </div>
  );
}
