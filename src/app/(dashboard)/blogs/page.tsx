"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { blogService, specialtyService } from "@/services";
import { Blog, Specialty, PaginationInfo } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Search,
  X,
  BookOpen,
  Eye,
  ArrowRight,
} from "lucide-react";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { formatDate } from "@/utils/date";

interface BlogWithSpecialties extends Blog {
  specialtyDetails?: Specialty[];
}

const BlogsPage = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<BlogWithSpecialties[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogWithSpecialties[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Fetch initial data without pagination for featured blog and specialty filter
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
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

        setAllBlogs(enhancedBlogs);
        setError(null);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(t("dashboard.blogs.failedToLoadBlog"));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [t]);

  // Fetch paginated blogs for the grid
  useEffect(() => {
    const fetchPaginatedBlogs = async () => {
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedSpecialty) {
          params.specialty = selectedSpecialty;
        }

        const response = await blogService.getActiveBlogsPaginated(params);

        // Get full blog details and enhance with specialty information
        const blogsWithDetails = await Promise.all(
          response.data.map(async (blogPreview) => {
            try {
              const fullBlogResponse = await blogService.getBlogById(
                blogPreview._id
              );
              const blog = fullBlogResponse.data;

              const blogSpecialties = specialties.filter((specialty) =>
                blog.specialties?.includes(specialty._id)
              );

              return {
                ...blog,
                specialtyDetails: blogSpecialties,
              };
            } catch (err) {
              console.error(
                `Error fetching details for blog ${blogPreview._id}:`,
                err
              );
              return null;
            }
          })
        );

        const validBlogs = blogsWithDetails.filter(
          (blog) => blog !== null
        ) as BlogWithSpecialties[];
        setBlogs(validBlogs);
        setPaginationInfo(response.pagination);
      } catch (err) {
        console.error("Error fetching paginated blogs:", err);
      }
    };

    if (specialties.length > 0) {
      fetchPaginatedBlogs();
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedSpecialty, specialties]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSpecialty]);

  // Get featured blog (first blog from all blogs or null if no blogs)
  const featuredBlog = allBlogs.length > 0 ? allBlogs[0] : null;

  // Handle specialty selection
  const handleSpecialtyClick = (specialtyId: string) => {
    if (selectedSpecialty === specialtyId) {
      setSelectedSpecialty(null); // Deselect if already selected
    } else {
      setSelectedSpecialty(specialtyId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t("dashboard.blogs.page.title")}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t("dashboard.blogs.page.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mb-6 min-h-[40px]">
          {/* Search Input */}
          <div className="relative w-64 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder={t("dashboard.blogs.page.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 text-sm border-gray-300 focus:border-primary rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Scrollable Specialty Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm text-gray-500 flex-shrink-0">{t("dashboard.blogs.page.filterLabel")}</span>
            <div
              className="flex gap-1.5 overflow-x-auto py-2 scroll-horizontal"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db transparent",
              }}
            >
              <Badge
                variant={selectedSpecialty === null ? "default" : "outline"}
                className={`cursor-pointer text-xs px-3 py-1 transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedSpecialty === null
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedSpecialty(null)}
              >
                {t("dashboard.blogs.page.allSpecialties")}
              </Badge>
              {specialties.map((specialty) => (
                <Badge
                  key={specialty._id}
                  variant={
                    selectedSpecialty === specialty._id ? "default" : "outline"
                  }
                  className={`cursor-pointer text-xs px-3 py-1 transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedSpecialty === specialty._id
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSpecialtyClick(specialty._id)}
                >
                  {specialty.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filter Button */}
          {selectedSpecialty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSpecialty(null)}
              className="h-10 px-3 text-sm text-gray-600 hover:text-gray-800 flex-shrink-0"
            >
              <X className="h-3 w-3 mr-1" />
              {t("dashboard.blogs.page.clearFilter")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            {/* Featured post skeleton */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <Skeleton className="h-80 w-full" />
              <div className="p-8">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Grid skeletons */}
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
                >
                  <div className="flex gap-6">
                    <Skeleton className="h-32 w-48 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("dashboard.blogs.page.somethingWentWrong")}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90"
            >
              {t("dashboard.blogs.page.tryAgain")}
            </Button>
          </div>
        ) : allBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-6">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("dashboard.blogs.page.noArticlesYet")}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {t("dashboard.blogs.page.noArticlesYetDescription")}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredBlog && (
              <div className="mb-12">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 group">
                  <div className="relative h-80 md:h-96 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <Image
                      src={
                        featuredBlog.coverImage ||
                        "/images/sample-blog-image.png"
                      }
                      alt={featuredBlog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="100vw"
                      priority
                    />
                    <div className="absolute top-6 left-6 z-20">
                      <span className="bg-primary text-white text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                        {t("dashboard.blogs.page.featuredArticle")}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                      <div className="max-w-3xl">
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-white/80 text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(featuredBlog.createdAt)}
                          </span>
                          <span className="text-white/80 text-sm flex items-center">
                            <Clock className="h-4 w-4 mr-2" />5 {t("dashboard.blogs.page.readTime")}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                          {featuredBlog.title}
                        </h2>
                        {featuredBlog.specialtyDetails &&
                          featuredBlog.specialtyDetails.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {featuredBlog.specialtyDetails.map(
                                (specialty) => (
                                  <span
                                    key={specialty._id}
                                    className="text-sm bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                                  >
                                    {specialty.name}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        <Button
                          asChild
                          size="lg"
                          className="bg-white text-primary hover:bg-white/90 font-semibold"
                        >
                          <Link
                            href={`/blogs/${featuredBlog._id}`}
                            className="inline-flex items-center"
                          >
                            {t("dashboard.blogs.page.readFullArticle")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Section */}
            <div className="mb-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("dashboard.blogs.page.latestArticles")}
                </h2>
                {paginationInfo && (
                  <p className="text-gray-600">
                    {t("dashboard.blogs.page.showingResults")}{" "}
                    {(paginationInfo.page - 1) * paginationInfo.limit + 1}-
                    {Math.min(
                      paginationInfo.page * paginationInfo.limit,
                      paginationInfo.total
                    )}{" "}
                    {t("dashboard.blogs.page.of")} {paginationInfo.total} {paginationInfo.total !== 1 ? t("dashboard.blogs.page.articles") : t("dashboard.blogs.page.article")}
                    {selectedSpecialty ? ` ${t("dashboard.blogs.page.inSelectedSpecialty")}` : ""}
                  </p>
                )}
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-6">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("dashboard.blogs.page.noArticlesFound")}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery && selectedSpecialty
                      ? t("dashboard.blogs.page.noArticlesFoundDescription.searchAndSpecialty", { searchQuery })
                      : searchQuery
                      ? t("dashboard.blogs.page.noArticlesFoundDescription.searchOnly", { searchQuery })
                      : selectedSpecialty
                      ? t("dashboard.blogs.page.noArticlesFoundDescription.specialtyOnly")
                      : t("dashboard.blogs.page.noArticlesFoundDescription.default")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSpecialty(null);
                    }}
                  >
                    {t("dashboard.blogs.page.clearAllFilters")}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Articles List */}
                  <div className="space-y-6">
                    {blogs.map((blog) => (
                      <article
                        key={blog._id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                      >
                        <div className="flex flex-col lg:flex-row">
                          {/* Image */}
                          <div className="relative lg:w-80 h-64 lg:h-auto overflow-hidden">
                            <Image
                              src={
                                blog.coverImage ||
                                "/images/sample-blog-image.png"
                              }
                              alt={blog.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 1024px) 100vw, 320px"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium py-1 px-3 rounded-full">
                                {formatDate(blog.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-8">
                            <div className="h-full flex flex-col">
                              {/* Specialties */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {blog.specialtyDetails &&
                                blog.specialtyDetails.length > 0 ? (
                                  blog.specialtyDetails.map((specialty) => (
                                    <Badge
                                      key={specialty._id}
                                      variant="secondary"
                                      className={`cursor-pointer text-xs font-medium rounded-full transition-all ${
                                        selectedSpecialty === specialty._id
                                          ? "bg-primary text-white"
                                          : "bg-primary/10 text-primary hover:bg-primary/20"
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleSpecialtyClick(specialty._id);
                                      }}
                                    >
                                      {specialty.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-primary/10 text-primary text-xs rounded-full"
                                  >
                                    {t("dashboard.blogs.page.healthcare")}
                                  </Badge>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {blog.title}
                              </h3>

                              {/* Meta Info */}
                              <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />5 {t("dashboard.blogs.page.readTime")}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  1.2k {t("dashboard.blogs.page.views")}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="mt-auto flex items-center justify-between">
                                <Button
                                  asChild
                                  className="bg-primary hover:bg-primary/90 font-semibold"
                                >
                                  <Link
                                    href={`/blogs/${blog._id}`}
                                    className="inline-flex items-center"
                                  >
                                    {t("dashboard.blogs.page.readArticle")}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  <PaginationWrapper
                    paginationInfo={paginationInfo}
                    currentPage={paginationInfo.page}
                    totalPages={paginationInfo.totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    itemName={t("dashboard.blogs.page.article")}
                    showItemsPerPage={true}
                    showJumpToPage={false}
                    itemsPerPageOptions={[6, 9, 12, 24]}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
