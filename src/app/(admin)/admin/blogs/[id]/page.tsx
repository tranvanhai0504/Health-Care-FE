"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { BlogService } from "@/services/blogs.service";
import { specialtyService } from "@/services/specialties.service";
import { Blog, Specialty } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  CalendarDays,
  Tags,
  Image as ImageIcon,
} from "lucide-react";
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

// Create services outside the component
const blogService = new BlogService();
  // Use the imported specialtyService instance

export default function ViewBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogData();
  }, [id]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(id);
      setBlogData(response.data);

      // Fetch specialties data
      const specialtiesResponse = await specialtyService.getAll();
      setSpecialties(specialtiesResponse);
    } catch (error) {
      console.error("Error fetching blog details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blog details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = () => {
    router.push(`/admin/blogs/edit/${id}`);
  };

  const handleDeleteBlog = async () => {
    try {
      await blogService.delete(id);
      toast({
        title: "Success",
        description: "Blog deleted successfully",
        type: "success",
      });
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        type: "error",
      });
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get specialty names based on IDs
  const getSpecialtyNames = (specialtyIds: string[]) => {
    if (!specialtyIds || specialtyIds.length === 0) return [];
    return specialties
      .filter((specialty) => specialtyIds.includes(specialty._id))
      .map((specialty) => specialty.name);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Blog Not Found</h2>
        <p className="mb-6">
          The blog you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/admin/blogs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/blogs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditBlog}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Blog
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteAlertOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Blog
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{blogData.title}</CardTitle>
                  <CardDescription className="mt-1">
                    ID: {blogData._id}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {blogData.coverImage && (
                  <div className="mb-6">
                    <img
                      src={blogData.coverImage}
                      alt={blogData.title}
                      className="w-full h-auto rounded-lg max-h-[300px] object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Content
                  </h3>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: blogData.content }}
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tags className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">Specialties</h3>
                  </div>
                  {blogData.specialties && blogData.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getSpecialtyNames(blogData.specialties).map(
                        (name, i) => (
                          <Badge key={i} variant="secondary">
                            {name}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No specialties tagged
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Author Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Author
                  </h4>
                  <p className="font-medium">{blogData.author}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Publication
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Created At
                  </h4>
                  <p className="font-medium">
                    {formatDate(blogData.createdAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Updated At
                  </h4>
                  <p className="font-medium">
                    {formatDate(blogData.updatedAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h4>
                  <Badge variant={blogData.active ? "success" : "secondary"}>
                    {blogData.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {blogData.coverImage && (
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-muted/50 rounded-t-lg border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Image URL
                  </h4>
                  <p className="text-xs break-all">{blogData.coverImage}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlog}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
