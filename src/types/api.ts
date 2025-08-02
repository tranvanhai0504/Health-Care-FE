/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated API response format
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  message?: string;
  success?: boolean;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GetManyParams {
  options?: {
    filter?: Record<string, unknown>;
    sort?: Record<string, unknown>;
    populateOptions?: Record<string, unknown>;
    pagination?: PaginationParams;
  };
  limit?: number;
  page?: number;
}
