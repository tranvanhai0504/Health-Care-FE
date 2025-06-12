"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { blogService } from "@/services";
import { Blog } from "@/services/blogs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, User, Tag } from "lucide-react";
import { convertMarkdown } from "@/utils/markdown";

const BlogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        if (!params.id) {
          throw new Error("Blog ID is missing");
        }

        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const response = await blogService.getBlogById(id);
        setBlog(response.data);
        setError(null);
        setContent(await convertMarkdown(response.data.content));
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.id]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="container mx-auto px-4">
      <Button
        variant="ghost"
        className="mb-6 pl-0"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blogs
      </Button>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg mt-6" />
          <div className="space-y-4 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      ) : blog ? (
        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-gray-600">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>

          {blog.coverImage && (
            <div className="relative h-64 md:h-96 w-full mb-8 overflow-hidden rounded-lg">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                quality={100}
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {blog.specialties && blog.specialties.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-gray-200">
            <Button asChild>
              <Link href="/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Blogs
              </Link>
            </Button>
          </div>
        </article>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Blog post not found.</p>
          <Button
            onClick={() => router.push("/blogs")}
            variant="outline"
            className="mt-4"
          >
            Back to Blogs
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;
