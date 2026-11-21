"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

interface Size {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sizes?: Size[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  hasCategories: boolean;
  categories?: Category[];
  sizes?: Size[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price?: number;
  salePrice?: number;
  images: string[];
  size?: string;
  material?: string;
  color?: string;
  dimensions?: string;
}

interface SelectedFilters {
  collection: string;
  size: string;
  style: string;
}

interface InitialProducts {
  data: Product[];
  total: number;
  totalPages: number;
}

const productsQuery = (
  collectionSlug: string,
  page: number,
  sortBy: string,
  filters: SelectedFilters
) => {
  // Decode any URL-encoded characters before passing to URLSearchParams (to avoid double-encoding)
  const params = new URLSearchParams({
    collection: decodeURIComponent(collectionSlug),
    page: page.toString(),
    limit: "12",
    sortBy,
    sortOrder: "DESC",
  });
  if (filters.size) params.append("size", filters.size);
  if (filters.style) params.append("style", filters.style);
  return params.toString();
};

export default function CollectionDetailClient({
  initialCollection,
  initialProducts,
}: {
  initialCollection: Collection;
  initialProducts: InitialProducts | null;
}) {
  // Collection (and its first page of products) come from the server with the HTML
  const collection = initialCollection;
  const [products, setProducts] = useState<Product[]>(initialProducts?.data ?? []);
  const [productsLoading, setProductsLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(initialProducts?.total ?? 0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialProducts?.totalPages || 1);
  const [sortBy, setSortBy] = useState("createdAt");

  // Filters state
  const [filters, setFilters] = useState<SelectedFilters>({
    collection: "",
    size: "",
    style: "",
  });

  // The query the server already answered; skip re-fetching it on load
  const lastQuery = useRef<string | null>(
    initialProducts
      ? productsQuery(initialCollection.slug, 1, "createdAt", { collection: "", size: "", style: "" })
      : null
  );

  // Fetch products for collections without categories (when filters/page/sort change)
  useEffect(() => {
    if (collection.hasCategories) return;

    const query = productsQuery(collection.slug, page, sortBy, filters);
    if (query === lastQuery.current) return;
    lastQuery.current = query;

    setProductsLoading(true);
    fetch(`/api/products?${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProducts(data.data);
          setTotalProducts(data.total);
          setTotalPages(data.totalPages);
        } else {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
        setProductsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts([]);
        setProductsLoading(false);
      });
  }, [collection, filters, page, sortBy]);

  // Handle filter changes from ProductFilters component
  const handleFiltersChange = useCallback((newFilters: SelectedFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // If collection has categories, show category cards
  if (collection.hasCategories) {
    const categories = collection.categories || [];

    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link href="/collections" className="hover:text-primary-600">
                  Collections
                </Link>
                <span>/</span>
                <span className="text-gray-700">{collection.name}</span>
              </div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                  {collection.description}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Categories</h2>
              <p className="text-gray-600 mt-1">
                Browse {categories.length} categories in this collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div key={category.id} initial={false}>
                  <Link
                    href={`/collections/${collection.slug}/${category.slug}`}
                    className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index < 3}
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-24 h-24 text-primary-300 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 line-clamp-2 mb-2">
                          {category.description}
                        </p>
                      )}
                      {category.sizes && (
                        <p className="text-sm text-gray-500 mb-2">
                          {category.sizes.length} sizes
                        </p>
                      )}
                      <div className="mt-4 flex items-center text-primary-600 font-medium">
                        <span>View Category</span>
                        <svg
                          className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-xl">
                  No categories available in this collection yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // For collections without categories, show product listing with dynamic filters
  const hasActiveFilters = filters.size || filters.style;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/collections" className="hover:text-primary-600">
                Collections
              </Link>
              <span>/</span>
              <span className="text-gray-700">{collection.name}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">
                {collection.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Dynamic Filters */}
            <aside className="lg:col-span-1">
              <ProductFilters
                collectionSlug={collection.slug}
                onFiltersChange={handleFiltersChange}
                initialFilters={{
                  size: filters.size,
                  style: filters.style,
                }}
                showCollectionFilter={false}
              />
            </aside>

            {/* Mobile Filter Summary */}
            <div className="lg:hidden mb-6">
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {filters.size && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded">
                      Size: {filters.size}
                    </span>
                  )}
                  {filters.style && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded">
                      Style: {filters.style}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Sort & Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {totalProducts} products found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="createdAt">Newest</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>

              {/* Loading State */}
              {productsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-200 mb-3"></div>
                      <div className="h-4 bg-gray-200 mb-2"></div>
                      <div className="h-3 bg-gray-200 w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    No products found{hasActiveFilters ? " for these filters" : ""}.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => setFilters({
                        collection: "",
                        size: "",
                        style: "",
                      })}
                      className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <motion.div key={product.id} initial={false}>
                        <ProductCard product={product} priority={index < 3} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`px-4 py-2 border rounded ${
                            page === i + 1
                              ? "bg-primary-600 text-white border-primary-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
