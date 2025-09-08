"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BookPackageButtonProps extends React.ComponentProps<"button"> {
  packageId: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  label?: string;
}

/**
 * A button component for booking health packages
 */
export function BookPackageButton({
  packageId,
  className,
  variant = "default",
  size = "default",
  showIcon = true,
  label,
  ...props
}: BookPackageButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = () => {
    router.push(`/booking?type=package&packageId=${packageId}`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {showIcon && <Calendar className="mr-2 h-4 w-4" />}
      {label || t("common.bookSchedule")}
    </Button>
  );
} 