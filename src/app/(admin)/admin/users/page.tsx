"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  MoreVertical,
  Trash,
  Edit,
  RefreshCw,
  User,
  Users,
  Shield,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { userService } from "@/services/user.service";
import { User as UserType } from "@/types/user";
import { PaginationInfo } from "@/types/api";
import { formatDate } from "@/utils/date";
import { useToast } from "@/hooks/useToast";

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null
  );
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAll({
        options: {
          pagination: {
            page: currentPage,
            limit: itemsPerPage,
          },
        },
        role: roleFilter !== "all" ? roleFilter : undefined,
        name: searchQuery || undefined,
      });

      // Sort the data client-side by creation date (newest first)
      const sortedUsers = response.data.sort((a, b) => {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setUsers(sortedUsers);
      setPaginationInfo(response.pagination);
    } catch {
      console.error(t("admin.toast.errorFetchingUsers"));
      toast({
        title: t("admin.toast.error"),
        description: t("admin.toast.failedToFetchUsers"),
        type: "error",
      });
      setUsers([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, roleFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatField = (value: string | undefined | null) => {
    return value && value.trim() !== "" ? value : "-";
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
      toast({
        title: t("admin.toast.success"),
        description: t("admin.toast.userDeleted"),
        type: "success",
      });
    } catch {
      toast({
        title: t("admin.toast.error"),
        description: t("admin.toast.failedToDelete"),
        type: "error",
      });
    }
  };

  const getRoleColor = (role: string) => {
    if (!role || role.trim() === "") return "bg-gray-100 text-gray-800";

    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "doctor":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "user":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:";
    }
  };

  const getRoleIcon = (role: string) => {
    if (!role || role.trim() === "") return <User className="h-4 w-4" />;

    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "doctor":
        return <UserCheck className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
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
    setRoleFilter("all");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5" /> {t("admin.users.title")}
                </CardTitle>
                <CardTitle className="text-sm text-muted-foreground mt-1">
                  {t("admin.users.subtitle")}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-5 w-5" /> {t("admin.users.title")}
              </CardTitle>
              <CardTitle className="text-sm text-muted-foreground mt-1">
                {t("admin.users.subtitle")}
              </CardTitle>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.users.addNewUser")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("admin.users.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t("admin.users.allRoles")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.users.allRoles")}</SelectItem>
                  <SelectItem value="admin">{t("admin.users.admin")}</SelectItem>
                  <SelectItem value="doctor">{t("admin.users.doctor")}</SelectItem>
                  <SelectItem value="user">{t("admin.users.user")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="default"
                onClick={resetFilters}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("admin.users.reset")}
              </Button>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t("admin.users.noUsersFound")}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || roleFilter !== "all"
                  ? t("admin.users.noUsersMatchFilters")
                  : t("admin.users.noUsersCreated")}
              </p>
              {searchQuery || roleFilter !== "all" ? (
                <Button variant="outline" onClick={resetFilters}>
                  {t("admin.users.clearFilters")}
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.users.name")}</TableHead>
                      <TableHead>{t("admin.users.email")}</TableHead>
                      <TableHead>{t("admin.users.phoneNumber")}</TableHead>
                      <TableHead>{t("admin.users.role")}</TableHead>
                      <TableHead>{t("admin.users.joined")}</TableHead>
                      <TableHead className="text-right">{t("admin.users.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {formatField(user.name)}
                          </div>
                        </TableCell>
                        <TableCell>{formatField(user.email)}</TableCell>
                        <TableCell>{formatField(user.phoneNumber)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <Badge className={getRoleColor(user.role)}>
                              {formatField(user.role)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t("admin.users.openMenu")}</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("admin.users.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                {t("admin.users.editUser")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                {t("admin.users.deleteUser")}
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
                  itemName={t("admin.users.user").toLowerCase()}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: t("admin.users.totalUsers"),
            count: users.length,
            color: "text-blue-600",
            icon: <Users className="h-4 w-4" />,
          },
          {
            label: t("admin.users.admins"),
            count: users.filter(
              (u) => u.role && u.role.trim() !== "" && u.role === "admin"
            ).length,
            color: "text-red-600",
            icon: <Shield className="h-4 w-4" />,
          },
          {
            label: t("admin.users.doctors"),
            count: users.filter(
              (u) => u.role && u.role.trim() !== "" && u.role === "doctor"
            ).length,
            color: "text-blue-600",
            icon: <UserCheck className="h-4 w-4" />,
          },
          {
            label: t("admin.users.regularUsers"),
            count: users.filter(
              (u) => u.role && u.role.trim() !== "" && u.role === "user"
            ).length,
            color: "text-gray-600",
            icon: <User className="h-4 w-4" />,
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
