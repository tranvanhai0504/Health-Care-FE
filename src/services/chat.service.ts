import BaseService from "./base.service";
import api from "@/lib/axios";
import { ChatRequest, ChatResponse, ChatError, ApiResponse } from "@/types";

export class ChatService extends BaseService<ChatResponse> {
  private endpoints = ["/api/v1/chat", "/chat", "/api/chat", "/api/v1/ai/chat"];
  private currentEndpointIndex = 0;

  constructor() {
    super("/api/v1/chat");
  }

  /**
   * Send a message to the AI chat endpoint with fallback endpoints
   * @param request - The chat request containing message and context
   * @returns Promise with the AI response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    let lastError: unknown;

    // Try each endpoint until one works
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        let data: FormData | Record<string, unknown>;
        let config: Record<string, unknown> | undefined;

        if (request.image && request.image instanceof File) {
          const formData = new FormData();

          // Handle each field properly
          formData.append('message', request.message);
          
          if (request.conversationId) {
            formData.append('conversationId', request.conversationId);
          }
          
          if (request.context) {
            formData.append('context', JSON.stringify(request.context));
          }
          
          formData.append('image', request.image);
         
          data = formData;
          config = { 
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 600000 // 30 seconds for image uploads
          };
        } else {
          data = {
            message: request.message,
            conversationId: request.conversationId,
            context: request.context,
          };
          config = { timeout: 600000 }; // 30 seconds for regular messages
        }

        const response = await api.post<ApiResponse<ChatResponse>>(
          endpoint,
          data,
          config
        );

        // If successful, update the base path for future requests
        this.basePath = endpoint;
        this.currentEndpointIndex = i;

        const responseData = response.data.data;
        
        // Check if the response contains a special form JSON structure
        if (responseData.reply) {
          try {
            // Try to parse the reply as JSON to check for form data
            const parsedReply = JSON.parse(responseData.reply);

            // Normalize possible backend field names to our expected FormResponse shape
            const maybeData = parsedReply?.data;
            const maybeAction = parsedReply?.action || parsedReply?.method; // backend may send "method"
            const maybeEndpoint = parsedReply?.endpoint || parsedReply?.url; // backend may send "url"

            if (maybeData && maybeAction && maybeEndpoint) {
              return {
                ...responseData,
                reply:
                  "I've prepared a schedule for you. Please review and confirm the details below.",
                formResponse: {
                  type: "form",
                  data: maybeData,
                  action: maybeAction,
                  endpoint: maybeEndpoint,
                },
              };
            }
          } catch {
            // Not JSON, continue with normal response
          }
        }

        return responseData;
      } catch (error) {
        console.error(`Chat endpoint ${endpoint} failed:`, error);
        lastError = error;

        // If it's a 404, try the next endpoint
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          error.response.status === 404
        ) {
          continue;
        }

        // For other errors, don't try other endpoints
        break;
      }
    }

    // All endpoints failed, throw a more helpful error
    console.error("All chat endpoints failed. Tried:", this.endpoints);

    const chatError: ChatError = {
      code: "ENDPOINT_NOT_FOUND",
      message: `Chat service is not available. Tried endpoints: ${this.endpoints.join(
        ", "
      )}. Please contact support.`,
      retryable: false,
      details: `Last error: ${
        lastError instanceof Error ? lastError.message : "Unknown error"
      }`,
    };

    throw chatError;
  }

  /**
   * Send a message with streaming response (if supported by backend)
   * @param request - The chat request containing message and context
   * @param onChunk - Callback for handling streaming chunks
   * @returns Promise with the complete response
   */
  async sendMessageStream(
    request: ChatRequest,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      const response = await api.post<ApiResponse<ChatResponse>>(
        `${this.basePath}/stream`,
        request,
        {
          responseType: "stream",
          timeout: 600000, // 30 seconds for streaming
          onDownloadProgress: (progressEvent) => {
            if (onChunk && progressEvent.event?.target?.response) {
              const chunk = progressEvent.event.target.response;
              onChunk(chunk);
            }
          },
        }
      );
      return response.data.data;
    } catch (error) {
      // Fall back to regular message sending if streaming fails
      console.warn("Streaming failed, falling back to regular message:", error);
      return this.sendMessage(request);
    }
  }

  /**
   * Get conversation history
   * @param conversationId - The ID of the conversation to retrieve
   * @returns Promise with the conversation data
   */
  async getConversation(conversationId: string): Promise<ChatResponse[]> {
    try {
      const response = await api.get<ApiResponse<ChatResponse[]>>(
        `${this.basePath}/conversation/${conversationId}`,
        { timeout: 600000 } // 30 seconds
      );
      return response.data.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Delete a conversation
   * @param conversationId - The ID of the conversation to delete
   * @returns Promise with success response
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(
        `${this.basePath}/conversation/${conversationId}`,
        { timeout: 600000 } // 30 seconds
      );
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Get user's conversation list
   * @returns Promise with array of conversation summaries
   */
  async getConversations(): Promise<
    Array<{
      id: string;
      title: string;
      lastMessage: string;
      updatedAt: string;
    }>
  > {
    try {
      const response = await api.get<
        ApiResponse<
          Array<{
            id: string;
            title: string;
            lastMessage: string;
            updatedAt: string;
          }>
        >
      >(`${this.basePath}/conversations`, { timeout: 600000 }); // 30 seconds
      return response.data.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Update conversation title
   * @param conversationId - The ID of the conversation
   * @param title - The new title
   * @returns Promise with success response
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<void> {
    try {
      await api.patch<ApiResponse<void>>(
        `${this.basePath}/conversation/${conversationId}`,
        { title },
        { timeout: 600000 } // 30 seconds
      );
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Get AI chat suggestions based on context
   * @param context - Current context (page, user info, etc.)
   * @returns Promise with suggested questions/prompts
   */
  async getSuggestions(context?: {
    currentPage?: string;
    userRole?: string;
  }): Promise<string[]> {
    try {
      const response = await api.get<ApiResponse<string[]>>(
        `${this.basePath}/suggestions`,
        { 
          params: context,
          timeout: 600000 // 30 seconds
        }
      );
      return response.data.data;
    } catch (error) {
      // Return empty array if suggestions fail - not critical
      console.warn("Failed to get chat suggestions:", error);
      return [];
    }
  }

  /**
   * Transform API errors into user-friendly chat errors
   * @param error - The original error
   * @returns Transformed ChatError
   */
  private transformError(error: unknown): ChatError {
    // Default error
    let chatError: ChatError = {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred. Please try again.",
      retryable: true,
    };

    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      const { status, data } = error.response as {
        status: number;
        data: { message?: string };
      };

      switch (status) {
        case 400:
          chatError = {
            code: "BAD_REQUEST",
            message:
              data.message || "Invalid request. Please check your message.",
            retryable: false,
          };
          break;
        case 401:
          chatError = {
            code: "UNAUTHORIZED",
            message: "Please sign in to continue chatting.",
            retryable: false,
          };
          break;
        case 403:
          chatError = {
            code: "FORBIDDEN",
            message: "You do not have permission to use the chat feature.",
            retryable: false,
          };
          break;
        case 404:
          chatError = {
            code: "ENDPOINT_NOT_FOUND",
            message: "Chat service is not available. Please contact support.",
            retryable: false,
          };
          break;
        case 429:
          chatError = {
            code: "RATE_LIMITED",
            message:
              "Too many messages. Please wait a moment before sending another.",
            retryable: true,
          };
          break;
        case 500:
          chatError = {
            code: "SERVER_ERROR",
            message:
              "AI service is temporarily unavailable. Please try again later.",
            retryable: true,
          };
          break;
        default:
          chatError.message = data.message || chatError.message;
      }
    } else if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "NETWORK_ERROR"
    ) {
      chatError = {
        code: "NETWORK_ERROR",
        message:
          "Network connection failed. Please check your internet connection.",
        retryable: true,
      };
    }

    return chatError;
  }
}

export const chatService = new ChatService();
