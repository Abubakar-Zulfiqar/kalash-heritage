import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getDatabase } from "@/lib/db";
import { Product } from "@/entities/Product";
import { Category } from "@/entities/Category";
import Link from "next/link";

async function getProduct(id: string) {
  try {
    const db = await getDatabase();
    const productRepo = db.getRepository(Product);
    return await productRepo.findOne({
      where: { id },
      relations: ["category"],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function getCategories() {
  try {
    const db = await getDatabase();
    const categoryRepo = db.getRepository(Category);
    return await categoryRepo.find({ order: { name: "ASC" } });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
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
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : undefined,
          categoryId: product.categoryId || undefined,
          size: product.size || undefined,
          dimensions: product.dimensions || undefined,
          material: product.material || undefined,
          color: product.color || undefined,
          style: product.style || undefined,
          origin: product.origin || undefined,
          collection: product.collection || undefined,
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
