import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { getDatabase } from "@/lib/db";
import { Category } from "@/entities/Category";
import Link from "next/link";

async function getCategory(id: string) {
  try {
    const db = await getDatabase();
    const categoryRepo = db.getRepository(Category);
    return await categoryRepo.findOne({ where: { id } });
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

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
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || undefined,
          image: category.image || undefined,
          displayOrder: category.displayOrder,
        }}
      />
    </div>
  );
}
