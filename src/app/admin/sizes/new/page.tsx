import SizeForm from "@/components/admin/SizeForm";
import Link from "next/link";
import { getDatabase } from "@/lib/db";
import type { Collection } from "@/entities/Collection";
import type { Category } from "@/entities/Category";

async function getCollections() {
  try {
    const db = await getDatabase();
    const collectionRepo = db.getRepository("Collection");
    const collections = await collectionRepo.find({
      order: { displayOrder: "ASC" },
    }) as Collection[];
    // Convert to plain objects for Client Component
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
    const categories = await categoryRepo.find({
      relations: ["collection"],
      order: { displayOrder: "ASC" },
    }) as Category[];
    // Convert to plain objects for Client Component
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function NewSizePage() {
  const [collections, categories] = await Promise.all([
    getCollections(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/sizes" className="hover:text-primary-600">
            Sizes
          </Link>
          <span>/</span>
          <span>New Size</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Size</h1>
      </div>

      {collections.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No collections found.{" "}
            <Link href="/admin/collections/new" className="text-yellow-900 underline">
              Create a collection
            </Link>{" "}
            first.
          </p>
        </div>
      ) : (
        <SizeForm collections={collections} categories={categories} />
      )}
    </div>
  );
}
