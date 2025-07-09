"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import { BlogService } from "@/services/blogs.service";
import { specialtyService } from "@/services/specialties.service";
import { Specialty } from "@/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FileText,
  ArrowLeft,
  Image as ImageIcon,
  Tags,
  FileCode,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

// Create blog service outside the component
const blogService = new BlogService();

// Main form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  author: z.string().min(1, "Author name is required"),
  coverImage: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  specialties: z.array(z.string()).optional(),
  active: z.boolean().default(true),
});

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      author: "",
      coverImage: "",
      specialties: [],
      active: true,
    },
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch blog data
        const blogResponse = await blogService.getBlogById(id);
        const blogData = blogResponse.data;
        
        // Fetch specialties data
        const specialtiesResponse = await specialtyService.getAll();
        setSpecialties(specialtiesResponse);
        
        // Set form values
        form.reset({
          title: blogData.title,
          content: blogData.content,
          author: blogData.author,
          coverImage: blogData.coverImage || "",
          specialties: blogData.specialties || [],
          active: blogData.active,
        });
        
        setEditorContent(blogData.content);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch blog data",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Update form when editor content changes
  useEffect(() => {
    form.setValue("content", editorContent);
  }, [editorContent, form]);
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Remove empty optional fields
      const blogData = { ...data };
      if (!blogData.coverImage) delete blogData.coverImage;
      if (!blogData.specialties || blogData.specialties.length === 0) delete blogData.specialties;
      
      await blogService.update(id, blogData);
      
      toast({
        title: "Success",
        description: "Blog updated successfully",
        type: "success",
      });
      
      // Redirect to the blog detail view
      router.push(`/admin/blogs/${id}`);
    } catch (error) {
      console.error("Error updating blog:", error);
      toast({
        title: "Error",
        description: "Failed to update blog",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px] mt-2" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.push(`/admin/blogs/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
      </Button>
      
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5" /> Edit Blog
            </CardTitle>
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="blog-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    htmlFor="blog-active"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {field.value ? "Active" : "Inactive"}
                  </label>
                </div>
              )}
            />
          </div>
          <CardDescription>
            Update blog content, images, and specialties
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="basic" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Basic Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-1">
                    <FileCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Content</span>
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Media</span>
                  </TabsTrigger>
                  <TabsTrigger value="specialties" className="flex items-center gap-1">
                    <Tags className="h-4 w-4" />
                    <span className="hidden sm:inline">Specialties</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blog Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter blog title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("content")}
                    >
                      Next: Content
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blog Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter blog content (HTML format is supported)"
                            className="min-h-[300px] font-mono"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setEditorContent(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          You can use HTML to format your content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("media")}
                    >
                      Next: Media
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the URL for the blog cover image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("coverImage") && (
                    <div className="mt-4">
                      <FormLabel>Preview</FormLabel>
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <Image 
                          src={form.watch("coverImage") || ""} 
                          alt="Cover Preview" 
                          width={600}
                          height={400}
                          className="w-full h-auto max-h-[200px] object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("content")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("specialties")}
                    >
                      Next: Specialties
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="specialties" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialties</FormLabel>
                        <FormDescription>
                          Select specialties relevant to this blog
                        </FormDescription>
                        <div className="mt-2 space-y-2">
                          {specialties.map((specialty) => (
                            <div key={specialty._id} className="flex items-center space-x-2">
                              <Checkbox
                                id={specialty._id}
                                checked={field.value?.includes(specialty._id)}
                                onCheckedChange={(checked: boolean) => {
                                  const currentSpecialties = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentSpecialties, specialty._id]);
                                  } else {
                                    field.onChange(
                                      currentSpecialties.filter((id) => id !== specialty._id)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={specialty._id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {specialty.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("media")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Blog"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 