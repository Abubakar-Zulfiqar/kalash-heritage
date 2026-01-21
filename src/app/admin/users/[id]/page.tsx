import { notFound } from "next/navigation";
import Link from "next/link";
import { getDatabase } from "@/lib/db";
import type { User } from "@/entities/User";
import { UserRole } from "@/entities/User";
import type { Order } from "@/entities/Order";
import type { ShippingAddress } from "@/entities/ShippingAddress";
import UserRoleForm from "./UserRoleForm";

async function getUser(id: string) {
  try {
    const db = await getDatabase();
    const { User: UserEntity } = await import("@/entities/User");
    const userRepo = db.getRepository(UserEntity);
    return await userRepo.findOne({
      where: { id },
      relations: ["orders", "orders.shippingAddress", "addresses"],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const totalSpent = user.orders?.reduce(
    (sum: number, order: Order) => sum + Number(order.total),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/users" className="hover:text-primary-600">
            Users
          </Link>
          <span>/</span>
          <span>{user.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              user.role === UserRole.ADMIN
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{user.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {user.orders && user.orders.length > 0 ? (
                    user.orders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatCurrency(Number(order.total))}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Role */}
          <UserRoleForm userId={user.id} currentRole={user.role} />
        </div>

        {/* Stats & Addresses */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium text-gray-900">
                  {user.orders?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saved Addresses</span>
                <span className="font-medium text-gray-900">
                  {user.addresses?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {user.addresses && user.addresses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Saved Addresses
              </h2>
              <div className="space-y-4">
                {user.addresses.map((address: ShippingAddress) => (
                  <div
                    key={address.id}
                    className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600"
                  >
                    <p className="font-medium text-gray-900">{address.fullName}</p>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}
                      {address.state && `, ${address.state}`} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    {address.isDefault && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
