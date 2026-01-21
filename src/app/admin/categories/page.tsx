import Link from "next/link";
import Image from "next/image";
import { getDatabase } from "@/lib/db";
import type { Category } from "@/entities/Category";
import type { Collection } from "@/entities/Collection";
import DeleteCategoryButton from "./DeleteCategoryButton";

async function getCategories() {
  try {
    const db = await getDatabase();
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const categoryRepo = db.getRepository(CategoryEntity);
    const categories = await categoryRepo.find({
      relations: ["collection", "sizes"],
      order: { displayOrder: "ASC" },
    });
    return categories.map((cat: Category) => ({
      ...cat,
      sizeCount: cat.sizes?.length || 0,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getCollectionsWithCategories() {
  try {
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);
    return await collectionRepo.find({
      where: { hasCategories: true },
      order: { displayOrder: "ASC" },
    }) as Collection[];
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollectionsWithCategories(),
  ]);

  const hasCollectionsWithCategories = collections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage categories within collections (e.g., Overdyes, White Wash)</p>
        </div>
        {hasCollectionsWithCategories ? (
          <Link
            href="/admin/categories/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Add Category
          </Link>
        ) : (
          <span className="text-sm text-gray-500">
            Create a collection with categories first
          </span>
        )}
      </div>

      {!hasCollectionsWithCategories && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No collections with categories enabled yet.
            <Link href="/admin/collections/new" className="ml-1 text-yellow-900 underline">
              Create a collection
            </Link>
            {" "}and enable &quot;Has Categories&quot; to add categories.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sizes
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
              {categories.length > 0 ? (
                categories.map((category: Category & { sizeCount: number }) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {category.collection?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {category.sizeCount} sizes
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {category.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                          sizeCount={category.sizeCount}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No categories yet.{" "}
                    {hasCollectionsWithCategories && (
                      <Link href="/admin/categories/new" className="text-primary-600 hover:underline">
                        Add your first category
                      </Link>
                    )}
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
