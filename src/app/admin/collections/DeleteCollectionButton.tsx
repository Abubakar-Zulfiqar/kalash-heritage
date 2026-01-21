"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteCollectionButtonProps {
  collectionId: string;
  collectionName: string;
  hasChildren: boolean;
}

export default function DeleteCollectionButton({
  collectionId,
  collectionName,
  hasChildren,
}: DeleteCollectionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (hasChildren) {
      toast.error("Cannot delete collection with categories or sizes. Please delete them first.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${collectionName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete collection");
      }

      toast.success("Collection deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete collection");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`px-3 py-1 text-sm font-medium ${
        hasChildren
          ? "text-gray-400 cursor-not-allowed"
          : "text-red-600 hover:text-red-800"
      }`}
      title={hasChildren ? "Delete categories and sizes first" : "Delete collection"}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
