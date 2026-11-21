import ShopClient from "./ShopClient";
import { getCollections, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Same first query the client would make: page 1, shuffled, URL filters applied
  const [collections, products] = await Promise.all([
    getCollections().catch((error) => {
      console.error("Error loading collections:", error);
      return [];
    }),
    getProducts({
      page: 1,
      limit: 12,
      sortBy: "random",
      sortOrder: "DESC",
      collection: first(sp.collection) || null,
      category: first(sp.category) || null,
      size: first(sp.size) || null,
    }).catch((error) => {
      console.error("Error loading products:", error);
      return null;
    }),
  ]);

  return <ShopClient initialCollections={collections} initialProducts={products} />;
}
