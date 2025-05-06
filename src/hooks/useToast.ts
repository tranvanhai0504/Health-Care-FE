"use client";

import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, type = "info", duration = 5000 }: ToastOptions) => {
    switch (type) {
      case "success":
        sonnerToast.success(title, {
          description,
          duration,
        });
        break;
      case "error":
        sonnerToast.error(title, {
          description,
          duration,
        });
        break;
      case "warning":
        sonnerToast.warning(title, {
          description,
          duration,
        });
        break;
      default:
        sonnerToast(title, {
          description,
          duration,
        });
    }
  };

  return { toast };
} 