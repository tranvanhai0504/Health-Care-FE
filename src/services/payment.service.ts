import BaseService from "./base.service";
import api from "@/lib/axios";
import {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  UpdatePaymentStatusData,
  PaymentQueryParams,
  PaymentStatus,
  ApiResponse,
  PaginatedApiResponse,
} from "@/types";

export class PaymentService extends BaseService<Payment> {
  constructor() {
    super("/api/v1/payments");
  }

  /**
   * Get all payments with pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated response containing payments
   */
  async getAll(params?: PaymentQueryParams): Promise<PaginatedApiResponse<Payment>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Payment>>>(
      this.basePath,
      {
        params,
      }
    );
    return response.data.data;
  }

  /**
   * Create a new payment
   * @param data - The payment data to create
   * @returns Promise with the created payment
   */
  async create(data: CreatePaymentData): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Get a payment by ID
   * @param id - The ID of the payment to get
   * @returns Promise with the payment
   */
  async getById(id: string): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Get current user's payments with pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated response containing user payments
   */
  async getUserPayments(
    params?: PaymentQueryParams
  ): Promise<PaginatedApiResponse<Payment>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Payment>>>(
      `${this.basePath}/user`,
      {
        params,
      }
    );
    return response.data.data;
  }

  /**
   * Update an existing payment
   * @param id - The ID of the payment to update
   * @param data - The payment data to update
   * @returns Promise with the updated payment
   */
  async update(id: string, data: UpdatePaymentData): Promise<Payment> {
    const response = await api.put<ApiResponse<Payment>>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete a payment
   * @param id - The ID of the payment to delete
   * @returns Promise with the deleted payment or success response
   */
  async delete(id: string): Promise<unknown> {
    const response = await api.delete<ApiResponse<unknown>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Update payment status
   * @param id - The ID of the payment to update
   * @param data - The status update data
   * @returns Promise with the updated payment
   */
  async updateStatus(id: string, data: UpdatePaymentStatusData): Promise<Payment> {
    const response = await api.put<ApiResponse<Payment>>(
      `${this.basePath}/${id}/status`,
      data
    );
    return response.data.data;
  }

  /**
   * Get payments by status with pagination
   * @param status - The payment status to filter by
   * @param params - Query parameters for pagination
   * @returns Promise with paginated response containing payments
   */
  async getByStatus(
    status: PaymentStatus | string,
    params?: PaymentQueryParams
  ): Promise<PaginatedApiResponse<Payment>> {
    const response = await api.get<ApiResponse<PaginatedApiResponse<Payment>>>(
      `${this.basePath}/status/${status}`,
      {
        params,
      }
    );
    return response.data.data;
  }
}

export const paymentService = new PaymentService();