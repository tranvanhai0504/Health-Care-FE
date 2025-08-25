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
  VNPayCreatePaymentData,
  VNPayCreatePaymentResponse,
  UpdatePaymentMethodByIdsData,
} from "@/types";

export class PaymentService extends BaseService<Payment> {
  constructor() {
    super("/api/v1/payment");
  }

  /**
   * Get all payments with pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with paginated response containing payments
   */
  async getAll(
    params?: PaymentQueryParams
  ): Promise<PaginatedApiResponse<Payment>> {
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
  async updateStatus(
    id: string,
    data: UpdatePaymentStatusData
  ): Promise<Payment> {
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

  /**
   * Create a VNPay payment
   * @param data - The VNPay payment data to create
   * @returns Promise with the VNPay payment response
   */
  async createVNPayPayment(
    data: VNPayCreatePaymentData
  ): Promise<VNPayCreatePaymentResponse> {
    const response = await api.post<ApiResponse<VNPayCreatePaymentResponse>>(
      `${this.basePath}/vnpay/create`,
      data
    );
    return response.data.data;
  }

  /**
   * Update payment method for multiple payments
   * @param data - The data containing payment IDs and the new method
   * @returns Promise with a success response
   */
  async updatePaymentMethodByIds(
    data: UpdatePaymentMethodByIdsData
  ): Promise<unknown> {
    // Use Promise.allSettled to handle individual failures
    const promises = data.paymentIds.map((id) => this.update(id, { method: data.method }));
    try {
      const results = await Promise.allSettled(promises);

      // Filter out rejected promises and null values from fulfilled promises
      return results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => (result as PromiseFulfilledResult<Payment>).value);
    } catch (error) {
      console.error("Error updating multiple payments:", error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
