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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Save, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const blogService = new BlogService();

export default function EditBlogPage() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    active: true,
    coverImage: "",
    specialties: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const blogId = params.id as string;

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;

      try {
        const response = await blogService.getBlogById(blogId);
        const blogData = response.data;
        setBlog(blogData);
        setFormData({
          title: blogData.title || "",
          content: blogData.content || "",
          author: typeof blogData.author === 'string' ? blogData.author : blogData.author?.name || "",
          active: blogData.active ?? true,
          coverImage: blogData.coverImage || "",
          specialties: blogData.specialties || []
        });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput("");
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      await blogService.update(blogId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim() || "Admin",
        active: formData.active,
        coverImage: formData.coverImage.trim(),
        specialties: formData.specialties
      });

      toast({
        title: "Success",
        description: "Blog updated successfully",
        type: "success",
      });

      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error updating blog:", error);
      toast({
        title: "Error",
        description: "Failed to update blog",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/blogs");
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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
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
            The blog you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={handleCancel}>
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
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Blog
          </CardTitle>
          <CardDescription>
            Modify the blog post details and content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter blog title..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-medium">
                Author
              </Label>
              <Input
                id="author"
                type="text"
                placeholder="Enter author name..."
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-sm font-medium">
                Cover Image URL
              </Label>
              <Input
                id="coverImage"
                type="url"
                placeholder="Enter cover image URL..."
                value={formData.coverImage}
                onChange={(e) => handleInputChange("coverImage", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Content *
              </Label>
              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="w-full min-h-[300px] resize-y"
                required
              />
              <p className="text-xs text-muted-foreground">
                You can use Markdown formatting for rich text content.
              </p>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Related Specialties
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add specialty..."
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSpecialty}
                  disabled={!specialtyInput.trim()}
                >
                  Add
                </Button>
              </div>
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialties.map((specialty, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      <span>{specialty}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange("active", checked)}
              />
              <Label htmlFor="active" className="text-sm font-medium">
                Published (Active)
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.title.trim() || !formData.content.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 