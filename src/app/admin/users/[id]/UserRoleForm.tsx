"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserRole } from "@/entities/User";

interface UserRoleFormProps {
  userId: string;
  currentRole: UserRole;
}

export default function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === currentRole) {
      toast.error("No changes to save");
      return;
    }

    if (
      role === UserRole.ADMIN &&
      !confirm("Are you sure you want to grant admin privileges to this user?")
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast.success("User role updated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to update user role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Role</h2>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={UserRole.CUSTOMER}>Customer</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || role === currentRole}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Update Role"}
        </button>
      </div>
    </form>
  );
}
