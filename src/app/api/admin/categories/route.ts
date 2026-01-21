import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET all categories
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const categoryRepo = db.getRepository("Category");
    const categories = await categoryRepo.find({
      relations: ["collection", "sizes"],
      order: { displayOrder: "ASC" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, slug, description, image, displayOrder, collectionId } = data;

    if (!name || !slug || !collectionId) {
      return NextResponse.json({ error: "Name, slug, and collection are required" }, { status: 400 });
    }

    const db = await getDatabase();
    const categoryRepo = db.getRepository("Category");
    const collectionRepo = db.getRepository("Collection");

    // Check if collection exists and has categories enabled
    const collection = await collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    if (!collection.hasCategories) {
      return NextResponse.json({ error: "This collection does not support categories" }, { status: 400 });
    }

    // Check for duplicate slug within the same collection
    const existingSlug = await categoryRepo.findOne({
      where: { slug, collectionId },
    });
    if (existingSlug) {
      return NextResponse.json({ error: "A category with this slug already exists in this collection" }, { status: 400 });
    }

    const category = categoryRepo.create({
      name,
      slug,
      description: description || null,
      image: image || null,
      displayOrder: displayOrder || 0,
      collectionId,
    });

    const savedCategory = await categoryRepo.save(category);

    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
