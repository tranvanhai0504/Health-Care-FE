"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { scheduleService } from "@/services";
import { ScheduleResponse, ScheduleStatus } from "@/types/schedule";
import { PaginationInfo } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Search,
  Calendar,
  Clock,
  User,
  Package,
  RefreshCw,
  Users,
  CheckCircle,
  UserCheck,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { ScheduleDetails } from "@/components/admin/schedules";
import { formatScheduleDate, formatScheduleWeekday } from "@/utils/formatters";

export default function AdminSchedulesPage() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [rightPanelSize, setRightPanelSize] = useState(40);
  const { toast } = useToast();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getMany({
        options: {
          pagination: {
            page: currentPage,
            limit: itemsPerPage,
          },
          populateOptions: {
            path: "userId",
            select: ["name", "email", "phoneNumber"],
          },
          sort: {
            createdAt: -1,
          },
        },
      });

      // Sort the data client-side by creation date (newest first)
      const sortedSchedules = response.data.sort((a, b) => {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setSchedules(sortedSchedules);
      setPaginationInfo(response.pagination);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: t("admin.schedules.toast.error"),
        description: t("admin.schedules.toast.failedToFetchSchedules"),
        type: "error",
      });
      setSchedules([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Apply client-side filtering
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      searchQuery === "" ||
      (schedule.userId?.name &&
        schedule.userId.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (schedule._id &&
        schedule._id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || schedule.status === statusFilter;
    const matchesType = typeFilter === "all" || schedule.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewSchedule = (id: string) => {
    setSelectedScheduleId(id);
    setShowRightPanel(true);
  };

  const handleCloseDetails = () => {
    setSelectedScheduleId(null);
    setShowRightPanel(false);
    setRightPanelSize(40);
  };

  const handleExpandRightPanel = () => {
    console.log('Expanding panel to 100');
    setRightPanelSize(100);
  };

  const handleCollapseRightPanel = () => {
    console.log('Collapsing panel to 40');
    setRightPanelSize(40);
  };

  const handleCheckIn = async (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      await scheduleService.update(scheduleId, {
        status: ScheduleStatus.CHECKEDIN,
      });
      toast({
        title: t("admin.schedules.toast.success"),
        description: t("admin.schedules.toast.patientCheckedInSuccessfully"),
        type: "success",
      });
      // Refresh the schedules list
      fetchSchedules();
    } catch (error) {
      console.error("Error checking in patient:", error);
      toast({
        title: t("admin.schedules.toast.error"),
        description: t("admin.schedules.toast.failedToCheckInPatient"),
        type: "error",
      });
    }
  };

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800";
      case ScheduleStatus.CHECKEDIN:
        return "bg-green-100 text-green-800";
      case ScheduleStatus.SERVING:
        return "bg-yellow-100 text-yellow-800";
      case ScheduleStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ScheduleStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "package" ? (
      <Package className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (weekPeriod: any, dayOffset: number = 0) => {
    if (!weekPeriod || !weekPeriod.from) return t("admin.schedules.messages.invalidDate");
    return formatScheduleDate(weekPeriod, dayOffset, 'MMM dd, yyyy');
  };
  const formatTimeSlot = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weekPeriod: any,
    dayOffset: number,
    timeOffset: 0 | 1
  ) => {
    if (!weekPeriod || !weekPeriod.from) return t("admin.schedules.messages.unknown");
    const dayName = formatScheduleWeekday(weekPeriod, dayOffset);
    const timeSlot = timeOffset === 0 ? t("admin.schedules.timeSlots.morning") : t("admin.schedules.timeSlots.afternoon");
    return `${dayName} ${timeSlot}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
    // Refresh the data after resetting filters to ensure clean state
    fetchSchedules();
  };

  return (
    <div className="h-[calc(100vh-64px)]">
      <PanelGroup direction="horizontal" className="h-full" key={`panel-${rightPanelSize}`}>
        {/* Left Panel - Schedules List */}
        <Panel
          defaultSize={showRightPanel ? (rightPanelSize === 100 ? 0 : 60) : 100}
          minSize={showRightPanel ? (rightPanelSize === 100 ? 0 : 40) : 100}
        >
          <div className="h-full overflow-auto">
            <div className="container mx-auto py-8 px-4">
              <Card className="border-none shadow-sm">
                <CardHeader className="bg-muted/50 rounded-t-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> {t("admin.schedules.title")}
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {t("admin.schedules.subtitle")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Search and Filters */}
                  <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between w-full overflow-x-auto pb-2">
                    <div className="relative w-full lg:max-w-xs">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder={t("admin.schedules.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder={t("admin.schedules.filters.allStatus")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("admin.schedules.filters.allStatus")}</SelectItem>
                          <SelectItem value="confirmed">{t("admin.schedules.filters.confirmed")}</SelectItem>
                          <SelectItem value="checkedIn">{t("admin.schedules.filters.checkedIn")}</SelectItem>
                          <SelectItem value="serving">{t("admin.schedules.filters.serving")}</SelectItem>
                          <SelectItem value="completed">{t("admin.schedules.filters.completed")}</SelectItem>
                          <SelectItem value="cancelled">{t("admin.schedules.filters.cancelled")}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder={t("admin.schedules.filters.allTypes")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("admin.schedules.filters.allTypes")}</SelectItem>
                          <SelectItem value="package">{t("admin.schedules.filters.package")}</SelectItem>
                          <SelectItem value="services">{t("admin.schedules.filters.services")}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="default"
                        onClick={resetFilters}
                        className="w-full sm:w-auto"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("admin.schedules.filters.reset")}
                      </Button>

                      <Button
                        size="default"
                        className="w-full sm:w-auto gap-2"
                        onClick={() =>
                          (window.location.href = "/admin/schedules/create")
                        }
                      >
                        <Plus className="h-4 w-4" />
                        {t("admin.schedules.filters.newSchedule")}
                      </Button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-4 border rounded-lg"
                        >
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      ))}
                    </div>
                  ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {t("admin.schedules.messages.noSchedulesFound")}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery ||
                        statusFilter !== "all" ||
                        typeFilter !== "all"
                          ? t("admin.schedules.messages.noSchedulesMatchFilters")
                          : t("admin.schedules.messages.noSchedulesCreated")}
                      </p>
                      {searchQuery ||
                      statusFilter !== "all" ||
                      typeFilter !== "all" ? (
                        <Button variant="outline" onClick={resetFilters}>
                          {t("admin.schedules.messages.clearFilters")}
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("admin.schedules.table.scheduleId")}</TableHead>
                              <TableHead>{t("admin.schedules.table.user")}</TableHead>
                              <TableHead>{t("admin.schedules.table.type")}</TableHead>
                              <TableHead>{t("admin.schedules.table.timeSlot")}</TableHead>
                              <TableHead>{t("admin.schedules.table.date")}</TableHead>
                              <TableHead>{t("admin.schedules.table.status")}</TableHead>

                              <TableHead className="text-right">
                                {t("admin.schedules.table.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSchedules.map((schedule) => (
                              <TableRow
                                key={schedule._id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() =>
                                  handleViewSchedule(schedule._id!)
                                }
                              >
                                <TableCell className="font-medium">
                                  <div className="max-w-[120px]">
                                    <p className="truncate text-sm font-mono">
                                      {schedule._id?.substring(0, 8)}...
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-mono">
                                      {schedule.userId.name ??
                                        schedule.userId.email ??
                                        schedule.userId.phoneNumber}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(schedule.type)}
                                    <span className="capitalize">
                                      {schedule.type}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    {formatTimeSlot(
                                      schedule.weekPeriod,
                                      schedule.dayOffset,
                                      schedule.timeOffset
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    {formatDate(
                                      schedule.weekPeriod,
                                      schedule.dayOffset
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(schedule.status)}
                                  >
                                    {schedule.status}
                                  </Badge>
                                </TableCell>

                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="sr-only">
                                          {t("admin.schedules.actions.openMenu")}
                                        </span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        {t("admin.schedules.table.actions")}
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem className="text-blue-600">
                                        <User className="mr-2 h-4 w-4" />
                                        {t("admin.schedules.actions.viewUser")}
                                      </DropdownMenuItem>
                                      {schedule.status ===
                                        ScheduleStatus.CONFIRMED && (
                                        <DropdownMenuItem
                                          className="text-green-600"
                                          onClick={(e) =>
                                            handleCheckIn(schedule._id!, e)
                                          }
                                        >
                                          <UserCheck className="mr-2 h-4 w-4" />
                                          {t("admin.schedules.actions.checkInPatient")}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem className="text-orange-600">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {t("admin.schedules.actions.updateStatus")}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination Controls */}
                      {paginationInfo && (
                        <PaginationWrapper
                          paginationInfo={paginationInfo}
                          currentPage={currentPage}
                          totalPages={paginationInfo.totalPages}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                          onItemsPerPageChange={handleItemsPerPageChange}
                          itemName="schedule"
                          showItemsPerPage={true}
                          showJumpToPage={false}
                          itemsPerPageOptions={[5, 10, 20, 50]}
                          className="pt-4"
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Panel>

        {/* Panel Resize Handle and Right Panel */}
        {showRightPanel && selectedScheduleId && (
          <>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
            <Panel
              defaultSize={rightPanelSize}
              minSize={rightPanelSize === 100 ? 100 : 30}
              maxSize={rightPanelSize === 100 ? 100 : 70}
            >
              <ScheduleDetails
                scheduleId={selectedScheduleId}
                onClose={handleCloseDetails}
                refetch={fetchSchedules}
                handleExpandRightPanel={handleExpandRightPanel}
                handleCollapseRightPanel={handleCollapseRightPanel}
                rightPanelSize={rightPanelSize}
              />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
