import Link from "next/link";
import Image from "next/image";
import { getDatabase } from "@/lib/db";
import type { Size } from "@/entities/Size";
import DeleteSizeButton from "./DeleteSizeButton";

async function getSizes() {
  try {
    const db = await getDatabase();
    const { Size: SizeEntity } = await import("@/entities/Size");
    const sizeRepo = db.getRepository(SizeEntity);
    const sizes = await sizeRepo.find({
      relations: ["collection", "category", "category.collection", "products"],
      order: { displayOrder: "ASC" },
    });
    return sizes.map((size: Size) => ({
      ...size,
      productCount: size.products?.length || 0,
    }));
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return [];
  }
}

export default async function SizesPage() {
  const sizes = await getSizes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sizes</h1>
          <p className="text-gray-600 mt-1">Manage sizes for products (e.g., 2.3 X 3 ft, 9 X 12)</p>
        </div>
        <Link
          href="/admin/sizes/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Add Size
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection / Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sizes.length > 0 ? (
                sizes.map((size: Size & { productCount: number }) => (
                  <tr key={size.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {size.image ? (
                            <Image
                              src={size.image}
                              alt={size.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{size.name}</p>
                          <p className="text-sm text-gray-500">{size.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {size.category ? (
                          <>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 w-fit">
                              {size.category.collection?.name || "Unknown Collection"}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 w-fit">
                              {size.category.name}
                            </span>
                          </>
                        ) : size.collection ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 w-fit">
                            {size.collection.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {size.productCount} products
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {size.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/sizes/${size.id}/edit`}
                          className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteSizeButton
                          sizeId={size.id}
                          sizeName={size.name}
                          productCount={size.productCount}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No sizes yet.{" "}
                    <Link href="/admin/sizes/new" className="text-primary-600 hover:underline">
                      Add your first size
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
