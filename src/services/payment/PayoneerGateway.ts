import { PaymentGateway, PaymentIntent, PaymentConfirmation, PaymentRefund } from "@/types";

/**
 * Payoneer Payment Gateway
 *
 * Implements Payoneer Checkout API for hosted payment page integration.
 * Documentation: https://checkoutdocs.payoneer.com/docs/integrate-hosted-payment-page
 *
 * Required environment variables:
 * - PAYONEER_MERCHANT_CODE: Your merchant code
 * - PAYONEER_API_TOKEN: Your API token
 * - PAYONEER_DIVISION: Your division code
 * - PAYONEER_API_URL: API base URL (sandbox or production)
 * - NEXTAUTH_URL: Your site URL for callbacks
 */
export class PayoneerGateway implements PaymentGateway {
  name = "payoneer";

  private baseUrl: string;
  private merchantCode: string;
  private apiToken: string;
  private division: string;

  constructor() {
    this.baseUrl = process.env.PAYONEER_API_URL || "https://api.sandbox.oscato.com/api";
    this.merchantCode = process.env.PAYONEER_MERCHANT_CODE || "";
    this.apiToken = process.env.PAYONEER_API_TOKEN || "";
    this.division = process.env.PAYONEER_DIVISION || "";

    if (!this.merchantCode || !this.apiToken) {
      console.warn("Payoneer credentials not configured");
    }
  }

  private getAuthHeader(): string {
    return "Basic " + Buffer.from(`${this.merchantCode}:${this.apiToken}`).toString("base64");
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: {
      orderId: string;
      orderNumber: string;
      customerEmail: string;
      customerName?: string;
    }
  ): Promise<PaymentIntent> {
    if (!this.merchantCode || !this.apiToken) {
      throw new Error("Payoneer not configured. Please set PAYONEER_MERCHANT_CODE and PAYONEER_API_TOKEN");
    }

    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const transactionId = metadata?.orderNumber || `TXN-${Date.now()}`;

    try {
      const response = await fetch(`${this.baseUrl}/lists`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          country: "US",
          integration: "HOSTED",
          division: this.division,
          callback: {
            returnUrl: `${siteUrl}/checkout/success?orderId=${metadata?.orderId}`,
            cancelUrl: `${siteUrl}/checkout/cancel`,
            notificationUrl: `${siteUrl}/api/payoneer/webhook`,
          },
          payment: {
            amount,
            currency: currency.toUpperCase(),
            reference: metadata?.orderId,
          },
          customer: {
            email: metadata?.customerEmail,
            name: {
              firstName: metadata?.customerName?.split(" ")[0] || "Customer",
              lastName: metadata?.customerName?.split(" ").slice(1).join(" ") || "",
            },
          },
          style: {
            language: "en_US",
            primaryColor: "#8B4513",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Payoneer API error:", error);
        throw new Error(error.resultInfo || "Failed to create payment session");
      }

      const data = await response.json();

      return {
        id: data.identification?.longId || transactionId,
        amount,
        currency,
        status: data.status || "pending",
        clientSecret: data.redirect?.url, // Hosted page URL
      };
    } catch (error) {
      console.error("Payoneer createPaymentIntent error:", error);
      throw error;
    }
  }

  async confirmPayment(intentId: string): Promise<PaymentConfirmation> {
    if (!this.merchantCode || !this.apiToken) {
      throw new Error("Payoneer not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/lists/${intentId}`, {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment status");
      }

      const data = await response.json();

      return {
        id: intentId,
        status: this.mapPayoneerStatus(data.status),
        amount: data.payment?.amount || 0,
        currency: data.payment?.currency || "USD",
      };
    } catch (error) {
      console.error("Payoneer confirmPayment error:", error);
      throw error;
    }
  }

  async refundPayment(intentId: string, amount?: number): Promise<PaymentRefund> {
    if (!this.merchantCode || !this.apiToken) {
      throw new Error("Payoneer not configured");
    }

    try {
      // Note: Actual refund implementation depends on Payoneer's specific API
      // This is a placeholder for the refund flow
      const response = await fetch(`${this.baseUrl}/lists/${intentId}/payout`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          reason: "Customer refund request",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process refund");
      }

      const data = await response.json();

      return {
        id: data.id || intentId,
        status: data.status || "pending",
        amount: amount || 0,
      };
    } catch (error) {
      console.error("Payoneer refundPayment error:", error);
      throw error;
    }
  }

  private mapPayoneerStatus(status: string): "succeeded" | "failed" | "pending" {
    switch (status?.toUpperCase()) {
      case "CHARGED":
      case "PAID":
      case "PRESET":
        return "succeeded";
      case "EXPIRED":
      case "FAILED":
      case "ABORTED":
      case "DECLINED":
        return "failed";
      default:
        return "pending";
    }
  }
}
