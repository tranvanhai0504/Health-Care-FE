"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogService } from "@/services";
import { BlogGetAllResponse } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BlogSection() {
  const [blogs, setBlogs] = useState<BlogGetAllResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setLoading(true);
        // Use the latest blog posts method with a limit of 4
        const response = await blogService.getActiveBlogsPaginated({ 
          page: 1, 
          limit: 4
        });
          
        // Handle different response structures
        let blogsData: BlogGetAllResponse[] = [];
        
        if (Array.isArray(response.data)) {
          // Direct array response
          blogsData = response.data;
        } else if (response && typeof response === 'object' && 'data' in response) {
          // Response with data property
          const dataProperty = (response as { data: unknown }).data;
          if (Array.isArray(dataProperty)) {
            blogsData = dataProperty;
          } else {
            console.error("Expected blogs data to be array but got:", typeof dataProperty, dataProperty);
          }
        } else {
          console.error("Unexpected blogs response structure:", typeof response, response);
        }
        
        setBlogs(Array.isArray(blogsData) ? blogsData : []);
      } catch (error) {
        console.error("Error fetching latest blogs:", error);
        // Fallback to the older method if the new one fails
        try {
          const latestBlogs = await blogService.getLatestBlogPosts(4);
          // Handle the fallback response structure too
          if (Array.isArray(latestBlogs)) {
            setBlogs(latestBlogs);
          } else {
            console.error("Fallback blogs response is not an array:", typeof latestBlogs, latestBlogs);
            setBlogs([]);
          }
        } catch (fallbackError) {
          console.error("Error fetching blogs with fallback method:", fallbackError);
          setBlogs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBlogs();
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Mock categories based on blog index (in a real app, these would come from your API)
  const getCategory = (index: number) => {
    const categories = ["Wellness", "Medical Research", "Nutrition", "Mental Health"];
    return categories[index % categories.length];
  };

  return (
    <section className="py-10 md:py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col items-center mb-16">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/15">
            Health & Wellness
          </Badge>
          <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Latest Health Updates
          </h2>
          <p className="text-gray-600 text-center max-w-2xl text-lg">
            Stay informed with our latest healthcare articles, tips, and
            insights from our medical experts.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="bg-white rounded-xl shadow-sm animate-pulse"
              >
                <div className="h-52 bg-gray-200 rounded-t-xl"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">
              No articles available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {blogs.length > 0 && (
              <div className="mb-12">
                <Link href={`/blogs/${blogs[0]._id}`} className="block group">
                  <Card className="overflow-hidden rounded-xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/15">
                            Featured Article
                          </Badge>
                          <CardTitle className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                            {blogs[0].title}
                          </CardTitle>
                          <CardContent className="p-0 text-gray-600 line-clamp-3 mb-6">
                            Read our featured article for the latest healthcare insights and recommendations from our experts.
                          </CardContent>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(blogs[0].createdAt)}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>5 min read</span>
                          </div>
                          <Button variant="ghost" size="sm" className="group/btn">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                      <div className="md:col-span-2 relative h-56 md:h-auto overflow-hidden">
                        <Image
                          src={blogs[0].coverImage || "/images/blog-placeholder.jpg"}
                          alt={blogs[0].title}
                          fill
                          className="object-cover rounded-b-xl md:rounded-r-xl md:rounded-bl-none transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            )}

            {/* Regular Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(blogs) && blogs.length > 1 ? blogs.slice(1).map((blog, index) => (
                <Card
                  key={blog._id}
                  className="h-full flex flex-col overflow-hidden rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-primary/20 group"
                >
                  <Link href={`/blogs/${blog._id}`} className="flex flex-col h-full">
                    <div className="relative h-52 w-full overflow-hidden">
                      <Badge className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white/90 backdrop-blur-sm text-primary">
                        {getCategory(index)}
                      </Badge>
                      <Image
                        src={blog.coverImage || "/images/blog-placeholder.jpg"}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
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
                      <p className="text-gray-600 line-clamp-3">
                        Read this article to learn more about the latest healthcare insights and recommendations.
                      </p>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 bg-gray-50 py-3">
                      <span className="text-primary font-medium flex items-center group-hover:underline">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardFooter>
                  </Link>
                </Card>
              )) : null}
            </div>
          </>
        )}

        <div className="mt-16 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 group shadow-sm hover:shadow hover:bg-primary/5 hover:text-primary hover:border-primary/20">
            <Link href="/blogs" className="flex items-center">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
