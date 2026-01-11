import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Order, OrderStatus, PaymentStatus } from "@/entities/Order";
import { OrderItem } from "@/entities/OrderItem";
import { ShippingAddress } from "@/entities/ShippingAddress";
import { Product } from "@/entities/Product";
import { User, UserRole } from "@/entities/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function generateOrderNumber(db: any): Promise<string> {
  const orderRepo = db.getRepository(Order);
  const year = new Date().getFullYear();

  // Get the count of orders this year
  const count = await orderRepo
    .createQueryBuilder("order")
    .where("order.orderNumber LIKE :pattern", { pattern: `KH-${year}-%` })
    .getCount();

  const orderNumber = `KH-${year}-${String(count + 1).padStart(4, "0")}`;
  return orderNumber;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      items,
      shippingAddress,
      shippingCost,
      currency,
      createAccount,
      accountPassword,
    } = data;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address required" }, { status: 400 });
    }

    const db = await getDatabase();
    const orderRepo = db.getRepository(Order);
    const orderItemRepo = db.getRepository(OrderItem);
    const addressRepo = db.getRepository(ShippingAddress);
    const productRepo = db.getRepository(Product);
    const userRepo = db.getRepository(User);

    // Calculate subtotal and verify products exist
    let subtotal = 0;
    const productItems = [];

    for (const item of items) {
      const product = await productRepo.findOne({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      subtotal += Number(product.price) * item.quantity;
      productItems.push({ product, quantity: item.quantity });
    }

    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = await generateOrderNumber(db);

    // Create user if requested
    let userId = null;
    if (createAccount && accountPassword && shippingAddress.email) {
      const existingUser = await userRepo.findOne({
        where: { email: shippingAddress.email },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const hashedPassword = await bcrypt.hash(accountPassword, 10);
        const newUser = await userRepo.save({
          email: shippingAddress.email,
          name: shippingAddress.fullName,
          password: hashedPassword,
          phone: shippingAddress.phone || null,
          role: UserRole.CUSTOMER,
        });
        userId = newUser.id;
      }
    }

    // Create shipping address
    const savedAddress = await addressRepo.save({
      fullName: shippingAddress.fullName,
      email: shippingAddress.email,
      phone: shippingAddress.phone || null,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || null,
      city: shippingAddress.city,
      state: shippingAddress.state || null,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      userId: userId,
    });

    // Create order
    const order = await orderRepo.save({
      orderNumber,
      userId,
      shippingAddress: savedAddress,
      subtotal,
      shippingCost,
      tax: 0,
      total,
      currency: currency || "USD",
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: "payoneer",
    });

    // Create order items
    for (const { product, quantity } of productItems) {
      await orderItemRepo.save({
        order,
        product,
        quantity,
        price: product.price,
        currency: currency || "USD",
      });
    }

    // Create Payoneer payment session if configured
    let paymentUrl = null;

    if (process.env.PAYONEER_MERCHANT_CODE && process.env.PAYONEER_API_TOKEN) {
      try {
        const { PayoneerGateway } = await import("@/services/payment/PayoneerGateway");
        const gateway = new PayoneerGateway();

        const paymentIntent = await gateway.createPaymentIntent(
          total,
          currency || "USD",
          {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerEmail: shippingAddress.email,
            customerName: shippingAddress.fullName,
          }
        );

        // Update order with payment intent ID
        await orderRepo.update(order.id, {
          paymentIntentId: paymentIntent.id,
        });

        paymentUrl = paymentIntent.clientSecret; // Hosted page URL
      } catch (paymentError) {
        console.error("Payoneer session error:", paymentError);
        // Continue without payment URL - order created but payment pending
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentUrl,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
