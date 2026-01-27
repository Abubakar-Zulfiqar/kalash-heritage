import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getDatabase } from "@/lib/db";
import type { Product } from "@/entities/Product";
import type { Collection } from "@/entities/Collection";
import type { Category } from "@/entities/Category";
import type { Size } from "@/entities/Size";
import Link from "next/link";

// Helper function to parse PostgreSQL array
function parsePostgresArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    let str = value.trim();
    if (str.startsWith('{')) str = str.slice(1);
    if (str.endsWith('}')) str = str.slice(0, -1);
    if (!str) return [];
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

async function getProduct(id: string) {
  try {
    const db = await getDatabase();
    const { Product: ProductEntity } = await import("@/entities/Product");
    const productRepo = db.getRepository(ProductEntity);
    const product = await productRepo.findOne({
      where: { id },
      relations: ["size", "size.collection", "size.category"],
    }) as Product | null;
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function getCollections() {
  try {
    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);
    const collections = await collectionRepo.find({ order: { displayOrder: "ASC" } }) as Collection[];
    return JSON.parse(JSON.stringify(collections));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const db = await getDatabase();
    const { Category: CategoryEntity } = await import("@/entities/Category");
    const categoryRepo = db.getRepository(CategoryEntity);
    const categories = await categoryRepo.find({ relations: ["collection"], order: { displayOrder: "ASC" } }) as Category[];
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getSizes() {
  try {
    const db = await getDatabase();
    const { Size: SizeEntity } = await import("@/entities/Size");
    const sizeRepo = db.getRepository(SizeEntity);
    const sizes = await sizeRepo.find({ relations: ["collection", "category"], order: { displayOrder: "ASC" } }) as Size[];
    return JSON.parse(JSON.stringify(sizes));
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return [];
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, collections, categories, sizes] = await Promise.all([
    getProduct(id),
    getCollections(),
    getCategories(),
    getSizes(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/products" className="hover:text-primary-600">
            Products
          </Link>
          <span>/</span>
          <span>Edit Product</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <ProductForm
        collections={collections}
        categories={categories}
        sizes={sizes}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          sizeId: product.sizeId || undefined,
          dimensions: product.dimensions || undefined,
          diameter: product.diameter || undefined,
          material: product.material || undefined,
          color: product.color || undefined,
          images: parsePostgresArray(product.images),
          thumbnail: product.thumbnail || undefined,
          metaTitle: product.metaTitle || undefined,
          metaDescription: product.metaDescription || undefined,
        }}
      />
    </div>
  );
}
