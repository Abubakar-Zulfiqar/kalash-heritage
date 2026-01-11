import CategoryForm from "@/components/admin/CategoryForm";
import Link from "next/link";

export default function NewCategoryPage() {
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

      <CategoryForm />
    </div>
  );
}
