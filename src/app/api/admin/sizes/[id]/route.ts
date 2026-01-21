import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { Not, IsNull } from "typeorm";

export const dynamic = "force-dynamic";

// GET single size
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
    const sizeRepo = db.getRepository("Size");
    const size = await sizeRepo.findOne({
      where: { id },
      relations: ["collection", "category", "products"],
    });

    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error) {
    console.error("Error fetching size:", error);
    return NextResponse.json({ error: "Failed to fetch size" }, { status: 500 });
  }
}

// PUT update size
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
    const { name, slug, description, image, displayOrder, collectionId, categoryId } = data;

    const db = await getDatabase();
    const sizeRepo = db.getRepository("Size");
    const collectionRepo = db.getRepository("Collection");
    const categoryRepo = db.getRepository("Category");

    const size = await sizeRepo.findOne({ where: { id } });
    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    // Validate category or collection
    if (categoryId) {
      const category = await categoryRepo.findOne({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      // Check for duplicate slug within the same category (excluding current size)
      if (slug && (slug !== size.slug || categoryId !== size.categoryId)) {
        const existingSlug = await sizeRepo.findOne({
          where: { slug, categoryId, id: Not(id) },
        });
        if (existingSlug) {
          return NextResponse.json({ error: "A size with this slug already exists in this category" }, { status: 400 });
        }
      }
    } else if (collectionId) {
      const collection = await collectionRepo.findOne({ where: { id: collectionId } });
      if (!collection) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      }
      if (collection.hasCategories) {
        return NextResponse.json({ error: "This collection has categories. Please select a category instead." }, { status: 400 });
      }
      // Check for duplicate slug within the same collection (excluding current size)
      if (slug && (slug !== size.slug || collectionId !== size.collectionId)) {
        const existingSlug = await sizeRepo.findOne({
          where: { slug, collectionId, categoryId: IsNull(), id: Not(id) },
        });
        if (existingSlug) {
          return NextResponse.json({ error: "A size with this slug already exists in this collection" }, { status: 400 });
        }
      }
    }

    // Update fields
    if (name) size.name = name;
    if (slug) size.slug = slug;
    if (description !== undefined) size.description = description;
    if (image !== undefined) size.image = image;
    if (displayOrder !== undefined) size.displayOrder = displayOrder;

    // Update collection/category relationship
    if (categoryId) {
      size.categoryId = categoryId;
      size.collectionId = null as unknown as undefined;
    } else if (collectionId) {
      size.collectionId = collectionId;
      size.categoryId = null as unknown as undefined;
    }

    await sizeRepo.save(size);

    return NextResponse.json(size);
  } catch (error) {
    console.error("Error updating size:", error);
    return NextResponse.json({ error: "Failed to update size" }, { status: 500 });
  }
}

// DELETE size
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
    const sizeRepo = db.getRepository("Size");

    const size = await sizeRepo.findOne({
      where: { id },
      relations: ["products"],
    });

    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    // Check if size has products
    if (size.products && size.products.length > 0) {
      return NextResponse.json({
        error: "Cannot delete size with products. Please delete or reassign the products first."
      }, { status: 400 });
    }

    await sizeRepo.remove(size);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting size:", error);
    return NextResponse.json({ error: "Failed to delete size" }, { status: 500 });
  }
}
