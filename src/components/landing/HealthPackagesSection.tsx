"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { consultationPackageService } from "@/services";
import { ConsultationPackage } from "@/types";
import { formatCurrency } from "@/utils";
import {
  Package,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function HealthPackagesSection() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<ConsultationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await consultationPackageService.getMany({
          options: {
            pagination: {
              page: 1,
              limit: 6, // Show 6 packages on landing page
            },
          },
        });
        setPackages(response.data);
      } catch (err) {
        console.error("Error fetching health packages:", err);
        setError(t("landing.healthPackages.failedToLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [t]);

  if (error) {
    return null; // Don't show the section if there's an error
  }

  console.log(packages);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("landing.healthPackages.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("landing.healthPackages.description")}
          </p>
        </div>

        {loading ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-full animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : packages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("landing.healthPackages.noPackagesAvailable")}
            </h3>
            <p className="text-gray-600">
              {t("landing.healthPackages.checkBackLater")}
            </p>
          </div>
        ) : (
          <>
            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg._id}
                  className={`h-full hover:shadow-xl flex flex-col transition-all duration-300 group border-0 shadow-lg overflow-hidden ${
                    index === 0
                      ? "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
                      : "hover:shadow-2xl"
                  }`}
                >
                  {/* Package Image */}
                  {pkg.titleImage && (
                    <div className="relative h-60 overflow-hidden">
                      <Image
                        src={pkg.titleImage}
                        alt={pkg.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {index === 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-white px-3 py-1 text-xs font-semibold shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            {t("landing.healthPackages.mostPopular")}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="relative">
                    {index === 0 && !pkg.titleImage && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-white px-4 py-1 text-xs font-semibold shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          {t("landing.healthPackages.mostPopular")}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {pkg.title}
                        </CardTitle>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {pkg.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        {pkg.priceOptions && pkg.priceOptions.length > 0 ? (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(pkg.priceOptions[0].price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pkg.priceOptions[0].tier}
                            </p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-primary">
                            {pkg.price === 0
                              ? t("landing.healthPackages.free")
                              : formatCurrency(pkg.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 py-0 flex-grow flex items-end">
                    {/* Package Category */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {pkg.category}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Button
                      asChild
                      className="w-full group-hover:bg-primary/90 transition-all duration-200"
                    >
                      <Link
                        href={`/health-packages/${pkg._id}`}
                        className="flex items-center justify-center"
                      >
                        {t("landing.healthPackages.learnMore")}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group px-8 py-6 text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Link href="/health-packages" className="flex items-center">
                  <Users className="mr-3 h-5 w-5" />
                  {t("landing.healthPackages.viewAll")}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                {t("landing.healthPackages.discoverAll", { count: packages.length })}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
