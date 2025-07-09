"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, ExternalLink } from "lucide-react";
import { specialtyService } from "@/services/specialties.service";
import { Specialty } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Define specialty icons mapping (mapping first letter to an icon)
const specialtyIcons: Record<string, React.ReactNode> = {
  C: <Activity className="h-6 w-6 text-primary" />,
  // Add more mappings as needed
};

export function SpecialtiesSection() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await specialtyService.getAll();
        
        // Handle different response structures
        let specialtiesData: Specialty[] = [];
        
        if (Array.isArray(response)) {
          // Direct array response
          specialtiesData = response;
        } else if (response && typeof response === 'object' && 'data' in response) {
          // Response with data property
          const dataProperty = (response as { data: unknown }).data;
          if (Array.isArray(dataProperty)) {
            specialtiesData = dataProperty;
          } else {
            console.error("Expected data to be array but got:", typeof dataProperty, dataProperty);
          }
        } else {
          console.error("Unexpected response structure:", typeof response, response);
        }
        
        if (Array.isArray(specialtiesData) && specialtiesData.length >= 0) {
          setSpecialties(specialtiesData);
        } else {
          console.error("No valid specialty data found");
          setSpecialties([]);
          setError("No specialty data available");
        }
      } catch (error) {
        console.error("Failed to fetch specialties:", error);
        setSpecialties([]);
        setError("Failed to load specialties");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  if (loading) {
    return <SpecialtiesSkeleton />;
  }

  if (error) {
    return <SpecialtiesError error={error} onRetry={() => window.location.reload()} />;
  }

  const displaySpecialties = Array.isArray(specialties) ? specialties.slice(0, 8) : [];

  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1 border-primary/20 bg-primary/5 text-primary"
          >
            Expert Care
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Medical Specialties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of medical specialties with expert doctors
            and comprehensive care options for your needs.
          </p>
        </div>

        {displaySpecialties.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No specialties available</h3>
            <p className="text-muted-foreground">
              Specialty information will be available soon.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {displaySpecialties.map((specialty) => (
                <Link
                  href={`/specialties/${specialty._id}`}
                  key={specialty._id}
                  className="block transform transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                >
                  <Card className="group h-full overflow-hidden border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-4 -top-4 h-20 w-20 bg-primary/5 rounded-full transform transition-transform group-hover:scale-110"></div>
                    <CardContent className="p-6 pt-8 relative h-full flex flex-col">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transform transition-transform group-hover:rotate-3 group-hover:scale-110 group-hover:bg-primary/20">
                        {specialtyIcons[specialty.name?.charAt(0)] || (
                          <div className="text-primary text-xl font-semibold">
                            <Image
                              src={`/icons/specialties/${specialty._id}.svg`}
                              alt={specialty.name || "Specialty"}
                              width={50}
                              height={50}
                              onError={(e) => {
                                // Hide broken image and show fallback icon
                                e.currentTarget.style.display = 'none';
                                const fallbackIcon = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallbackIcon) {
                                  fallbackIcon.style.display = 'block';
                                }
                              }}
                            />
                            <Activity className="h-6 w-6 text-primary fallback-icon" style={{ display: 'none' }} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                        {specialty.name || "Unknown Specialty"}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {specialty.description || "No description available"}
                      </p>
                      <div className="mt-auto inline-flex items-center text-primary text-sm font-medium">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View details
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {specialties.length > 8 && (
              <div className="mt-14 text-center">
                <Button
                  asChild
                  size="lg"
                  variant="default"
                  className="shadow-md hover:shadow-lg transition-shadow px-6 group"
                >
                  <Link href="/specialties" className="flex items-center gap-2">
                    <span>View All Specialties</span>
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function SpecialtiesSkeleton() {
  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse mb-4 mx-auto"></div>
          <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse mb-4 mx-auto"></div>
          <div className="h-6 w-full max-w-2xl bg-gray-200 rounded-md animate-pulse mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="rounded-lg overflow-hidden">
              <Card className="h-full overflow-hidden border border-gray-200">
                <CardContent className="p-6 pt-8 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse mb-5"></div>
                  <div className="h-7 w-3/4 bg-gray-200 rounded-md animate-pulse mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-1"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-1"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialtiesError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1 border-primary/20 bg-primary/5 text-primary"
          >
            Expert Care
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Medical Specialties
          </h2>
        </div>

        <div className="text-center py-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <Activity className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-red-800">Failed to Load Specialties</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={onRetry} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            Try Again
          </Button>
        </div>
      </div>
    </section>
  );
}
