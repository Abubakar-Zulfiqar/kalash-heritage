import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getDatabase();
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const categoryRepository = db.getRepository(CategoryEntity);

    const categories = await categoryRepository.find({
      order: { name: "ASC" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
