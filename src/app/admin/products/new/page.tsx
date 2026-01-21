import ProductForm from "@/components/admin/ProductForm";
import { getDatabase } from "@/lib/db";
import type { Collection } from "@/entities/Collection";
import type { Category } from "@/entities/Category";
import type { Size } from "@/entities/Size";
import Link from "next/link";

async function getCollections() {
  try {
    const db = await getDatabase();
    const collectionRepo = db.getRepository("Collection");
    const collections = await collectionRepo.find({ order: { displayOrder: "ASC" } }) as Collection[];
    return JSON.parse(JSON.stringify(collections));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const db = await getDatabase();
    const categoryRepo = db.getRepository("Category");
    const categories = await categoryRepo.find({ relations: ["collection"], order: { displayOrder: "ASC" } }) as Category[];
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getSizes() {
  try {
    const db = await getDatabase();
    const sizeRepo = db.getRepository("Size");
    const sizes = await sizeRepo.find({ relations: ["collection", "category"], order: { displayOrder: "ASC" } }) as Size[];
    return JSON.parse(JSON.stringify(sizes));
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return [];
  }
}

export default async function NewProductPage() {
  const [collections, categories, sizes] = await Promise.all([
    getCollections(),
    getCategories(),
    getSizes(),
  ]);

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

      {collections.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No collections found.{" "}
            <Link href="/admin/collections/new" className="text-yellow-900 underline">
              Create a collection
            </Link>{" "}
            and sizes first to add products.
          </p>
        </div>
      ) : sizes.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No sizes found.{" "}
            <Link href="/admin/sizes/new" className="text-yellow-900 underline">
              Create sizes
            </Link>{" "}
            first to add products.
          </p>
        </div>
      ) : (
        <ProductForm collections={collections} categories={categories} sizes={sizes} />
      )}
    </div>
  );
}
