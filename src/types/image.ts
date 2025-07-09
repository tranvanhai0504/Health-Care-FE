/**
 * Image upload response interface
 */
export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Image upload options interface
 */
export interface ImageUploadOptions {
  category?: string;
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
} 