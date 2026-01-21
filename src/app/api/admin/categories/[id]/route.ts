import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { Not } from "typeorm";

export const dynamic = "force-dynamic";

// GET single category
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
    const categoryRepo = db.getRepository("Category");
    const category = await categoryRepo.findOne({
      where: { id },
      relations: ["collection", "sizes"],
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PUT update category
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
    const { name, slug, description, image, displayOrder, collectionId } = data;

    const db = await getDatabase();
    const categoryRepo = db.getRepository("Category");

    const category = await categoryRepo.findOne({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // If changing collection, verify the new collection supports categories
    if (collectionId && collectionId !== category.collectionId) {
      const collectionRepo = db.getRepository("Collection");
      const collection = await collectionRepo.findOne({ where: { id: collectionId } });
      if (!collection) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      }
      if (!collection.hasCategories) {
        return NextResponse.json({ error: "This collection does not support categories" }, { status: 400 });
      }
    }

    // Check for duplicate slug (excluding current category, within same collection)
    if (slug && slug !== category.slug) {
      const targetCollectionId = collectionId || category.collectionId;
      const existingSlug = await categoryRepo.findOne({
        where: { slug, collectionId: targetCollectionId, id: Not(id) },
      });
      if (existingSlug) {
        return NextResponse.json({ error: "A category with this slug already exists in this collection" }, { status: 400 });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (collectionId) category.collectionId = collectionId;

    await categoryRepo.save(category);

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE category
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
    const categoryRepo = db.getRepository("Category");

    const category = await categoryRepo.findOne({
      where: { id },
      relations: ["sizes"],
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has sizes
    if (category.sizes && category.sizes.length > 0) {
      return NextResponse.json({
        error: "Cannot delete category with sizes. Please delete the sizes first."
      }, { status: 400 });
    }

    await categoryRepo.remove(category);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
