import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Category } from "@/entities/Category";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getDatabase();
    const categoryRepository = db.getRepository(Category);

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
