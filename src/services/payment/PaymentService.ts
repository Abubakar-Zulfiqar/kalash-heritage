import { PaymentGateway, PaymentIntent, PaymentConfirmation, PaymentRefund } from "@/types";

/**
 * Payment Service - Abstraction layer for multiple payment gateways
 * Supports: Stripe, PayPal, Safepay
 */
export class PaymentService {
  private gateway: PaymentGateway;

  constructor(gatewayName: "stripe" | "paypal" | "safepay") {
    this.gateway = this.getGateway(gatewayName);
  }

  private getGateway(name: string): PaymentGateway {
    switch (name) {
      case "stripe":
        return new StripeGateway();
      case "paypal":
        return new PayPalGateway();
      case "safepay":
        return new SafepayGateway();
      default:
        throw new Error(`Unsupported payment gateway: ${name}`);
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: any
  ): Promise<PaymentIntent> {
    return this.gateway.createPaymentIntent(amount, currency, metadata);
  }

  async confirmPayment(intentId: string): Promise<PaymentConfirmation> {
    return this.gateway.confirmPayment(intentId);
  }

  async refundPayment(intentId: string, amount?: number): Promise<PaymentRefund> {
    return this.gateway.refundPayment(intentId, amount);
  }
}

// Gateway implementations (to be completed when client chooses)

class StripeGateway implements PaymentGateway {
  name = "stripe";

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent> {
    // TODO: Implement Stripe integration
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const intent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Stripe uses cents
    //   currency: currency.toLowerCase(),
    //   metadata,
    // });

    throw new Error("Stripe not configured yet");
  }

  async confirmPayment(intentId: string): Promise<PaymentConfirmation> {
    throw new Error("Stripe not configured yet");
  }

  async refundPayment(intentId: string, amount?: number): Promise<PaymentRefund> {
    throw new Error("Stripe not configured yet");
  }
}

class PayPalGateway implements PaymentGateway {
  name = "paypal";

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent> {
    // TODO: Implement PayPal integration
    throw new Error("PayPal not configured yet");
  }

  async confirmPayment(intentId: string): Promise<PaymentConfirmation> {
    throw new Error("PayPal not configured yet");
  }

  async refundPayment(intentId: string, amount?: number): Promise<PaymentRefund> {
    throw new Error("PayPal not configured yet");
  }
}

class SafepayGateway implements PaymentGateway {
  name = "safepay";

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent> {
    // TODO: Implement Safepay integration
    throw new Error("Safepay not configured yet");
  }

  async confirmPayment(intentId: string): Promise<PaymentConfirmation> {
    throw new Error("Safepay not configured yet");
  }

  async refundPayment(intentId: string, amount?: number): Promise<PaymentRefund> {
    throw new Error("Safepay not configured yet");
  }
}
