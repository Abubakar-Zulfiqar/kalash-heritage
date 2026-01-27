import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to parse PostgreSQL array
function parsePostgresArray(value: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // Handle PostgreSQL array format {url1,url2} or {"url1","url2"}
    let str = value.trim();

    // Remove ALL leading { characters (handles {{{{url}}}} case)
    while (str.startsWith('{')) {
      str = str.slice(1);
    }
    // Remove ALL trailing } characters
    while (str.endsWith('}')) {
      str = str.slice(0, -1);
    }

    // If empty after removing braces, return empty array
    if (!str) return [];

    // Parse the items (handles both quoted and unquoted)
    const items: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && str[i - 1] !== '\\') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        const item = current.trim().replace(/^"+|"+$/g, '');
        if (item) items.push(item);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) {
      const item = current.trim().replace(/^"+|"+$/g, '');
      if (item) items.push(item);
    }
    return items;
  }
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const db = await getDatabase();

    const result = await db.query(`
      SELECT
        p.*,
        s.name as "sizeName",
        s.slug as "sizeSlug",
        c.name as "categoryName",
        c.slug as "categorySlug",
        COALESCE(col.name, col2.name) as "collectionName",
        COALESCE(col.slug, col2.slug) as "collectionSlug"
      FROM products p
      LEFT JOIN sizes s ON p."sizeId" = s.id
      LEFT JOIN categories c ON s."categoryId" = c.id
      LEFT JOIN collections col ON c."collectionId" = col.id
      LEFT JOIN collections col2 ON s."collectionId" = col2.id
      WHERE p.slug = $1 AND p."deletedAt" IS NULL
      LIMIT 1
    `, [slug]);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const p = result[0];
    const parsedImages = parsePostgresArray(p.images);

    // Transform to frontend format
    const product = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      images: parsedImages,
      thumbnail: p.thumbnail || parsedImages[0] || null,
      dimensions: p.dimensions,
      diameter: p.diameter,
      material: p.material,
      color: p.color,
      // Flatten size/category/collection for frontend
      size: {
        name: p.sizeName,
        slug: p.sizeSlug,
        category: p.categoryName ? {
          name: p.categoryName,
          slug: p.categorySlug,
          collection: {
            name: p.collectionName,
            slug: p.collectionSlug,
          }
        } : null,
        collection: !p.categoryName && p.collectionName ? {
          name: p.collectionName,
          slug: p.collectionSlug,
        } : null,
      },
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
