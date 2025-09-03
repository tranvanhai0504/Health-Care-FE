"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BlogService } from "@/services/blogs.service";
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
import { ArrowLeft, FileText, Save, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const blogService = new BlogService();

export default function CreateBlogPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    active: true,
    coverImage: "",
    specialties: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const router = useRouter();
  const { toast } = useToast();

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
        title: t("admin.blogs.create.validationError"),
        description: t("admin.blogs.create.titleContentRequired"),
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await blogService.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim() || "Admin",
        active: formData.active,
        coverImage: formData.coverImage.trim(),
        specialties: formData.specialties
      });

      toast({
        title: t("admin.blogs.create.success"),
        description: t("admin.blogs.create.blogCreatedSuccessfully"),
        type: "success",
      });

      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      toast({
        title: t("admin.blogs.create.error"),
        description: t("admin.blogs.create.failedToCreateBlog"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/blogs");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("admin.blogs.create.backToBlogs")}
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("admin.blogs.create.title")}
          </CardTitle>
          <CardDescription>
            {t("admin.blogs.create.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                {t("admin.blogs.create.form.title")} *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder={t("admin.blogs.create.form.titlePlaceholder")}
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-medium">
                {t("admin.blogs.create.form.author")}
              </Label>
              <Input
                id="author"
                type="text"
                placeholder={t("admin.blogs.create.form.authorPlaceholder")}
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-sm font-medium">
                {t("admin.blogs.create.form.coverImage")}
              </Label>
              <Input
                id="coverImage"
                type="url"
                placeholder={t("admin.blogs.create.form.coverImagePlaceholder")}
                value={formData.coverImage}
                onChange={(e) => handleInputChange("coverImage", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                {t("admin.blogs.create.form.content")} *
              </Label>
              <Textarea
                id="content"
                placeholder={t("admin.blogs.create.form.contentPlaceholder")}
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="w-full min-h-[300px] resize-y"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.blogs.create.form.markdownNote")}
              </p>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("admin.blogs.create.form.specialties")}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t("admin.blogs.create.form.specialtyPlaceholder")}
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
                  {t("admin.blogs.create.form.addSpecialty")}
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
                {t("admin.blogs.create.form.activeDescription")}
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? t("admin.blogs.create.creating") : t("admin.blogs.create.createBlog")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 