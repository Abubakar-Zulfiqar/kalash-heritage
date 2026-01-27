import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = searchParams.get("collection"); // Optional: filter by collection

    const db = await getDatabase();

    // Base conditions for products
    let productConditions = 'p."deletedAt" IS NULL AND p."inStock" = true';
    const params: string[] = [];
    let paramIndex = 1;

    // If collection is specified, filter products by that collection
    let collectionJoin = '';
    if (collection) {
      collectionJoin = `
        LEFT JOIN sizes s ON p."sizeId" = s.id
        LEFT JOIN categories c ON s."categoryId" = c.id
        LEFT JOIN collections col ON c."collectionId" = col.id
        LEFT JOIN collections col2 ON s."collectionId" = col2.id
      `;
      productConditions += ` AND (col.slug = $${paramIndex} OR col2.slug = $${paramIndex})`;
      params.push(collection);
      paramIndex++;
    }

    // Get distinct colors from products
    const colorsQuery = `
      SELECT DISTINCT p.color
      FROM products p
      ${collectionJoin}
      WHERE ${productConditions} AND p.color IS NOT NULL AND p.color != ''
      ORDER BY p.color
    `;
    const colorsResult = await db.query(colorsQuery, params);
    const colors = colorsResult.map((r: { color: string }) => r.color);

    // Get distinct styles from products
    const stylesQuery = `
      SELECT DISTINCT p.style
      FROM products p
      ${collectionJoin}
      WHERE ${productConditions} AND p.style IS NOT NULL AND p.style != ''
      ORDER BY p.style
    `;
    const stylesResult = await db.query(stylesQuery, params);
    const styles = stylesResult.map((r: { style: string }) => r.style);

    // Get distinct materials from products
    const materialsQuery = `
      SELECT DISTINCT p.material
      FROM products p
      ${collectionJoin}
      WHERE ${productConditions} AND p.material IS NOT NULL AND p.material != ''
      ORDER BY p.material
    `;
    const materialsResult = await db.query(materialsQuery, params);
    const materials = materialsResult.map((r: { material: string }) => r.material);

    // Get sizes - either all sizes or filtered by collection
    // Use DISTINCT ON (name) to deduplicate sizes with same name
    let sizesQuery: string;
    let sizesParams: string[] = [];

    if (collection) {
      // Get sizes that belong to this collection (via category or directly)
      // Use subquery to deduplicate by name
      sizesQuery = `
        SELECT DISTINCT ON (s.name) s.id, s.name, s.slug
        FROM sizes s
        LEFT JOIN categories c ON s."categoryId" = c.id
        LEFT JOIN collections col ON c."collectionId" = col.id
        LEFT JOIN collections col2 ON s."collectionId" = col2.id
        WHERE (col.slug = $1 OR col2.slug = $1)
        ORDER BY s.name, s.id
      `;
      sizesParams = [collection];
    } else {
      // Get all sizes - deduplicate by name
      sizesQuery = `
        SELECT DISTINCT ON (name) id, name, slug FROM sizes ORDER BY name, id
      `;
    }
    const sizesResult = await db.query(sizesQuery, sizesParams);
    const sizes = sizesResult.map((r: { id: string; name: string; slug: string }) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
    }));

    // Get collections (only for shop page, not needed when filtering by collection)
    let collections: { id: string; name: string; slug: string }[] = [];
    if (!collection) {
      const collectionsQuery = `
        SELECT id, name, slug FROM collections ORDER BY "displayOrder" ASC
      `;
      const collectionsResult = await db.query(collectionsQuery);
      collections = collectionsResult.map((r: { id: string; name: string; slug: string }) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
      }));
    }

    return NextResponse.json({
      collections,
      colors,
      styles,
      materials,
      sizes,
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
