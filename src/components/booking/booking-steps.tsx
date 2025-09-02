import React from "react";
import { Stethoscope } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BookingSteps() {
  const { t } = useTranslation();
  
  return (
    <div className="mt-12 mb-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        {t("booking.steps.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col items-center text-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-medium">1</span>
          </div>
          <h3 className="font-medium mb-2">{t("booking.steps.selectPackage")}</h3>
          <p className="text-sm text-muted-foreground">{t("booking.steps.selectPackageDesc")}</p>
        </div>
        <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col items-center text-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-medium">2</span>
          </div>
          <h3 className="font-medium mb-2">{t("booking.steps.pickDateTime")}</h3>
                      <p className="text-sm text-muted-foreground">{t("booking.steps.pickDateTimeDesc")}</p>
        </div>
        <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col items-center text-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-medium">3</span>
          </div>
          <h3 className="font-medium mb-2">{t("booking.steps.confirmBooking")}</h3>
                      <p className="text-sm text-muted-foreground">{t("booking.steps.confirmBookingDesc")}</p>
        </div>
      </div>
    </div>
  );
} 