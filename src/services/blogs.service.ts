import BaseService from "./base.service";
import api from "@/lib/axios";
import { 
  Blog,
  BlogGetAllResponse,
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams
} from "@/types";

export class BlogService extends BaseService<Blog> {
  constructor() {
    super("/api/v1/blog");
  }

  async getAllBlogs(): Promise<ApiResponse<BlogGetAllResponse[]>> {
    return this.getFullResponse<BlogGetAllResponse[]>(this.basePath);
  }

  async getAllBlogsActive(): Promise<ApiResponse<BlogGetAllResponse[]>> {
    return this.getFullResponse<BlogGetAllResponse[]>(`${this.basePath}/active`);
  }

  /**
   * Get active blogs with pagination support
   * @param params - Pagination parameters
   * @returns Promise with paginated response containing blogs and pagination info
   */
  async getActiveBlogsPaginated(params?: PaginationParams): Promise<PaginatedApiResponse<BlogGetAllResponse>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<BlogGetAllResponse>>>(`${this.basePath}/active`, {
      params
    });
    return response.data.data;
  }

  async getBlogById(id: string): Promise<ApiResponse<Blog>> {
    return this.getFullResponse<Blog>(`${this.basePath}/${id}`);
  }

  // New function to get latest blog posts with a limit
  async getLatestBlogPosts(limit: number = 3): Promise<BlogGetAllResponse[]> {
    try {
      const response = await this.getFullResponse<BlogGetAllResponse[]>(
        `${this.basePath}/active?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching latest blog posts:", error);
      return [];
    }
  }

  /**
   * Create a new blog
   * @param data - The blog data to create
   * @returns Promise with the created blog
   */
  async create(data: Partial<Blog>): Promise<Blog> {
    const response = await api.post<ApiResponse<Blog>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Create multiple blogs at once
   * @param data - Array of blogs to create
   * @returns Promise with the created blogs
   */
  async createMany(data: Partial<Blog>[]): Promise<Blog[]> {
    const response = await api.post<ApiResponse<Blog[]>>(`${this.basePath}/createMany`, data);
    return response.data.data || response.data;
  }

  /**
   * Update an existing blog
   * @param id - The ID of the blog to update
   * @param data - The blog data to update
   * @returns Promise with the updated blog
   */
  async update(id: string, data: Partial<Blog>): Promise<Blog> {
    const response = await api.put<ApiResponse<Blog>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a blog
   * @param id - The ID of the blog to delete
   * @returns Promise with the deleted blog or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<Blog>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Toggle blog status (active/inactive)
   * @param id - The ID of the blog to toggle
   * @returns Promise with the updated blog
   */
  async toggleStatus(id: string): Promise<Blog> {
    const response = await api.patch<ApiResponse<Blog>>(`${this.basePath}/${id}/toggle`);
    return response.data.data;
  }
}

export const blogService = new BlogService();
