import { notFound } from "next/navigation";
import SizeForm from "@/components/admin/SizeForm";
import { getDatabase } from "@/lib/db";
import type { Size } from "@/entities/Size";
import type { Collection } from "@/entities/Collection";
import type { Category } from "@/entities/Category";
import Link from "next/link";

async function getSize(id: string) {
  try {
    const db = await getDatabase();
    const { Size: SizeEntity } = await import("@/entities/Size");
    const sizeRepo = db.getRepository(SizeEntity);
    const size = await sizeRepo.findOne({
      where: { id },
      relations: ["collection", "category"],
    }) as Size | null;
    return size ? JSON.parse(JSON.stringify(size)) : null;
  } catch (error) {
    console.error("Error fetching size:", error);
    return null;
  }
}

async function getCollections() {
  try {
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);
    const collections = await collectionRepo.find({
      order: { displayOrder: "ASC" },
    }) as Collection[];
    return JSON.parse(JSON.stringify(collections));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const db = await getDatabase();
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const categoryRepo = db.getRepository(CategoryEntity);
    const categories = await categoryRepo.find({
      relations: ["collection"],
      order: { displayOrder: "ASC" },
    }) as Category[];
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function EditSizePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [size, collections, categories] = await Promise.all([
    getSize(id),
    getCollections(),
    getCategories(),
  ]);

  if (!size) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/sizes" className="hover:text-primary-600">
            Sizes
          </Link>
          <span>/</span>
          <span>Edit Size</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Size</h1>
      </div>

      <SizeForm
        collections={collections}
        categories={categories}
        initialData={{
          id: size.id,
          name: size.name,
          slug: size.slug,
          description: size.description || undefined,
          image: size.image || undefined,
          displayOrder: size.displayOrder,
          collectionId: size.collectionId || undefined,
          categoryId: size.categoryId || undefined,
        }}
      />
    </div>
  );
}
