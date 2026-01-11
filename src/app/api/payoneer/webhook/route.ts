import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Order, OrderStatus, PaymentStatus } from "@/entities/Order";

export const dynamic = "force-dynamic";

/**
 * Payoneer Webhook Handler
 *
 * Receives payment status notifications from Payoneer.
 * This endpoint should be configured in your Payoneer merchant settings.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Payoneer webhook received:", JSON.stringify(payload, null, 2));

    // Extract relevant data from webhook payload
    // Note: Actual payload structure depends on Payoneer's webhook format
    const {
      transactionId,
      longId,
      status,
      statusReason,
      interaction,
      payment,
    } = payload;

    const paymentIntentId = longId || transactionId;

    if (!paymentIntentId) {
      console.error("No transaction ID in webhook payload");
      return NextResponse.json({ received: true, error: "No transaction ID" });
    }

    const db = await getDatabase();
    const orderRepo = db.getRepository(Order);

    // Find order by payment intent ID
    const order = await orderRepo.findOne({
      where: { paymentIntentId },
    });

    if (!order) {
      // Try to find by order number (transaction ID might be order number)
      const orderByNumber = await orderRepo.findOne({
        where: { orderNumber: transactionId },
      });

      if (!orderByNumber) {
        console.error("Order not found for transaction:", paymentIntentId);
        return NextResponse.json({ received: true, error: "Order not found" });
      }

      await processPaymentStatus(orderRepo, orderByNumber, status);
      return NextResponse.json({ received: true });
    }

    await processPaymentStatus(orderRepo, order, status);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Payoneer webhook error:", error);
    return NextResponse.json(
      { received: true, error: "Webhook processing failed" },
      { status: 200 } // Always return 200 to acknowledge receipt
    );
  }
}

async function processPaymentStatus(
  orderRepo: any,
  order: Order,
  status: string
) {
  const normalizedStatus = status?.toUpperCase();

  switch (normalizedStatus) {
    case "CHARGED":
    case "PAID":
    case "PRESET":
      await orderRepo.update(order.id, {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
      });
      console.log(`Order ${order.orderNumber} marked as PAID`);
      // TODO: Send confirmation email
      break;

    case "FAILED":
    case "DECLINED":
    case "ABORTED":
      await orderRepo.update(order.id, {
        paymentStatus: PaymentStatus.FAILED,
      });
      console.log(`Order ${order.orderNumber} payment FAILED`);
      break;

    case "EXPIRED":
      await orderRepo.update(order.id, {
        paymentStatus: PaymentStatus.FAILED,
        status: OrderStatus.CANCELLED,
      });
      console.log(`Order ${order.orderNumber} payment EXPIRED`);
      break;

    case "PENDING":
    case "OPEN":
      // Payment still pending, no update needed
      console.log(`Order ${order.orderNumber} payment still PENDING`);
      break;

    default:
      console.log(`Unknown payment status for order ${order.orderNumber}: ${status}`);
  }
}

// Also handle GET requests for verification if needed
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
