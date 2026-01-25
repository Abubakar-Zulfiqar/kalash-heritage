import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Filters
    const collection = searchParams.get("collection");
    const category = searchParams.get("category");
    const sizeSlug = searchParams.get("size");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const color = searchParams.get("color");
    const style = searchParams.get("style");
    const material = searchParams.get("material");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "DESC").toUpperCase();

    const db = await getDatabase();

    // Build WHERE conditions
    const conditions: string[] = ['p."deletedAt" IS NULL', 'p."inStock" = true'];
    const params: (string | number | boolean)[] = [];
    let paramIndex = 1;

    if (collection) {
      conditions.push(`(col.slug = $${paramIndex} OR col2.slug = $${paramIndex})`);
      params.push(collection);
      paramIndex++;
    }

    if (category) {
      conditions.push(`c.slug = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (sizeSlug) {
      conditions.push(`s.slug = $${paramIndex}`);
      params.push(sizeSlug);
      paramIndex++;
    }

    if (minPrice) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (color) {
      conditions.push(`p.color = $${paramIndex}`);
      params.push(color);
      paramIndex++;
    }

    if (style) {
      conditions.push(`p.style = $${paramIndex}`);
      params.push(style);
      paramIndex++;
    }

    if (material) {
      conditions.push(`p.material ILIKE $${paramIndex}`);
      params.push(`%${material}%`);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (featured === "true") {
      conditions.push(`p.featured = true`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = ['createdAt', 'name', 'price'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN sizes s ON p."sizeId" = s.id
      LEFT JOIN categories c ON s."categoryId" = c.id
      LEFT JOIN collections col ON c."collectionId" = col.id
      LEFT JOIN collections col2 ON s."collectionId" = col2.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    // Data query
    const dataQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.images,
        p.thumbnail,
        p.dimensions,
        p.diameter,
        p.material,
        p.color,
        s.name as "sizeName",
        c.name as "categoryName",
        COALESCE(col.name, col2.name) as "collectionName"
      FROM products p
      LEFT JOIN sizes s ON p."sizeId" = s.id
      LEFT JOIN categories c ON s."categoryId" = c.id
      LEFT JOIN collections col ON c."collectionId" = col.id
      LEFT JOIN collections col2 ON s."collectionId" = col2.id
      ${whereClause}
      ORDER BY p."${safeSortBy}" ${safeSortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const products = await db.query(dataQuery, params);

    // Helper function to parse PostgreSQL array
    const parsePostgresArray = (value: string | string[] | null): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      // PostgreSQL returns arrays as {item1,item2,...} format
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const inner = value.slice(1, -1);
        if (!inner) return [];
        // Handle quoted strings with commas inside
        const items: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < inner.length; i++) {
          const char = inner[i];
          if (char === '"' && inner[i - 1] !== '\\') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            items.push(current.replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        if (current) {
          items.push(current.replace(/^"|"$/g, ''));
        }
        return items;
      }
      return [value];
    };

    // Transform data for frontend
    const transformedProducts = products.map((p: {
      id: string;
      name: string;
      slug: string;
      sku: string;
      description: string;
      images: string | string[];
      thumbnail: string;
      dimensions: string;
      diameter: string;
      material: string;
      color: string;
      sizeName: string;
      categoryName: string;
      collectionName: string;
    }) => {
      const parsedImages = parsePostgresArray(p.images);
      return {
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
        size: p.sizeName, // Transform size object to string
        category: p.categoryName,
        collection: p.collectionName,
      };
    });

    return NextResponse.json({
      data: transformedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
