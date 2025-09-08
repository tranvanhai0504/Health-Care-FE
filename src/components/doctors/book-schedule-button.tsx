"use client";

import React, { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";

interface BookScheduleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  doctorId: string;
  doctorName?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function BookScheduleButton({
  doctorId,
  doctorName = "Doctor",
  variant = "default",
  size = "default",
  children,
  className,
  disabled,
  ...props
}: BookScheduleButtonProps) {
  const { isAuthenticated } = useAuth();
  const { openModal } = useLoginModal();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleBookSchedule = async () => {
    try {
      // This is where you would make the API call to create a schedule (book a session)
      // For example: await scheduleService.create(scheduleData);
      console.log(`Booking schedule with doctor ${doctorId}`);
      
      // Show success message
      toast({
        title: t("common.scheduleCreated"),
        description: t("common.scheduleCreatedSuccess", { doctorName }),
      });
    } catch (error) {
      console.error("Error creating schedule:", error);
      
      // Show error message
      toast({
        title: t("common.errorCreatingSchedule"),
        description: t("common.errorCreatingScheduleDescription"),
        type: "error",
      });
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    
    handleBookSchedule();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children || t("common.bookSchedule")}
      </Button>
      
      {/* Login prompt for unauthenticated users */}
      {!isAuthenticated && (
        <p className="text-sm text-muted-foreground mt-2">
          {t("common.signInToBookSchedule")}
        </p>
      )}
    </>
  );
} 