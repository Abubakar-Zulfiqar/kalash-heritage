import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { IsNull } from "typeorm";

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
    const { Size: SizeEntity } = await import("@/entities/Size");
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const sizeRepo = db.getRepository(SizeEntity);
    const collectionRepo = db.getRepository(CollectionEntity);
    const categoryRepo = db.getRepository(CategoryEntity);

    let displayOrder = 1;

    if (categoryId) {
      // Validate category exists
      const category = await categoryRepo.findOne({
        where: { id: categoryId },
        relations: ["collection"],
      });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      // Check for duplicate slug within the same category
      const existingSlug = await sizeRepo.findOne({
        where: { slug, categoryId },
      });
      if (existingSlug) {
        return NextResponse.json({ error: "A size with this name already exists in this category" }, { status: 400 });
      }

      // Calculate displayOrder
      const count = await sizeRepo.count({ where: { categoryId } });
      displayOrder = count + 1;

    } else if (collectionId) {
      // Validate collection exists
      const collection = await collectionRepo.findOne({ where: { id: collectionId } });
      if (!collection) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      }
      if (collection.hasCategories) {
        return NextResponse.json({ error: "This collection has categories. Please select a category instead." }, { status: 400 });
      }

      // Check for duplicate slug within the same collection (where categoryId is null)
      const existingSlug = await sizeRepo.findOne({
        where: { slug, collectionId, categoryId: IsNull() },
      });
      if (existingSlug) {
        return NextResponse.json({ error: "A size with this name already exists in this collection" }, { status: 400 });
      }

      // Calculate displayOrder
      const count = await sizeRepo.count({ where: { collectionId, categoryId: IsNull() } });
      displayOrder = count + 1;
    }

    const size = sizeRepo.create({
      name,
      slug,
      description: description || null,
      image: image || null,
      displayOrder,
      collectionId: categoryId ? null : collectionId,
      categoryId: categoryId || null,
    });

    const savedSize = await sizeRepo.save(size);

    return NextResponse.json(savedSize, { status: 201 });
  } catch (error) {
    console.error("Error creating size:", error);
    return NextResponse.json({ error: "Failed to create size" }, { status: 500 });
  }
}
