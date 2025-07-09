/**
 * Blog interface
 */
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

/**
 * Blog get all response interface
 */
export interface BlogGetAllResponse {
  title: string;
  _id: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
} 