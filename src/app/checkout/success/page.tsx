import Link from "next/link";
import { getDatabase } from "@/lib/db";
import { Order } from "@/entities/Order";

async function getOrder(orderId: string) {
  try {
    const db = await getDatabase();
    const orderRepo = db.getRepository(Order);
    return await orderRepo.findOne({
      where: { id: orderId },
      relations: ["shippingAddress", "items", "items.product"],
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>

        {order ? (
          <>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order number is{" "}
              <span className="font-semibold text-gray-900">
                {order.orderNumber}
              </span>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">
                    {formatCurrency(Number(order.total))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-800 mb-1">
                Payment Pending
              </h3>
              <p className="text-sm text-yellow-700">
                Your order is awaiting payment. Our team will contact you shortly
                with payment instructions.
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              A confirmation email will be sent to{" "}
              <span className="font-medium">{order.shippingAddress?.email}</span>
            </p>
          </>
        ) : (
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block w-full py-3 text-gray-700 font-medium hover:text-gray-900"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
