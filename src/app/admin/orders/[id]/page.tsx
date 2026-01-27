import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDatabase } from "@/lib/db";
import type { Order } from "@/entities/Order";
import { OrderStatus, PaymentStatus } from "@/entities/Order";
import type { OrderItem } from "@/entities/OrderItem";
import OrderStatusForm from "./OrderStatusForm";

// Helper function to parse PostgreSQL array
function parsePostgresArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    let str = value.trim();
    if (str.startsWith('{')) str = str.slice(1);
    if (str.endsWith('}')) str = str.slice(0, -1);
    if (!str) return [];
    const items: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && str[i - 1] !== '\\') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        const item = current.trim().replace(/^"|"$/g, '');
        if (item) items.push(item);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) {
      const item = current.trim().replace(/^"|"$/g, '');
      if (item) items.push(item);
    }
    return items;
  }
  return [];
}

// Helper to get first image from product
function getProductImage(product: { thumbnail?: string; images?: string | string[] } | undefined): string {
  if (!product) return "/placeholder-rug.svg";
  if (product.thumbnail) return product.thumbnail;
  const images = parsePostgresArray(product.images);
  return images[0] || "/placeholder-rug.svg";
}

async function getOrder(id: string) {
  try {
    const db = await getDatabase();
    const { Order: OrderEntity } = await import("@/entities/Order");
    const orderRepo = db.getRepository(OrderEntity);
    return await orderRepo.findOne({
      where: { id },
      relations: ["shippingAddress", "items", "items.product", "user"],
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.PROCESSING:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PAID:
      return "bg-green-100 text-green-800";
    case PaymentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case PaymentStatus.FAILED:
      return "bg-red-100 text-red-800";
    case PaymentStatus.REFUNDED:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/orders" className="hover:text-primary-600">
            Orders
          </Link>
          <span>/</span>
          <span>{order.orderNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mt-1">
          Placed on {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items?.map((item: OrderItem) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getProductImage(item.product)}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-sm text-gray-500">
                      SKU: {item.product?.sku || "N/A"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} x {formatCurrency(Number(item.price))}
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(Number(order.shippingCost))}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(Number(order.tax))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            currentTrackingNumber={order.trackingNumber || ""}
            currentNotes={order.notes || ""}
          />
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.fullName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.phone || "N/A"}
                </p>
              </div>
              {order.user && (
                <div>
                  <p className="text-sm text-gray-500">Account</p>
                  <Link
                    href={`/admin/users/${order.user.id}`}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    View Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-600">
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress?.city}
                {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              {order.paymentIntentId && (
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-gray-900 font-mono text-sm break-all">
                    {order.paymentIntentId}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium text-gray-900">{order.currency}</p>
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tracking
              </h2>
              <p className="font-mono text-gray-900">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
