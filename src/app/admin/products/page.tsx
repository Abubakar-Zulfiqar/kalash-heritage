import Link from "next/link";
import Image from "next/image";
import { getDatabase } from "@/lib/db";
import DeleteProductButton from "./DeleteProductButton";

// Helper function to parse PostgreSQL array
function parsePostgresArray(value: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const inner = value.slice(1, -1);
    if (!inner) return [];
    const items: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < inner.length; i++) {
      const char = inner[i];
      if (char === '"' && inner[i - 1] !== '\\') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        items.push(current.replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    if (current) {
      items.push(current.replace(/^"|"$/g, ''));
    }
    return items;
  }
  return [value];
}

async function getProducts() {
  try {
    const db = await getDatabase();
    // Use raw query to avoid cyclic dependency issues
    const products = await db.query(`
      SELECT
        p.*,
        s.name as "sizeName",
        s."collectionId" as "sizeCollectionId",
        s."categoryId" as "sizeCategoryId",
        c.name as "categoryName",
        col.name as "collectionName",
        col2.name as "directCollectionName"
      FROM products p
      LEFT JOIN sizes s ON p."sizeId" = s.id
      LEFT JOIN categories c ON s."categoryId" = c.id
      LEFT JOIN collections col ON c."collectionId" = col.id
      LEFT JOIN collections col2 ON s."collectionId" = col2.id
      WHERE p."deletedAt" IS NULL
      ORDER BY p."createdAt" DESC
    `);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  thumbnail?: string;
  images?: string | string[];
  dimensions?: string;
  material?: string;
  color?: string;
  sizeName?: string;
  categoryName?: string;
  collectionName?: string;
  directCollectionName?: string;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product: ProductRow) => {
                  const collectionName = product.collectionName || product.directCollectionName;
                  const parsedImages = parsePostgresArray(product.images || null);
                  const imageUrl = product.thumbnail || parsedImages[0] || "/placeholder-rug.svg";
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {collectionName && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 w-fit">
                              {collectionName}
                            </span>
                          )}
                          {product.categoryName && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 w-fit">
                              {product.categoryName}
                            </span>
                          )}
                          {product.sizeName && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 w-fit">
                              {product.sizeName}
                            </span>
                          )}
                          {!collectionName && !product.categoryName && !product.sizeName && (
                            <span className="text-gray-400 text-sm">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.dimensions || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.material || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.color || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products yet.{" "}
                    <Link href="/admin/products/new" className="text-primary-600 hover:underline">
                      Add your first product
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
