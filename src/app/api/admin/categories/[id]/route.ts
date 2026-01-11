import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { Category } from "@/entities/Category";
import { Not } from "typeorm";

export const dynamic = "force-dynamic";

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

    const db = await getDatabase();
    const categoryRepo = db.getRepository(Category);

    const category = await categoryRepo.findOne({ where: { id } });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check for duplicate slug (excluding current category)
    const existingSlug = await categoryRepo.findOne({
      where: { slug: data.slug, id: Not(id) },
    });
    if (existingSlug) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });
    }

    await categoryRepo.update(id, {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image: data.image || null,
      displayOrder: data.displayOrder || 0,
    });

    const updatedCategory = await categoryRepo.findOne({ where: { id } });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

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
    const categoryRepo = db.getRepository(Category);

    const category = await categoryRepo.findOne({ where: { id } });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await categoryRepo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
