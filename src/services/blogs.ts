import BaseService, { ApiResponse } from "./base";

export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  coverImage?: string;
  specialties: string[];
}

export interface BlogGetAllResponse {
  title: string;
  _id: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

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
}
