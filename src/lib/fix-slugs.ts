import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDatabase } from "./db";

// Helper function to generate proper slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function fixSlugs() {
  const db = await getDatabase();

  console.log("🔧 Fixing slugs in database...");

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
      console.log(`  Collection: "${col.slug}" → "${newSlug}"`);
      await db.query(`UPDATE collections SET slug = $1 WHERE id = $2`, [newSlug, col.id]);
      results.collections++;
    }
  }

  // Fix category slugs
  const categories = await db.query(`SELECT id, name, slug FROM categories`);
  for (const cat of categories) {
    const newSlug = generateSlug(cat.name);
    if (cat.slug !== newSlug) {
      console.log(`  Category: "${cat.slug}" → "${newSlug}"`);
      await db.query(`UPDATE categories SET slug = $1 WHERE id = $2`, [newSlug, cat.id]);
      results.categories++;
    }
  }

  // Fix size slugs
  const sizes = await db.query(`SELECT id, name, slug FROM sizes`);
  for (const size of sizes) {
    const newSlug = generateSlug(size.name);
    if (size.slug !== newSlug) {
      console.log(`  Size: "${size.slug}" → "${newSlug}"`);
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
        console.log(`  Product: "${product.slug}" → "${newSlug}"`);
        await db.query(`UPDATE products SET slug = $1 WHERE id = $2`, [newSlug, product.id]);
        results.products++;
      } else {
        console.log(`  Product: "${product.slug}" → "${newSlug}" (SKIPPED - duplicate)`);
      }
    }
  }

  console.log("\n✅ Slugs fixed:");
  console.log(`   Collections: ${results.collections}`);
  console.log(`   Categories: ${results.categories}`);
  console.log(`   Sizes: ${results.sizes}`);
  console.log(`   Products: ${results.products}`);

  return results;
}

// Run if called directly
if (require.main === module) {
  fixSlugs()
    .then(() => {
      console.log("\n🎉 Slug fix completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Slug fix failed:", error);
      process.exit(1);
    });
}
