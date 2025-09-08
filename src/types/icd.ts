/**
 * ICD (International Classification of Diseases) interface
 */
export interface ICD {
  _id: string;
  code: string;
  range: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * ICD search parameters
 */
export interface ICDSearchParams {
  q: string; // Search query
  page?: number;
  limit?: number;
}

/**
 * ICD get all parameters
 */
export interface ICDGetAllParams {
  page?: number;
  limit?: number;
  code?: string;
  range?: string;
  title?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}