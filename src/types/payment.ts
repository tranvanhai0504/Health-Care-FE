/**
 * Payment method enum
 */
export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  DIGITAL_WALLET = "digital_wallet",
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

/**
 * Payment interface
 */
export interface Payment {
  _id: string;
  schedule: string;
  service: string;
  method: PaymentMethod | string;
  amount: number;
  status: PaymentStatus | string;
  note?: string;
  user: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Create payment data interface
 */
export interface CreatePaymentData {
  schedule: string;
  service: string;
  method: PaymentMethod | string;
  amount: number;
  status?: PaymentStatus | string;
  note?: string;
  user: string;
  paymentId: string;
}

/**
 * Update payment data interface
 */
export interface UpdatePaymentData {
  method?: PaymentMethod | string;
  amount?: number;
  status?: PaymentStatus | string;
  note?: string;
  paymentId?: string;
}

/**
 * Update payment status data interface
 */
export interface UpdatePaymentStatusData {
  status: PaymentStatus | string;
}

/**
 * Payment query parameters for filtering
 */
export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | string;
  method?: PaymentMethod | string;
  user?: string;
  schedule?: string;
  service?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Payment response with populated data
 */
export interface PaymentResponse
  extends Omit<Payment, "user" | "schedule" | "service"> {
  user?:
    | {
        _id: string;
        name?: string;
        email?: string;
        phoneNumber?: string;
      }
    | string;
  schedule?:
    | {
        _id: string;
        date: string;
        time: string;
        status: string;
      }
    | string;
  service?:
    | {
        _id: string;
        name: string;
        price: number;
      }
    | string;
}

/**
 * VNPay create payment data interface
 */
export interface VNPayCreatePaymentData {
  orderId: string;
  orderInfo: string;
  amount: number;
  paymentIds: string[];
}

/**
 * VNPay create payment response interface
 */
export interface VNPayCreatePaymentResponse {
  paymentUrl: string;
  txnRef: string;
}

/**
 * Update payment method by IDs data interface
 */
export interface UpdatePaymentMethodByIdsData {
  paymentIds: string[];
  method: PaymentMethod | string;
}
