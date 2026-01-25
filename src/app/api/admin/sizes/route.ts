import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET all sizes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const { Size: SizeEntity } = await import("@/entities/Size");
    const sizeRepo = db.getRepository(SizeEntity);
    const sizes = await sizeRepo.find({
      relations: ["collection", "category", "products"],
      order: { displayOrder: "ASC" },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json({ error: "Failed to fetch sizes" }, { status: 500 });
  }
}

// POST create new size
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, image, collectionId, categoryId } = data;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!collectionId && !categoryId) {
      return NextResponse.json({ error: "Either collection or category is required" }, { status: 400 });
    }

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const db = await getDatabase();

    let displayOrder = 1;

    if (categoryId) {
      // Validate category exists using raw query to avoid entity import
      const categoryResult = await db.query(
        `SELECT id, "collectionId" FROM categories WHERE id = $1`,
        [categoryId]
      );
      if (!categoryResult || categoryResult.length === 0) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      // Check for duplicate slug within the same category
      const existingSlugResult = await db.query(
        `SELECT id FROM sizes WHERE slug = $1 AND "categoryId" = $2`,
        [slug, categoryId]
      );
      if (existingSlugResult && existingSlugResult.length > 0) {
        return NextResponse.json({ error: "A size with this name already exists in this category" }, { status: 400 });
      }

      // Calculate displayOrder
      const countResult = await db.query(
        `SELECT COUNT(*) as count FROM sizes WHERE "categoryId" = $1`,
        [categoryId]
      );
      displayOrder = parseInt(countResult[0].count) + 1;

    } else if (collectionId) {
      // Validate collection exists and check hasCategories
      const collectionResult = await db.query(
        `SELECT id, "hasCategories" FROM collections WHERE id = $1`,
        [collectionId]
      );
      if (!collectionResult || collectionResult.length === 0) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      }
      if (collectionResult[0].hasCategories) {
        return NextResponse.json({ error: "This collection has categories. Please select a category instead." }, { status: 400 });
      }

      // Check for duplicate slug within the same collection (without category)
      const existingSlugResult = await db.query(
        `SELECT id FROM sizes WHERE slug = $1 AND "collectionId" = $2 AND "categoryId" IS NULL`,
        [slug, collectionId]
      );
      if (existingSlugResult && existingSlugResult.length > 0) {
        return NextResponse.json({ error: "A size with this name already exists in this collection" }, { status: 400 });
      }

      // Calculate displayOrder - count sizes without category in this collection
      const countResult = await db.query(
        `SELECT COUNT(*) as count FROM sizes WHERE "collectionId" = $1 AND "categoryId" IS NULL`,
        [collectionId]
      );
      displayOrder = parseInt(countResult[0].count) + 1;
    }

    // Insert the new size using raw query
    const insertResult = await db.query(
      `INSERT INTO sizes (id, name, slug, description, image, "displayOrder", "collectionId", "categoryId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        name,
        slug,
        description || null,
        image || null,
        displayOrder,
        categoryId ? null : collectionId,
        categoryId || null,
      ]
    );

    return NextResponse.json(insertResult[0], { status: 201 });
  } catch (error) {
    console.error("Error creating size:", error);
    return NextResponse.json({ error: "Failed to create size" }, { status: 500 });
  }
}
