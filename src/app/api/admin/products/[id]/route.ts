import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
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
    const productRepo = db.getRepository("Product");

    const product = await productRepo.findOne({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check for duplicate slug (excluding current product)
    const existingSlug = await productRepo.findOne({
      where: { slug: data.slug, id: Not(id) },
    });
    if (existingSlug) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }

    // Check for duplicate SKU (excluding current product)
    const existingSku = await productRepo.findOne({
      where: { sku: data.sku, id: Not(id) },
    });
    if (existingSku) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
    }

    // Validate sizeId if provided
    if (data.sizeId) {
      const sizeRepo = db.getRepository("Size");
      const size = await sizeRepo.findOne({ where: { id: data.sizeId } });
      if (!size) {
        return NextResponse.json({ error: "Size not found" }, { status: 404 });
      }
    }

    // Update product
    await productRepo.update(id, {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      price: data.price,
      salePrice: data.salePrice || null,
      sizeId: data.sizeId || null,
      dimensions: data.dimensions || null,
      material: data.material || null,
      color: data.color || null,
      style: data.style || null,
      origin: data.origin || null,
      pattern: data.pattern || null,
      stock: data.stock,
      inStock: data.inStock,
      featured: data.featured,
      images: data.images || [],
      thumbnail: data.thumbnail || data.images?.[0] || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
    });

    const updatedProduct = await productRepo.findOne({ where: { id } });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
    const productRepo = db.getRepository("Product");

    const product = await productRepo.findOne({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete the product
    await productRepo.softDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
