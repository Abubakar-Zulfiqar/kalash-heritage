import CategoryForm from "@/components/admin/CategoryForm";
import Link from "next/link";
import { getDatabase } from "@/lib/db";
import type { Collection } from "@/entities/Collection";

async function getCollectionsWithCategories() {
  try {
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);
    const collections = await collectionRepo.find({
      where: { hasCategories: true },
      order: { displayOrder: "ASC" },
    }) as Collection[];
    return JSON.parse(JSON.stringify(collections));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export default async function NewCategoryPage() {
  const collections = await getCollectionsWithCategories();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/categories" className="hover:text-primary-600">
            Categories
          </Link>
          <span>/</span>
          <span>New Category</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
      </div>

      {collections.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No collections with categories enabled.{" "}
            <Link href="/admin/collections/new" className="text-yellow-900 underline">
              Create a collection
            </Link>{" "}
            and enable &quot;Has Categories&quot; first.
          </p>
        </div>
      ) : (
        <CategoryForm collections={collections} />
      )}
    </div>
  );
}
