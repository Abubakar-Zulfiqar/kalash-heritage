// Common types used across the application

export interface PaymentGateway {
  name: string;
  createPaymentIntent: (amount: number, currency: string, metadata?: any) => Promise<PaymentIntent>;
  confirmPayment: (intentId: string) => Promise<PaymentConfirmation>;
  refundPayment: (intentId: string, amount?: number) => Promise<PaymentRefund>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentConfirmation {
  id: string;
  status: "succeeded" | "failed" | "pending";
  amount: number;
  currency: string;
}

export interface PaymentRefund {
  id: string;
  status: string;
  amount: number;
}

export interface CurrencyRate {
  code: string;
  rate: number;
  symbol: string;
  name: string;
}

export interface ShippingRate {
  region: string;
  country: string;
  baseRate: number;
  perKgRate: number;
  estimatedDays: string;
  currency: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  style?: string;
  material?: string;
  inStock?: boolean;
  featured?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
