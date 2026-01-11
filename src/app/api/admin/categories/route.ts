import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { Category } from "@/entities/Category";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const db = await getDatabase();
    const categoryRepo = db.getRepository(Category);

    // Check for duplicate slug
    const existingSlug = await categoryRepo.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });
    }

    const category = categoryRepo.create({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image: data.image || null,
      displayOrder: data.displayOrder || 0,
    });

    const savedCategory = await categoryRepo.save(category);

    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
