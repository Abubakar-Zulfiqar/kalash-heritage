"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteSizeButtonProps {
  sizeId: string;
  sizeName: string;
  productCount: number;
}

export default function DeleteSizeButton({
  sizeId,
  sizeName,
  productCount,
}: DeleteSizeButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (productCount > 0) {
      toast.error("Cannot delete size with products. Please delete or reassign the products first.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${sizeName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/sizes/${sizeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete size");
      }

      toast.success("Size deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete size");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`px-3 py-1 text-sm font-medium ${
        productCount > 0
          ? "text-gray-400 cursor-not-allowed"
          : "text-red-600 hover:text-red-800"
      }`}
      title={productCount > 0 ? "Delete products first" : "Delete size"}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
