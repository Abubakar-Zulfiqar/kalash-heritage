import { notFound } from "next/navigation";
import CollectionForm from "@/components/admin/CollectionForm";
import { getDatabase } from "@/lib/db";
import type { Collection } from "@/entities/Collection";
import Link from "next/link";

async function getCollection(id: string) {
  try {
    const db = await getDatabase();
    const collectionRepo = db.getRepository("Collection");
    const collection = await collectionRepo.findOne({ where: { id } }) as Collection | null;
    return collection ? JSON.parse(JSON.stringify(collection)) : null;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/collections" className="hover:text-primary-600">
            Collections
          </Link>
          <span>/</span>
          <span>Edit Collection</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
      </div>

      <CollectionForm
        initialData={{
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          description: collection.description || undefined,
          image: collection.image || undefined,
          displayOrder: collection.displayOrder,
          hasCategories: collection.hasCategories,
        }}
      />
    </div>
  );
}
