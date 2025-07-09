import api from '@/lib/axios';
import { 
  ApiResponse, 
  ImageUploadResponse, 
  ImageUploadOptions 
} from '@/types';

export class ImageService {
  private basePath = '/api/v1/image';

  /**
   * Upload an image file
   * @param file - The image file to upload
   * @param options - Optional upload configuration
   * @returns Promise with the uploaded image information
   */
  async uploadImage(
    file: File,
    options?: ImageUploadOptions
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options) {
      if (options.category) formData.append('category', options.category);
      if (options.resize !== undefined) formData.append('resize', options.resize.toString());
      if (options.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
      if (options.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
    }

    const response = await api.post<ApiResponse<ImageUploadResponse>>(
      this.basePath,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  /**
   * Upload multiple images at once
   * @param files - Array of image files to upload
   * @param options - Optional upload configuration
   * @returns Promise with array of uploaded image information
   */
  async uploadMultipleImages(
    files: File[],
    options?: ImageUploadOptions
  ): Promise<ImageUploadResponse[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append(`images`, file);
    });
    
    if (options) {
      if (options.category) formData.append('category', options.category);
      if (options.resize !== undefined) formData.append('resize', options.resize.toString());
      if (options.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
      if (options.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
    }

    const response = await api.post<ApiResponse<ImageUploadResponse[]>>(
      `${this.basePath}/multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }
}

export const imageService = new ImageService(); 