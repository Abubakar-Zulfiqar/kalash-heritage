import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Order } from "@/entities/Order";
import { PayoneerGateway } from "@/services/payment/PayoneerGateway";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const db = await getDatabase();
    const orderRepo = db.getRepository(Order);

    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ["shippingAddress"],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.shippingAddress) {
      return NextResponse.json({ error: "Order has no shipping address" }, { status: 400 });
    }

    const gateway = new PayoneerGateway();

    const paymentIntent = await gateway.createPaymentIntent(
      Number(order.total),
      order.currency,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.shippingAddress.email,
        customerName: order.shippingAddress.fullName,
      }
    );

    // Update order with payment intent ID
    await orderRepo.update(order.id, {
      paymentIntentId: paymentIntent.id,
    });

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      redirectUrl: paymentIntent.clientSecret,
    });
  } catch (error) {
    console.error("Error creating Payoneer session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment session" },
      { status: 500 }
    );
  }
}
