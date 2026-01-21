import CollectionForm from "@/components/admin/CollectionForm";
import Link from "next/link";

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/collections" className="hover:text-primary-600">
            Collections
          </Link>
          <span>/</span>
          <span>New Collection</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Collection</h1>
      </div>

      <CollectionForm />
    </div>
  );
}
