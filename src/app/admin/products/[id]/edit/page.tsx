import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getDatabase } from "@/lib/db";
import type { Product } from "@/entities/Product";
import type { Collection } from "@/entities/Collection";
import type { Category } from "@/entities/Category";
import type { Size } from "@/entities/Size";
import Link from "next/link";

async function getProduct(id: string) {
  try {
    const db = await getDatabase();
    const productRepo = db.getRepository("Product");
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
    const collectionRepo = db.getRepository("Collection");
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
    const categoryRepo = db.getRepository("Category");
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
    const sizeRepo = db.getRepository("Size");
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
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : undefined,
          sizeId: product.sizeId || undefined,
          dimensions: product.dimensions || undefined,
          material: product.material || undefined,
          color: product.color || undefined,
          style: product.style || undefined,
          origin: product.origin || undefined,
          pattern: product.pattern || undefined,
          stock: product.stock,
          inStock: product.inStock,
          featured: product.featured,
          images: product.images || [],
          thumbnail: product.thumbnail || undefined,
          metaTitle: product.metaTitle || undefined,
          metaDescription: product.metaDescription || undefined,
        }}
      />
    </div>
  );
}
