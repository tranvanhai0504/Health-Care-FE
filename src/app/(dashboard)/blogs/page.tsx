"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogService } from "@/services";
import { BlogGetAllResponse } from "@/services/blogs";
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
import { 
  Calendar, 
  Clock, 
  Tag, 
  TrendingUp, 
  Award,
  Bookmark,
  Search
} from "lucide-react";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<BlogGetAllResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getAllBlogsActive();
        setBlogs(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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

  // Filter blogs based on search query
  const filteredBlogs = gridBlogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto pb-8 px-4">
      {/* Header with site title and search */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Health Pulse</h1>
          <p className="text-gray-600 mt-1">Your source for healthcare insights</p>
        </div>
        <div className="mt-4 md:mt-0 relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {/* Featured post skeleton */}
          <div className="relative overflow-hidden rounded-xl h-[400px] w-full bg-gray-200 animate-pulse" />
          
          {/* Grid skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-full flex flex-col animate-pulse">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
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
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No blog posts available at the moment.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredBlog && (
            <div className="mb-12">
              <div className="relative overflow-hidden rounded-xl h-[400px] md:h-[500px] w-full group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <Image
                  src={"/images/sample-blog-image.png"}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="100vw"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 text-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-primary/90 text-white text-xs py-1 px-3 rounded-full">
                      Featured
                    </span>
                    <span className="text-white/80 text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(featuredBlog.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-3">
                    {featuredBlog.title}
                  </h2>
                  <Button asChild size="lg" className="mt-4">
                    <Link href={`/blogs/${featuredBlog._id}`}>
                      Read Article
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs and Blog Grid */}
          <div className="mb-8">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Latest Articles</h2>
                <TabsList>
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
                {searchQuery && filteredBlogs.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      No articles found matching &quot;{searchQuery}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(searchQuery ? filteredBlogs : gridBlogs).map((blog) => (
                      <Card
                        key={blog._id}
                        className="h-full flex flex-col overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={blog.coverImage || "/images/sample-blog-image.png"}
                            alt={blog.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <button 
                            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
                            aria-label="Bookmark article"
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-2 text-xl">
                            {blog.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(blog.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>5 min read</span>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center mt-2">
                            <Tag className="h-4 w-4 text-primary mr-2" />
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Healthcare
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Wellness
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="outline" className="w-full">
                            <Link href={`/blogs/${blog._id}`}>Read More</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="trending" className="mt-0">
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Trending articles will appear here based on reader activity.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="featured" className="mt-0">
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Editor&apos;s picks and featured articles will appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-primary/5 rounded-xl p-8 mt-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter to receive the latest health articles and updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogsPage;
