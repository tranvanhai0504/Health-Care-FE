"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogService } from "@/services";
import { Blog } from "@/services/blogs";
import { Specialty, specialtyService } from "@/services/specialties";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Search,
  X,
  Filter,
  BookOpen,
  Mail,
} from "lucide-react";

interface BlogWithSpecialties extends Blog {
  specialtyDetails?: Specialty[];
}

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<BlogWithSpecialties[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch blogs and specialties in parallel
        const [blogsResponse, specialtiesResponse] = await Promise.all([
          blogService.getAllBlogsActive(),
          specialtyService.getAll(),
        ]);

        setSpecialties(specialtiesResponse);

        // Get full blog details for each blog to access specialties
        const blogsWithDetails = await Promise.all(
          blogsResponse.data.map(async (blogPreview) => {
            try {
              const fullBlogResponse = await blogService.getBlogById(
                blogPreview._id
              );
              return fullBlogResponse.data;
            } catch (err) {
              console.error(
                `Error fetching details for blog ${blogPreview._id}:`,
                err
              );
              return null;
            }
          })
        );

        // Filter out any null responses and enhance blogs with specialty details
        const validBlogs = blogsWithDetails.filter(
          (blog): blog is Blog => blog !== null
        );

        const enhancedBlogs = validBlogs.map((blog) => {
          const blogSpecialties = specialtiesResponse.filter((specialty) =>
            blog.specialties?.includes(specialty._id)
          );

          return {
            ...blog,
            specialtyDetails: blogSpecialties,
          };
        });

        setBlogs(enhancedBlogs);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only run once on mount

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get featured blog (first blog or null if no blogs)
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  // Get rest of the blogs for the grid
  const gridBlogs = blogs.length > 1 ? blogs.slice(1) : [];

  // Filter blogs based on search query and selected specialty
  const filteredBlogs = gridBlogs.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty
      ? blog.specialties?.includes(selectedSpecialty)
      : true;

    return matchesSearch && matchesSpecialty;
  });

  // Handle specialty selection
  const handleSpecialtyClick = (specialtyId: string) => {
    if (selectedSpecialty === specialtyId) {
      setSelectedSpecialty(null); // Deselect if already selected
    } else {
      setSelectedSpecialty(specialtyId);
    }
  };

  return (
    <div className="container mx-auto pb-8 px-4">
      {/* Hero section with header */}

      {/* Search and filter section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:ml-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Specialty Filter */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Filter by specialty:
              </h3>
              {selectedSpecialty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSpecialty(null)}
                  className="text-xs h-7 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filter
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedSpecialty === null ? "default" : "outline"}
                className={`cursor-pointer hover:bg-primary/10 ${
                  selectedSpecialty === null
                    ? "bg-primary text-white"
                    : "hover:text-primary"
                }`}
                onClick={() => setSelectedSpecialty(null)}
              >
                All Specialties
              </Badge>
              {specialties.map((specialty) => (
                <Badge
                  key={specialty._id}
                  variant={
                    selectedSpecialty === specialty._id ? "default" : "outline"
                  }
                  className={`cursor-pointer hover:bg-primary/10 ${
                    selectedSpecialty === specialty._id
                      ? "bg-primary text-white"
                      : "hover:text-primary"
                  }`}
                  onClick={() => handleSpecialtyClick(specialty._id)}
                >
                  {specialty.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-8">
          {/* Featured post skeleton */}
          <div className="relative overflow-hidden rounded-xl h-[400px] w-full bg-gray-100 animate-pulse" />

          {/* Grid skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card
                key={index}
                className="h-full flex flex-col animate-pulse border-none shadow"
              >
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center p-12 bg-red-50 rounded-lg border border-red-100">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Failed to load blogs
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No blog posts available
          </h3>
          <p className="text-gray-600">
            No blog posts available at the moment. Please check back later.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredBlog && (
            <div className="mb-12">
              <div className="relative overflow-hidden rounded-xl h-[400px] md:h-[500px] w-full group shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 z-10" />
                <Image
                  src={
                    featuredBlog.coverImage || "/images/sample-blog-image.png"
                  }
                  alt={featuredBlog.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100vw"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 text-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-primary text-white text-xs font-medium py-1 px-3 rounded-full">
                      Featured
                    </span>
                    <span className="text-white/80 text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(featuredBlog.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-3 text-white">
                    {featuredBlog.title}
                  </h2>
                  {featuredBlog.specialtyDetails &&
                    featuredBlog.specialtyDetails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featuredBlog.specialtyDetails.map((specialty) => (
                          <span
                            key={specialty._id}
                            className="text-xs bg-white/20 text-white px-2 py-1 rounded-full"
                          >
                            {specialty.name}
                          </span>
                        ))}
                      </div>
                    )}
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 bg-white text-primary hover:bg-white/90"
                  >
                    <Link href={`/blogs/${featuredBlog._id}`}>
                      Read Article
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs and Blog Grid */}
          <div className="mb-12">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Latest Articles</h2>
                  {filteredBlogs.length > 0 && (
                    <p className="text-gray-600 text-sm mt-1">
                      Showing {filteredBlogs.length} article
                      {filteredBlogs.length !== 1 ? "s" : ""}
                      {selectedSpecialty ? " in selected specialty" : ""}
                    </p>
                  )}
                </div>
                <TabsList className="bg-background border">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="trending">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="featured">
                    <Award className="h-4 w-4 mr-1" />
                    Featured
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                {filteredBlogs.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600">
                      {searchQuery && selectedSpecialty
                        ? `No articles found matching "${searchQuery}" in the selected specialty.`
                        : searchQuery
                        ? `No articles found matching "${searchQuery}".`
                        : "No articles found in the selected specialty."}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedSpecialty(null);
                      }}
                      className="mt-4"
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                      <Card
                        key={blog._id}
                        className="h-full flex flex-col overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                          <Image
                            src={
                              blog.coverImage || "/images/sample-blog-image.png"
                            }
                            alt={blog.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute top-3 left-3 z-20">
                            <span className="bg-white/80 backdrop-blur-sm text-primary text-xs font-medium py-1 px-2 rounded-md">
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                            {blog.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>5 min read</span>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center mt-2">
                            <div className="flex flex-wrap gap-1.5">
                              {blog.specialtyDetails &&
                              blog.specialtyDetails.length > 0 ? (
                                blog.specialtyDetails.map((specialty) => (
                                  <span
                                    key={specialty._id}
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      selectedSpecialty === specialty._id
                                        ? "bg-primary text-white"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSpecialtyClick(specialty._id);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {specialty.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Healthcare
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="default" className="w-full">
                            <Link href={`/blogs/${blog._id}`}>Read More</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="mt-0">
                <div className="text-center p-12 bg-gray-50 rounded-lg border">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Trending Articles
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Trending articles will appear here based on reader activity
                    and engagement.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="featured" className="mt-0">
                <div className="text-center p-12 bg-gray-50 rounded-lg border">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Featured Articles
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Editor&apos;s picks and featured articles will appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mt-12 border border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Subscribe to our newsletter to receive the latest health
                articles, wellness tips, and updates directly in your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white flex-grow"
                />
                <Button className="whitespace-nowrap">Subscribe</Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogsPage;
