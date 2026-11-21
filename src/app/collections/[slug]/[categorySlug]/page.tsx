import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryDetailClient from "./CategoryDetailClient";
import { getCategoryInCollection, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; categorySlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  const result = await getCategoryInCollection(slug, categorySlug).catch(() => null);
  return result
    ? { title: `${result.category.name} - ${result.collection.name} | Kalash Heritage` }
    : {};
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug, categorySlug } = await params;
  const result = await getCategoryInCollection(slug, categorySlug);
  if (!result) notFound();

  const products = await getProducts({
    collection: decodeURIComponent(result.collection.slug),
    category: decodeURIComponent(result.category.slug),
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "DESC",
  }).catch((error) => {
    console.error("Error loading products:", error);
    return null;
  });

  return (
    <CategoryDetailClient
      initialCollection={result.collection}
      initialCategory={result.category}
      initialProducts={products}
    />
  );
}
