import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { getDatabase } from "@/lib/db";
import type { Category } from "@/entities/Category";
import type { Collection } from "@/entities/Collection";
import Link from "next/link";

async function getCategory(id: string) {
  try {
    const db = await getDatabase();
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const categoryRepo = db.getRepository(CategoryEntity);
    const category = await categoryRepo.findOne({
      where: { id },
      relations: ["collection"],
    }) as Category | null;
    return category ? JSON.parse(JSON.stringify(category)) : null;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

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

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, collections] = await Promise.all([
    getCategory(id),
    getCollectionsWithCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/categories" className="hover:text-primary-600">
            Categories
          </Link>
          <span>/</span>
          <span>Edit Category</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
      </div>

      <CategoryForm
        collections={collections}
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || undefined,
          image: category.image || undefined,
          displayOrder: category.displayOrder,
          collectionId: category.collectionId,
        }}
      />
    </div>
  );
}
