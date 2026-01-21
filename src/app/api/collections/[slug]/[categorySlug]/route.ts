import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; categorySlug: string }> }
) {
  try {
    const { slug, categorySlug } = await params;
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const collectionRepo = db.getRepository(CollectionEntity);
    const categoryRepo = db.getRepository(CategoryEntity);

    // First get the collection
    const collection = await collectionRepo.findOne({
      where: { slug },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Then get the category within that collection
    const category = await categoryRepo.findOne({
      where: { slug: categorySlug, collectionId: collection.id },
      relations: ["collection", "sizes"],
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      collection,
      category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
