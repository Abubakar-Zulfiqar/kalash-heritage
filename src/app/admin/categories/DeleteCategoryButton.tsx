"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  sizeCount: number;
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  sizeCount,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (sizeCount > 0) {
      toast.error("Cannot delete category with sizes. Please delete the sizes first.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`px-3 py-1 text-sm font-medium ${
        sizeCount > 0
          ? "text-gray-400 cursor-not-allowed"
          : "text-red-600 hover:text-red-800"
      }`}
      title={sizeCount > 0 ? "Delete sizes first" : "Delete category"}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
