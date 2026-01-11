import ProductForm from "@/components/admin/ProductForm";
import { getDatabase } from "@/lib/db";
import { Category } from "@/entities/Category";
import Link from "next/link";

async function getCategories() {
  try {
    const db = await getDatabase();
    const categoryRepo = db.getRepository(Category);
    return await categoryRepo.find({ order: { name: "ASC" } });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/products" className="hover:text-primary-600">
            Products
          </Link>
          <span>/</span>
          <span>New Product</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
