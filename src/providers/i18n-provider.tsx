"use client";

import React, { useEffect } from "react";
import "@/lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n on client side
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      // i18n will be initialized by the import above
    }
  }, []);

  return <>{children}</>;
}
