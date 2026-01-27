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

    // Check if product exists
    const existingProduct = await db.query(
      `SELECT id FROM products WHERE id = $1 AND "deletedAt" IS NULL`,
      [id]
    );
    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check for duplicate SKU (excluding current product)
    const existingSkuResult = await db.query(
      `SELECT id FROM products WHERE sku = $1 AND id != $2 AND "deletedAt" IS NULL`,
      [data.sku, id]
    );
    if (existingSkuResult && existingSkuResult.length > 0) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
    }

    // Validate sizeId if provided
    if (data.sizeId) {
      const sizeResult = await db.query(
        `SELECT id FROM sizes WHERE id = $1`,
        [data.sizeId]
      );
      if (!sizeResult || sizeResult.length === 0) {
        return NextResponse.json({ error: "Size not found" }, { status: 404 });
      }
    }

    // Convert images array to PostgreSQL array format
    // Strip any existing quotes and braces to prevent corruption
    const cleanImages = (data.images || []).map((img: string) =>
      img.replace(/^["{]+|["}]+$/g, '').trim()
    ).filter((img: string) => img.length > 0 && img.startsWith('http'));
    const imagesArray = cleanImages.length > 0
      ? `{${cleanImages.map((img: string) => `"${img}"`).join(',')}}`
      : '{}';

    // Update product using raw query
    const updateResult = await db.query(
      `UPDATE products SET
        name = $1,
        sku = $2,
        description = $3,
        "sizeId" = $4,
        dimensions = $5,
        diameter = $6,
        material = $7,
        color = $8,
        images = $9,
        thumbnail = $10,
        "metaTitle" = $11,
        "metaDescription" = $12,
        "updatedAt" = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        data.name,
        data.sku,
        data.description || '',
        data.sizeId || null,
        data.dimensions || null,
        data.diameter || null,
        data.material || null,
        data.color || null,
        imagesArray,
        data.thumbnail || data.images?.[0] || null,
        data.metaTitle || null,
        data.metaDescription || null,
        id,
      ]
    );

    return NextResponse.json(updateResult[0]);
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

    // Check if product exists
    const existingProduct = await db.query(
      `SELECT id FROM products WHERE id = $1 AND "deletedAt" IS NULL`,
      [id]
    );
    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete the product
    await db.query(
      `UPDATE products SET "deletedAt" = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
