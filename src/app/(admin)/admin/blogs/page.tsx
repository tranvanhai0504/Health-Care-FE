"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BlogService } from "@/services/blogs.service";
import { Blog, PaginationInfo, User } from "@/types";
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
import { formatDate } from "@/utils/date";
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
  Pencil,
  Plus,
  Search,
  Trash2,
  FileText,
  ListFilter,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";

// Create a single instance of the blog service outside the component
const blogService = new BlogService();

export default function AdminBlogsPage() {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        // Get all blog previews
        const response = await blogService.getMany({
          options: {
            pagination: {
              page: currentPage,
              limit: itemsPerPage,
            },
            populateOptions: {
              path: "author",
              select: ["name", "email"],
            },
          },
        });
        const blogPreviews = response.data;
        console.log(blogPreviews);

        // Use blogPreviews directly
        let allBlogs = blogPreviews;

        // Apply filters
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          allBlogs = allBlogs.filter(
            (blog) =>
              blog.title.toLowerCase().includes(query) ||
              blog.content.toLowerCase().includes(query) ||
              (blog.author &&
                (blog.author as User).name.toLowerCase().includes(query))
          );
        }

        if (statusFilter !== "all") {
          allBlogs = allBlogs.filter((blog) =>
            statusFilter === "active" ? blog.active : !blog.active
          );
        }

        // Apply sorting
        allBlogs.sort((a, b) => {
          switch (sortBy) {
            case "title":
              return a.title.localeCompare(b.title);
            case "author":
              return (a.author as User).name.localeCompare(
                (b.author as User).name
              );
            case "updatedAt":
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            case "createdAt":
            default:
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
          }
        });

        setBlogs(allBlogs);
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast({
          title: t("admin.blogs.create.error"),
          description: t("admin.blogs.list.failedToFetchBlogs"),
          type: "error",
        });
        setBlogs([]);
        setPaginationInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter, sortBy, itemsPerPage, currentPage]);

  const handleCreateBlog = () => {
    router.push("/admin/blogs/create");
  };

  const handleEditBlog = (id: string) => {
    router.push(`/admin/blogs/edit/${id}`);
  };

  const handleViewBlog = (id: string) => {
    router.push(`/admin/blogs/${id}`);
  };

  const confirmDelete = (id: string) => {
    setBlogToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    try {
      await blogService.delete(blogToDelete);
      // Refresh blogs after deletion
      setBlogToDelete(null);
      setIsDeleteAlertOpen(false);
      // Optionally, you can refetch blogs here or trigger a reload
      // For now, just reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting blog:", error);
      setBlogToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await blogService.toggleStatus(id);
      // Optionally, you can refetch blogs here or trigger a reload
      window.location.reload();
    } catch (error) {
      console.error("Error toggling blog status:", error);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-5 w-5" /> {t("admin.blogs.list.title")}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {t("admin.blogs.list.subtitle")}
              </CardDescription>
            </div>
            <Button onClick={handleCreateBlog} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> {t("admin.blogs.list.addNewBlog")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("admin.blogs.list.searchPlaceholder", { defaultValue: "Search blogs..." })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t("admin.blogs.list.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.blogs.list.allStatus")}</SelectItem>
                  <SelectItem value="active">{t("admin.blogs.list.active")}</SelectItem>
                  <SelectItem value="inactive">{t("admin.blogs.list.inactive")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">{t("admin.blogs.list.sortByDate", { defaultValue: "Sort by Date" })}</SelectItem>
                  <SelectItem value="title">{t("admin.blogs.list.sortByTitle", { defaultValue: "Sort by Title" })}</SelectItem>
                  <SelectItem value="author">{t("admin.blogs.list.sortByAuthor", { defaultValue: "Sort by Author" })}</SelectItem>
                  <SelectItem value="updatedAt">{t("admin.blogs.list.sortByUpdated", { defaultValue: "Sort by Updated" })}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("createdAt");
                }}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("admin.blogs.list.reset", { defaultValue: "Reset" })}
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
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t("admin.blogs.list.noBlogsFound", { defaultValue: "No blogs found" })}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? t("admin.blogs.list.noBlogsMatchFilters", { defaultValue: "No blogs match your current filters." })
                  : t("admin.blogs.list.noBlogsYet", { defaultValue: "No blogs have been created yet." })}
              </p>
              {searchQuery || statusFilter !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSortBy("createdAt");
                  }}
                >
                  {t("admin.blogs.list.clearFilters", { defaultValue: "Clear filters" })}
                </Button>
              ) : (
                <Button onClick={handleCreateBlog}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.blogs.list.createFirstBlog", { defaultValue: "Create your first blog" })}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">{t("admin.blogs.list.colTitle", { defaultValue: "Title" })}</TableHead>
                      <TableHead>{t("admin.blogs.list.colAuthor", { defaultValue: "Author" })}</TableHead>
                      <TableHead>{t("admin.blogs.list.colStatus", { defaultValue: "Status" })}</TableHead>
                      <TableHead>{t("admin.blogs.list.colCreated", { defaultValue: "Created" })}</TableHead>
                      <TableHead className="text-right">{t("admin.blogs.list.colActions", { defaultValue: "Actions" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={blog._id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[350px]">
                            <p className="truncate text-sm font-medium">
                              {blog.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {blog.content
                                ? blog.content.substring(0, 100) + "..."
                                : t("admin.blogs.list.noContent")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {(blog.author as User).name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <span className="text-sm">
                              {(blog.author as User).name || t("admin.blogs.list.unknown")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={blog.active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(blog._id)}
                          >
                            {blog.active ? t("admin.blogs.list.active") : t("admin.blogs.list.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(blog.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t("admin.blogs.list.openMenu", { defaultValue: "Open menu" })}</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("admin.blogs.list.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewBlog(blog._id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {t("admin.blogs.list.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditBlog(blog._id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("admin.blogs.list.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(blog._id)}
                                className="text-blue-600"
                              >
                                <ListFilter className="mr-2 h-4 w-4" />
                                {t("admin.blogs.list.toggleStatus")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => confirmDelete(blog._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("admin.blogs.list.delete")}
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
              <PaginationWrapper
                paginationInfo={paginationInfo}
                currentPage={currentPage}
                totalPages={paginationInfo?.totalPages || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemName={t("admin.blogs.list.itemName", { defaultValue: "blog" })}
                showItemsPerPage={true}
                showJumpToPage={false}
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.blogs.list.deleteConfirmTitle", { defaultValue: "Are you absolutely sure?" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.blogs.list.deleteConfirmDescription", { defaultValue: "This action cannot be undone. This will permanently delete the blog post and remove all associated data." })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", { defaultValue: "Cancel" })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlog}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t("common.delete", { defaultValue: "Delete" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
