import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle, Package } from "lucide-react";
import { ConsultationPackage } from "@/services/consultationPackage";

interface PackageDetailsCardProps {
  packageData: ConsultationPackage;
  description: string;
  selectedPriceOption: string | null;
  setSelectedPriceOption: (option: string) => void;
  formatCurrency: (amount: number) => string;
}

export function PackageDetailsCard({
  packageData,
  description,
  selectedPriceOption,
  setSelectedPriceOption,
  formatCurrency,
}: PackageDetailsCardProps) {
  return (
    <Card className="lg:col-span-1 border-border/60 shadow-md relative">
      <div className="absolute -top-3 left-4 inline-flex bg-primary text-white text-xs font-medium py-1 px-3 rounded-full">
        Selected Package
      </div>
      <CardHeader className="pt-6 pb-3 bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Package Details
        </CardTitle>
        <CardDescription>Review your selected package</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground/90">{packageData.title}</h3>
          <div
            className="max-w-none text-sm text-muted-foreground blog-content [&_p]:indent-0 pb-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* Price Options */}
          <div className="mt-6">
            {packageData.priceOptions && packageData.priceOptions.length > 0 ? (
              <>
                <Label htmlFor="price-options" className="text-base font-medium flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Select Package Tier
                </Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {packageData.priceOptions.map((option) => (
                    <div
                      key={option._id || option.tier}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        option._id === selectedPriceOption ||
                        option.tier === selectedPriceOption
                          ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                          : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                      }`}
                      onClick={() =>
                        setSelectedPriceOption(option._id || option.tier)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.tier}</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(option.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                        <span>{option.testsIncluded} tests included</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Label className="text-base font-medium flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Package Price
                </Label>
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">
                      {packageData.price === 0 ? "Free" : formatCurrency(packageData.price)}
                    </span>
                    {packageData.category && (
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {packageData.category}
                      </p>
                    )}
                    {packageData.bookingOption && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Booking Type: {packageData.bookingOption}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 