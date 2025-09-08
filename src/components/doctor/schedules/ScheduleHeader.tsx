"use client";

import { useTranslation } from "react-i18next";

export function ScheduleHeader() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          {t("doctor.schedules.title")}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t("doctor.schedules.subtitle")}
        </p>
      </div>
    </div>
  );
}
