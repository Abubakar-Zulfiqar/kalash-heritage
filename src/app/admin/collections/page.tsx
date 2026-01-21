import Link from "next/link";
import Image from "next/image";
import { getDatabase } from "@/lib/db";
import type { Collection } from "@/entities/Collection";
import DeleteCollectionButton from "./DeleteCollectionButton";

async function getCollections() {
  try {
    const db = await getDatabase();
    const collectionRepo = db.getRepository("Collection");
    const collections = await collectionRepo.find({
      relations: ["categories", "sizes"],
      order: { displayOrder: "ASC" },
    });
    return collections.map((col: Collection) => ({
      ...col,
      categoryCount: col.categories?.length || 0,
      sizeCount: col.sizes?.length || 0,
    }));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-1">Manage product collections (e.g., Seljuk, Vintage, Tribal)</p>
        </div>
        <Link
          href="/admin/collections/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Add Collection
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
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
              {collections.length > 0 ? (
                collections.map((collection: Collection & { categoryCount: number; sizeCount: number }) => (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {collection.image ? (
                            <Image
                              src={collection.image}
                              alt={collection.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{collection.name}</p>
                          <p className="text-sm text-gray-500">{collection.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        collection.hasCategories
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {collection.hasCategories ? "Has Categories" : "Direct Sizes"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {collection.categoryCount} categories
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {collection.sizeCount} sizes
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {collection.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/collections/${collection.id}/edit`}
                          className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteCollectionButton
                          collectionId={collection.id}
                          collectionName={collection.name}
                          hasChildren={collection.categoryCount > 0 || collection.sizeCount > 0}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No collections yet.{" "}
                    <Link href="/admin/collections/new" className="text-primary-600 hover:underline">
                      Add your first collection
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
