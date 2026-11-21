import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionDetailClient from "./CollectionDetailClient";
import { getCollectionBySlug, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug).catch(() => null);
  return collection ? { title: `${collection.name} | Kalash Heritage` } : {};
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  // Collections without categories list their products directly
  const products = collection.hasCategories
    ? null
    : await getProducts({
        collection: decodeURIComponent(collection.slug),
        page: 1,
        limit: 12,
        sortBy: "createdAt",
        sortOrder: "DESC",
      }).catch((error) => {
        console.error("Error loading products:", error);
        return null;
      });

  return <CollectionDetailClient initialCollection={collection} initialProducts={products} />;
}
