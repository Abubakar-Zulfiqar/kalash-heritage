import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper function to generate proper slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// POST - Fix all bad slugs in the database
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const results = {
      collections: 0,
      categories: 0,
      sizes: 0,
      products: 0,
    };

    // Fix collection slugs
    const collections = await db.query(`SELECT id, name, slug FROM collections`);
    for (const col of collections) {
      const newSlug = generateSlug(col.name);
      if (col.slug !== newSlug) {
        await db.query(`UPDATE collections SET slug = $1 WHERE id = $2`, [newSlug, col.id]);
        results.collections++;
      }
    }

    // Fix category slugs
    const categories = await db.query(`SELECT id, name, slug FROM categories`);
    for (const cat of categories) {
      const newSlug = generateSlug(cat.name);
      if (cat.slug !== newSlug) {
        await db.query(`UPDATE categories SET slug = $1 WHERE id = $2`, [newSlug, cat.id]);
        results.categories++;
      }
    }

    // Fix size slugs
    const sizes = await db.query(`SELECT id, name, slug FROM sizes`);
    for (const size of sizes) {
      const newSlug = generateSlug(size.name);
      if (size.slug !== newSlug) {
        await db.query(`UPDATE sizes SET slug = $1 WHERE id = $2`, [newSlug, size.id]);
        results.sizes++;
      }
    }

    // Fix product slugs
    const products = await db.query(`SELECT id, name, slug FROM products WHERE "deletedAt" IS NULL`);
    for (const product of products) {
      const newSlug = generateSlug(product.name);
      if (product.slug !== newSlug) {
        // Check for duplicate slug
        const existing = await db.query(
          `SELECT id FROM products WHERE slug = $1 AND id != $2 AND "deletedAt" IS NULL`,
          [newSlug, product.id]
        );
        if (existing.length === 0) {
          await db.query(`UPDATE products SET slug = $1 WHERE id = $2`, [newSlug, product.id]);
          results.products++;
        }
      }
    }

    return NextResponse.json({
      message: "Slugs fixed successfully",
      fixed: results,
    });
  } catch (error) {
    console.error("Error fixing slugs:", error);
    return NextResponse.json({ error: "Failed to fix slugs" }, { status: 500 });
  }
}
