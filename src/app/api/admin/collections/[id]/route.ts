import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

// GET single collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);
    const collection = await collectionRepo.findOne({
      where: { id },
      relations: ["categories", "sizes"],
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

// PUT update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { name, slug, description, image, displayOrder, hasCategories } = data;

    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);

    const collection = await collectionRepo.findOne({ where: { id } });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Check if slug already exists (for different collection)
    if (slug && slug !== collection.slug) {
      const existing = await collectionRepo.findOne({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 400 });
      }
    }

    // Update fields
    if (name) collection.name = name;
    if (slug) collection.slug = slug;
    if (description !== undefined) collection.description = description;
    if (image !== undefined) collection.image = image;
    if (displayOrder !== undefined) collection.displayOrder = displayOrder;
    if (hasCategories !== undefined) collection.hasCategories = hasCategories;

    await collectionRepo.save(collection);

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

// DELETE collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);

    const collection = await collectionRepo.findOne({
      where: { id },
      relations: ["categories", "sizes"],
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Check if collection has categories or sizes
    const hasChildren = (collection.categories?.length || 0) > 0 || (collection.sizes?.length || 0) > 0;
    if (hasChildren) {
      return NextResponse.json({
        error: "Cannot delete collection with categories or sizes. Please delete them first."
      }, { status: 400 });
    }

    await collectionRepo.remove(collection);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
