"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Package, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { consultationPackageService } from "@/services/consultationPackage.service";
import { ConsultationPackage } from "@/types";
import { formatCurrency } from "@/utils";
import { formatDate } from "@/utils/date";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ScheduleFormData {
  dayOffset: number;
  packageId: string;
  status: string;
  timeOffset: number;
  type: string;
  weekPeriod: {
    from: string;
    to: string;
  };
}

interface ScheduleConfirmationProps {
  formData: ScheduleFormData;
  onConfirm: (formData: ScheduleFormData) => void;
  onCancel?: () => void;
}

export function ScheduleConfirmation({
  formData,
  onConfirm,
  onCancel,
}: ScheduleConfirmationProps) {
  const [packageInfo, setPackageInfo] = useState<ConsultationPackage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPackageInfo = async () => {
      try {
        setIsLoading(true);
        const packageData = await consultationPackageService.getById(
          formData.packageId
        );
        setPackageInfo(packageData);
      } catch (error) {
        console.error("Failed to fetch package info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageInfo();
  }, [formData.packageId]);

  const formatDateLocal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeOffset: number) => {
    return timeOffset === 0 ? t("chat.scheduleConfirmation.morning") : t("chat.scheduleConfirmation.afternoon");
  };

  const getDayOfWeek = (dayOffset: number, weekStart: string) => {
    const weekStartDate = new Date(weekStart);
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + dayOffset);

    return targetDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(formData);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleViewPackageDetails = () => {
    router.push(`/health-packages/${formData.packageId}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {t("chat.scheduleConfirmation.loadingPackage")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!packageInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-sm text-destructive">
            {t("chat.scheduleConfirmation.packageError")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t("chat.scheduleConfirmation.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{t("chat.scheduleConfirmation.package")}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewPackageDetails}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {t("chat.scheduleConfirmation.details")}
            </Button>
          </div>
          <div className="pl-6 space-y-1">
            <div className="font-semibold">{packageInfo.title}</div>
            {packageInfo.description && (
              <div className="text-sm text-muted-foreground">
                {packageInfo.description}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {formatCurrency(packageInfo.price)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{t("chat.scheduleConfirmation.schedule")}</span>
          </div>
          <div className="pl-6 space-y-1">
            <div className="text-sm">
              <span className="font-medium">{t("chat.scheduleConfirmation.date")}</span>{" "}
              {getDayOfWeek(formData.dayOffset, formData.weekPeriod.from)}
            </div>
            <div className="text-sm">
              <span className="font-medium">{t("chat.scheduleConfirmation.time")}</span>{" "}
              {formatTime(formData.timeOffset)}
            </div>
            <div className="text-sm">
              <span className="font-medium">{t("chat.scheduleConfirmation.week")}</span>{" "}
              {formatDateLocal(formData.weekPeriod.from)} -{" "}
              {formatDateLocal(formData.weekPeriod.to)}
            </div>
            <div className="text-sm">
              <span className="font-medium">{t("chat.scheduleConfirmation.status")}</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {formData.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || false}
            className="flex-1"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("chat.scheduleConfirmation.confirming")}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("chat.scheduleConfirmation.confirmSchedule")}
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isConfirming || false}
            >
              {t("common.cancel")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
