"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MoreVertical,
  Search,
  Calendar,
  Clock,
  User,
  Package,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
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

export default function AdminSchedulesPage() {
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
  const router = useRouter();
  const { toast } = useToast();

  console.log(schedules);

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
        title: "Error",
        description: "Failed to fetch schedules",
        type: "error",
      });
      setSchedules([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Apply client-side filtering
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      searchQuery === "" ||
      schedule.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule._id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || schedule.status === statusFilter;
    const matchesType = typeFilter === "all" || schedule.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewSchedule = (id: string) => {
    router.push(`/admin/schedules/${id}`);
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
  const formatDate = (weekPeriod: any) => {
    if (!weekPeriod || !weekPeriod.from) return "Invalid Date";
    const date = new Date(weekPeriod.from);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeSlot = (dayOffset: number, timeOffset: 0 | 1) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayName = days[dayOffset] || "Unknown";
    const timeSlot = timeOffset === 0 ? "Morning" : "Afternoon";
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
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Schedules Management
              </CardTitle>
              <CardDescription className="mt-1.5">
                Manage all patient appointments and schedules across the system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by user ID or schedule ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Confirmed</SelectItem>
                  <SelectItem value="checkedIn">Checked In</SelectItem>
                  <SelectItem value="serving">Serving</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="default"
                onClick={resetFilters}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
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
              <h3 className="text-lg font-medium mb-2">No schedules found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No schedules match your current filters."
                  : "No schedules have been created yet."}
              </p>
              {searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Schedule ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule._id}>
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
                            <span className="capitalize">{schedule.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatTimeSlot(
                              schedule.dayOffset,
                              schedule.timeOffset
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(schedule.weekPeriod)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                ${schedule.payment?.totalPaid || 0}
                              </span>
                              <span className="text-gray-500">
                                / ${schedule.payment?.totalPrice || 0}
                              </span>
                            </div>
                            {schedule.payment && (
                              <div className="flex items-center gap-1 mt-1">
                                {schedule.payment.totalPaid >=
                                schedule.payment.totalPrice ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : schedule.payment.totalPaid > 0 ? (
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {schedule.payment.totalPaid >=
                                  schedule.payment.totalPrice
                                    ? "Paid"
                                    : schedule.payment.totalPaid > 0
                                    ? "Partial"
                                    : "Unpaid"}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewSchedule(schedule._id!)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-blue-600">
                                <User className="mr-2 h-4 w-4" />
                                View User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Update Status
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
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {[
          {
            label: "Total Schedules",
            count: schedules.length,
            color: "text-blue-600",
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            label: "Confirmed",
            count: schedules.filter(
              (s) => s.status === ScheduleStatus.CONFIRMED
            ).length,
            color: "text-blue-600",
            icon: <Clock className="h-4 w-4" />,
          },
          {
            label: "In Progress",
            count: schedules.filter((s) => s.status === ScheduleStatus.SERVING)
              .length,
            color: "text-yellow-600",
            icon: <AlertCircle className="h-4 w-4" />,
          },
          {
            label: "Completed",
            count: schedules.filter(
              (s) => s.status === ScheduleStatus.COMPLETED
            ).length,
            color: "text-green-600",
            icon: <CheckCircle className="h-4 w-4" />,
          },
          {
            label: "Cancelled",
            count: schedules.filter(
              (s) => s.status === ScheduleStatus.CANCELLED
            ).length,
            color: "text-red-600",
            icon: <XCircle className="h-4 w-4" />,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.count}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
