"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface ScheduleFiltersProps {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
}

export function ScheduleFilters({
  searchQuery,
  statusFilter,
  dateFilter,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
}: ScheduleFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
        <Input
          placeholder={t("doctor.schedules.filters.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("doctor.schedules.filters.statusPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("doctor.schedules.filters.status.all")}</SelectItem>
            <SelectItem value="upcoming">{t("doctor.schedules.filters.status.upcoming")}</SelectItem>
            <SelectItem value="in-progress">{t("doctor.schedules.filters.status.inProgress")}</SelectItem>
            <SelectItem value="completed">{t("doctor.schedules.filters.status.completed")}</SelectItem>
            <SelectItem value="cancelled">{t("doctor.schedules.filters.status.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("doctor.schedules.filters.datePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t("doctor.schedules.filters.date.today")}</SelectItem>
            <SelectItem value="week">{t("doctor.schedules.filters.date.week")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}