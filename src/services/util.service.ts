import api from "@/lib/axios";

// Types for image upload response
interface ImageUploadSuccessResponse {
  success: true;
  data: {
    url: string;
    filename: string;
    size: number;
  };
}

interface ImageUploadErrorResponse {
  success: false;
  error: string;
}

type ImageUploadResponse = ImageUploadSuccessResponse | ImageUploadErrorResponse;

const utilService = {
  /**
   * Upload an image file
   */
  uploadImage: async (imageFile: File): Promise<ImageUploadSuccessResponse["data"]> => {
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await api.post<ImageUploadResponse>(
        "/api/v1/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check if the response indicates success
      if (response.data.success) {
        return response.data.data;
      } else {
        // Handle error response
        throw new Error(response.data.error || "Image upload failed");
      }
    } catch (error: unknown) {
      console.error("Image upload failed:", error);
      
      // Handle API error responses
      const apiError = error as { response?: { data?: { error?: string } }; message?: string };
      if (apiError.response?.data?.error) {
        throw new Error(apiError.response.data.error);
      }
      
      // Handle network or other errors
      throw new Error(apiError.message || "Failed to upload image");
    }
  },
};

export default utilService;
