import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

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
    const { Product: ProductEntity } = await import("@/entities/Product");
    const productRepo = db.getRepository(ProductEntity);

    const product = await productRepo.findOne({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check for duplicate SKU (excluding current product) using raw query
    const existingSkuResult = await db.query(
      `SELECT id FROM products WHERE sku = $1 AND id != $2 AND "deletedAt" IS NULL`,
      [data.sku, id]
    );
    if (existingSkuResult && existingSkuResult.length > 0) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
    }

    // Validate sizeId if provided
    if (data.sizeId) {
      const { Size: SizeEntity } = await import("@/entities/Size");
      const sizeRepo = db.getRepository(SizeEntity);
      const size = await sizeRepo.findOne({ where: { id: data.sizeId } });
      if (!size) {
        return NextResponse.json({ error: "Size not found" }, { status: 404 });
      }
    }

    // Update product (keeping existing price/stock values, removing style/origin/pattern)
    await productRepo.update(id, {
      name: data.name,
      sku: data.sku,
      description: data.description,
      sizeId: data.sizeId || null,
      dimensions: data.dimensions || null,
      diameter: data.diameter || null,
      material: data.material || null,
      color: data.color || null,
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
    const { Product: ProductEntity } = await import("@/entities/Product");
    const productRepo = db.getRepository(ProductEntity);

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
