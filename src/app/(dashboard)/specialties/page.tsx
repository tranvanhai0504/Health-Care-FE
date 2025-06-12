"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ArrowLeft } from "lucide-react";
import { specialtyService, Specialty } from "@/services/specialties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await specialtyService.getAll();
        setSpecialties(data);
        setFilteredSpecialties(data);
      } catch (error) {
        console.error("Failed to fetch specialties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSpecialties(specialties);
    } else {
      const filtered = specialties.filter(
        (specialty) =>
          specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          specialty.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredSpecialties(filtered);
    }
  }, [searchQuery, specialties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Medical Specialties
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse all available medical specialties and find the right care for
            your needs
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <Skeleton className="h-14 w-14 rounded-xl mb-4" />
                <Skeleton className="h-7 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredSpecialties.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No specialties found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or browse all specialties
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Show all specialties
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Badge variant="outline" className="text-sm">
                  Showing {filteredSpecialties.length} specialties
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredSpecialties.map((specialty) => (
                  <Link
                    href={`/specialties/${specialty._id}`}
                    key={specialty._id}
                    className="block transform transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                  >
                    <Card className="group h-full overflow-hidden border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                      <div className="absolute -right-4 -top-4 h-20 w-20 bg-primary/5 rounded-full transform transition-transform group-hover:scale-110"></div>
                      <CardContent className="p-6 pt-8 relative h-full flex flex-col">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transform transition-transform group-hover:rotate-3 group-hover:scale-110 group-hover:bg-primary/20">
                          <div className="w-14 h-14 relative">
                            <Image
                              src={`/icons/specialties/${specialty._id}.svg`}
                              alt={specialty.name}
                              fill
                              sizes="40px"
                              className="specialty-icon"
                            />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                          {specialty.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                          {specialty.description}
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
            </>
          )}
        </>
      )}

      <style jsx global>{`
        .specialty-icon {
          /* Apply primary color to all SVG paths */
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
