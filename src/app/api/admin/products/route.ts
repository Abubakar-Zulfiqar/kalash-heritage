import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!data.sku) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    }

    // Auto-generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const db = await getDatabase();

    // Check for duplicate slug using raw query
    const existingSlugResult = await db.query(
      `SELECT id FROM products WHERE slug = $1 AND "deletedAt" IS NULL`,
      [slug]
    );
    if (existingSlugResult && existingSlugResult.length > 0) {
      return NextResponse.json({ error: "A product with this name already exists" }, { status: 400 });
    }

    // Check for duplicate SKU using raw query
    const existingSkuResult = await db.query(
      `SELECT id FROM products WHERE sku = $1 AND "deletedAt" IS NULL`,
      [data.sku]
    );
    if (existingSkuResult && existingSkuResult.length > 0) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
    }

    // Validate sizeId if provided using raw query
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
    // Strip any existing quotes to prevent double-quoting
    const cleanImages = (data.images || []).map((img: string) =>
      img.replace(/^"+|"+$/g, '').trim()
    ).filter((img: string) => img.length > 0);
    const imagesArray = cleanImages.length > 0
      ? `{${cleanImages.map((img: string) => `"${img}"`).join(',')}}`
      : '{}';

    // Insert the new product using raw query
    const insertResult = await db.query(
      `INSERT INTO products (
        id, name, slug, sku, description, price, "salePrice", currency,
        dimensions, diameter, material, color,
        stock, "inStock", featured,
        images, thumbnail,
        "metaTitle", "metaDescription",
        "sizeId", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16,
        $17, $18,
        $19, NOW(), NOW()
      )
      RETURNING *`,
      [
        data.name,
        slug,
        data.sku,
        data.description || '',
        0, // price - default for showcase mode
        null, // salePrice
        'USD', // currency
        data.dimensions || null,
        data.diameter || null,
        data.material || null,
        data.color || null,
        0, // stock - default for showcase mode
        true, // inStock
        false, // featured
        imagesArray,
        data.thumbnail || data.images?.[0] || null,
        data.metaTitle || null,
        data.metaDescription || null,
        data.sizeId || null,
      ]
    );

    return NextResponse.json(insertResult[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
