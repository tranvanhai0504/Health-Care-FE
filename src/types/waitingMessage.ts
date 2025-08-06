import { GetManyParams } from "./api";

/**
 * Waiting message status enum
 */
export type WaitingMessageStatus = "pending" | "sent" | "failed";

/**
 * Waiting message interface
 */
export interface WaitingMessage {
  _id: string;
  userId: string;
  message: string;
  status: WaitingMessageStatus;
  triggerAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create waiting message data interface
 */
export interface CreateWaitingMessageData {
  userId: string;
  message: string;
  status: WaitingMessageStatus;
  triggerAt: string;
}

/**
 * Update waiting message data interface (for PATCH requests)
 */
export interface UpdateWaitingMessageData {
  status?: WaitingMessageStatus;
  message?: string;
  triggerAt?: string;
}

/**
 * Waiting message query parameters for /many endpoint
 */
export interface WaitingMessageGetManyParams extends GetManyParams {
  userId?: string;
  status?: WaitingMessageStatus;
  triggerAtFrom?: string;
  triggerAtTo?: string;
}

/**
 * Special response format for /many endpoint (matches API documentation)
 */
export interface WaitingMessageManyResponse {
  status: string;
  data: {
    docs: WaitingMessage[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

/**
 * User waiting messages response format
 */
export interface UserWaitingMessagesResponse {
  data: {
    data: WaitingMessage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  msg: string;
  code: number;
}

/**
 * Single waiting message response format
 */
export interface SingleWaitingMessageResponse {
  status: string;
  data: WaitingMessage;
}