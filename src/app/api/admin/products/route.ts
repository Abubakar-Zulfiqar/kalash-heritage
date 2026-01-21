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

    const db = await getDatabase();
    const { Product: ProductEntity } = await import("@/entities/Product");
    const productRepo = db.getRepository(ProductEntity);

    // Check for duplicate slug or SKU
    const existingSlug = await productRepo.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }

    const existingSku = await productRepo.findOne({ where: { sku: data.sku } });
    if (existingSku) {
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

    const product = productRepo.create({
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

    const savedProduct = await productRepo.save(product);

    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
