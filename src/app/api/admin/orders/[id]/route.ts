import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const db = await getDatabase();
    const { Order: OrderEntity } = await import("@/entities/Order");
    const orderRepo = db.getRepository(OrderEntity);

    const order = await orderRepo.findOne({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await orderRepo.update(id, {
      status: data.status,
      paymentStatus: data.paymentStatus,
      trackingNumber: data.trackingNumber || null,
      notes: data.notes || null,
    });

    const updatedOrder = await orderRepo.findOne({
      where: { id },
      relations: ["shippingAddress", "items"],
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
