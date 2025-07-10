"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { BlogService } from "@/services/blogs.service";
import { Blog } from "@/types";
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
import { ArrowLeft, FileText, Pencil, Calendar, User, Tag } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const blogService = new BlogService();

export default function ViewBlogPage() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const blogId = params.id as string;

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;

      try {
        const response = await blogService.getBlogById(blogId);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast({
          title: "Error",
          description: "Failed to load blog data",
          type: "error",
        });
        router.push("/admin/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, router, toast]);

  const handleBack = () => {
    router.push("/admin/blogs");
  };

  const handleEdit = () => {
    router.push(`/admin/blogs/edit/${blogId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Blog not found</h3>
          <p className="text-muted-foreground mb-6">
            The blog you're looking for doesn't exist.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                {blog.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {blog.author || "Unknown Author"}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(blog.createdAt)}
                </div>
                <Badge variant={blog.active ? "default" : "secondary"}>
                  {blog.active ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
            <Button onClick={handleEdit} className="ml-4">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Blog
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-6">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Blog Meta Information */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Created:</span> {formatDate(blog.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(blog.updatedAt)}
              </div>
              <div>
                <span className="font-medium">Author:</span> {blog.author || "Unknown"}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={blog.active ? "default" : "secondary"} className="ml-1">
                  {blog.active ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Specialties */}
          {blog.specialties && blog.specialties.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Related Specialties:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {blog.content}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Button>
            <Button onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Blog
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 