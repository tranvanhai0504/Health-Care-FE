import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  WaitingMessage,
  CreateWaitingMessageData,
  UpdateWaitingMessageData,
  WaitingMessageGetManyParams,
  WaitingMessageManyResponse,
  UserWaitingMessagesResponse,
  SingleWaitingMessageResponse
} from '@/types/waitingMessage';
import { ApiResponse } from '@/types/api';

export class WaitingMessageService extends BaseService<WaitingMessage> {
  constructor() {
    super('/api/v1/waiting-message');
  }

  /**
   * Create a new waiting message for the authenticated user
   * POST /waiting-message
   * @param data - The waiting message data to create
   * @returns Promise with the created waiting message
   */
  async create(data: CreateWaitingMessageData): Promise<WaitingMessage> {
    const response = await api.post<ApiResponse<WaitingMessage>>(
      this.basePath, 
      data
    );
    return response.data.data;
  }

  /**
   * Get waiting messages with pagination (admin/doctor role required)
   * GET /waiting-message/many
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated waiting messages
   */
  async getManyMessages(params?: WaitingMessageGetManyParams): Promise<WaitingMessageManyResponse> {
    const response = await api.get<WaitingMessageManyResponse>(
      `${this.basePath}/many`,
      {
        params: {
          ...params,
          options: params?.options ? JSON.stringify(params.options) : undefined,
        },
      }
    );
    return response.data;
  }

  /**
   * Get all waiting messages for the currently authenticated user
   * GET /waiting-message/user
   * @returns Promise with user's waiting messages
   */
  async getUserMessages(): Promise<WaitingMessage[]> {
    const response = await api.get<UserWaitingMessagesResponse>(
      `${this.basePath}/user`
    );
    return response.data.data.data;
  }

  /**
   * Get all waiting messages for the currently authenticated user with pagination info
   * GET /waiting-message/user
   * @returns Promise with user's waiting messages and pagination data
   */
  async getUserMessagesWithPagination(): Promise<UserWaitingMessagesResponse['data']> {
    const response = await api.get<UserWaitingMessagesResponse>(
      `${this.basePath}/user`
    );
    return response.data.data;
  }

  /**
   * Get a specific waiting message by ID
   * GET /waiting-message/{id}
   * @param id - The ID of the waiting message to retrieve
   * @returns Promise with the waiting message
   */
  async getById(id: string): Promise<WaitingMessage> {
    const response = await api.get<SingleWaitingMessageResponse>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Update the status of a specific waiting message
   * PATCH /waiting-message/{id}
   * @param id - The ID of the waiting message to update
   * @param data - The update data (typically status)
   * @returns Promise with the updated waiting message
   */
  async updateStatus(id: string, data: UpdateWaitingMessageData): Promise<WaitingMessage> {
    const response = await api.patch<ApiResponse<WaitingMessage>>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete a waiting message by ID
   * DELETE /waiting-message/{id}
   * @param id - The ID of the waiting message to delete
   * @returns Promise with the deletion result
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Get waiting messages filtered by status
   * @param status - The status to filter by
   * @param params - Additional query parameters
   * @returns Promise with filtered waiting messages
   */
  async getByStatus(
    status: 'pending' | 'sent' | 'failed', 
    params?: WaitingMessageGetManyParams
  ): Promise<WaitingMessageManyResponse> {
    return this.getManyMessages({
      ...params,
      status
    });
  }

  /**
   * Get waiting messages for a specific user (admin/doctor access)
   * @param userId - The user ID to get messages for
   * @param params - Additional query parameters
   * @returns Promise with user's waiting messages
   */
  async getByUserId(
    userId: string, 
    params?: WaitingMessageGetManyParams
  ): Promise<WaitingMessageManyResponse> {
    return this.getManyMessages({
      ...params,
      userId
    });
  }

  /**
   * Get waiting messages within a date range
   * @param triggerAtFrom - Start date for filtering
   * @param triggerAtTo - End date for filtering
   * @param params - Additional query parameters
   * @returns Promise with filtered waiting messages
   */
  async getByDateRange(
    triggerAtFrom: string,
    triggerAtTo: string,
    params?: WaitingMessageGetManyParams
  ): Promise<WaitingMessageManyResponse> {
    return this.getManyMessages({
      ...params,
      triggerAtFrom,
      triggerAtTo
    });
  }
}

export const waitingMessageService = new WaitingMessageService();
