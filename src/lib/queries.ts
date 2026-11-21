// Server-side only: imports the database. Never import from a "use client" file.
import { cache } from "react";
import { getDatabase } from "@/lib/db";

// Shared data access for API routes and server-rendered pages.
// Every function returns plain JSON-safe objects (the same shape the API
// routes have always returned), so results can be passed straight to
// client components.

const toPlain = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// PostgreSQL arrays may come back as {url1,url2}, {"url1","url2"} or plain
// comma lists, sometimes with stray extra braces/quotes from old data.
export function parsePostgresArray(value: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  let str = value.trim();
  while (str.startsWith("{")) str = str.slice(1);
  while (str.endsWith("}")) str = str.slice(0, -1);
  if (!str) return [];

  const items: string[] = [];
  let current = "";
  let inQuotes = false;
  const push = () => {
    const item = current.trim().replace(/^"+|"+$/g, "");
    if (item) items.push(item);
    current = "";
  };
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && str[i - 1] !== "\\") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      push();
    } else {
      current += char;
    }
  }
  if (current) push();
  return items;
}

// ---------------------------------------------------------------- collections

export async function getCollections() {
  const db = await getDatabase();
  const { Collection } = await import("@/entities/Collection");
  const collections = await db.getRepository(Collection).find({
    relations: ["categories", "sizes"],
    order: { displayOrder: "ASC" },
  });
  return toPlain(collections);
}

export const getCollectionBySlug = cache(async function getCollectionBySlug(slug: string) {
  const db = await getDatabase();
  const { Collection } = await import("@/entities/Collection");
  const collection = await db.getRepository(Collection).findOne({
    where: { slug },
    relations: ["categories", "categories.sizes", "sizes"],
  });
  return collection ? toPlain(collection) : null;
});

export const getCategoryInCollection = cache(async function getCategoryInCollection(slug: string, categorySlug: string) {
  const db = await getDatabase();
  const { Collection } = await import("@/entities/Collection");
  const { Category } = await import("@/entities/Category");

  const collection = await db.getRepository(Collection).findOne({ where: { slug } });
  if (!collection) return null;

  const category = await db.getRepository(Category).findOne({
    where: { slug: categorySlug, collectionId: collection.id },
    relations: ["collection", "sizes"],
  });
  if (!category) return null;

  return toPlain({ collection, category });
});

// ------------------------------------------------------------------- products

export interface ProductQuery {
  page?: number;
  limit?: number;
  collection?: string | null;
  category?: string | null;
  size?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  color?: string | null;
  style?: string | null;
  material?: string | null;
  search?: string | null;
  featured?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

export function productQueryFromParams(sp: URLSearchParams): ProductQuery {
  return {
    page: parseInt(sp.get("page") || "1"),
    limit: parseInt(sp.get("limit") || "12"),
    collection: sp.get("collection"),
    category: sp.get("category"),
    size: sp.get("size"),
    minPrice: sp.get("minPrice"),
    maxPrice: sp.get("maxPrice"),
    color: sp.get("color"),
    style: sp.get("style"),
    material: sp.get("material"),
    search: sp.get("search"),
    featured: sp.get("featured"),
    sortBy: sp.get("sortBy"),
    sortOrder: sp.get("sortOrder"),
  };
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  images: string[];
  thumbnail: string | null;
  dimensions: string;
  diameter: string;
  material: string;
  color: string;
  size: string;
  category: string;
  collection: string;
}

export interface ProductList {
  data: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProducts(q: ProductQuery): Promise<ProductList> {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 12));
  const offset = (page - 1) * limit;
  const sortBy = q.sortBy || "createdAt";
  const sortOrder = (q.sortOrder || "DESC").toUpperCase();

  const db = await getDatabase();

  const conditions: string[] = ['p."deletedAt" IS NULL', 'p."inStock" = true'];
  const params: (string | number | boolean)[] = [];
  const add = (sql: (n: number) => string, value: string | number) => {
    params.push(value);
    conditions.push(sql(params.length));
  };

  if (q.collection) add((n) => `(col.slug = $${n} OR col2.slug = $${n})`, q.collection);
  if (q.category) add((n) => `c.slug = $${n}`, q.category);
  if (q.size) add((n) => `s.slug = $${n}`, q.size);
  if (q.minPrice) add((n) => `p.price >= $${n}`, parseFloat(q.minPrice));
  if (q.maxPrice) add((n) => `p.price <= $${n}`, parseFloat(q.maxPrice));
  if (q.color) add((n) => `p.color = $${n}`, q.color);
  if (q.style) add((n) => `p.style = $${n}`, q.style);
  if (q.material) add((n) => `p.material ILIKE $${n}`, `%${q.material}%`);
  if (q.search) add((n) => `(p.name ILIKE $${n} OR p.description ILIKE $${n})`, `%${q.search}%`);
  if (q.featured === "true") conditions.push("p.featured = true");

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // Whitelisted to prevent SQL injection
  const allowedSortColumns = ["createdAt", "name", "price", "random"];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "random";
  const safeSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

  const joins = `
    FROM products p
    LEFT JOIN sizes s ON p."sizeId" = s.id
    LEFT JOIN categories c ON s."categoryId" = c.id
    LEFT JOIN collections col ON c."collectionId" = col.id
    LEFT JOIN collections col2 ON s."collectionId" = col2.id
  `;

  const [countResult, rows] = await Promise.all([
    db.query(`SELECT COUNT(*) as total ${joins} ${whereClause}`, params),
    db.query(
      `SELECT
        p.id, p.name, p.slug, p.sku, p.description, p.images, p.thumbnail,
        p.dimensions, p.diameter, p.material, p.color,
        s.name as "sizeName",
        c.name as "categoryName",
        COALESCE(col.name, col2.name) as "collectionName"
      ${joins}
      ${whereClause}
      ORDER BY ${safeSortBy === "random" ? "RANDOM()" : `p."${safeSortBy}" ${safeSortOrder}`}
      LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
  ]);

  const total = parseInt(countResult[0]?.total || "0");

  const data: ProductListItem[] = rows.map((p: Record<string, string>) => {
    const images = parsePostgresArray(p.images);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      images,
      thumbnail: p.thumbnail || images[0] || null,
      dimensions: p.dimensions,
      diameter: p.diameter,
      material: p.material,
      color: p.color,
      size: p.sizeName,
      category: p.categoryName,
      collection: p.collectionName,
    };
  });

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export const getProductBySlug = cache(async function getProductBySlug(slug: string) {
  const db = await getDatabase();
  const result = await db.query(
    `SELECT
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
    LIMIT 1`,
    [slug]
  );
  if (!result || result.length === 0) return null;

  const p = result[0];
  const images = parsePostgresArray(p.images);

  return toPlain({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    images,
    thumbnail: p.thumbnail || images[0] || null,
    dimensions: p.dimensions,
    diameter: p.diameter,
    material: p.material,
    color: p.color,
    size: {
      name: p.sizeName,
      slug: p.sizeSlug,
      category: p.categoryName
        ? {
            name: p.categoryName,
            slug: p.categorySlug,
            collection: { name: p.collectionName, slug: p.collectionSlug },
          }
        : null,
      collection:
        !p.categoryName && p.collectionName
          ? { name: p.collectionName, slug: p.collectionSlug }
          : null,
    },
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });
});
