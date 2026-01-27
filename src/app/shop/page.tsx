"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  size?: string;
  material?: string;
  color?: string;
  style?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface SelectedFilters {
  collection: string;
  size: string;
  color: string;
  style: string;
  material: string;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");

  // Read URL params
  const collectionFromUrl = searchParams.get("collection") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const sizeFromUrl = searchParams.get("size") || "";

  // Filters state
  const [filters, setFilters] = useState<SelectedFilters>({
    collection: collectionFromUrl,
    size: sizeFromUrl,
    color: "",
    style: "",
    material: "",
  });

  // Sync URL params to state
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      collection: collectionFromUrl,
      size: sizeFromUrl,
    }));
  }, [collectionFromUrl, sizeFromUrl]);

  // Fetch collections for breadcrumb display
  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(data);
        } else {
          setCollections([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching collections:", error);
        setCollections([]);
      });
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      sortBy,
      sortOrder: "DESC",
    });

    if (filters.collection) params.append("collection", filters.collection);
    if (categoryFromUrl) params.append("category", categoryFromUrl);
    if (filters.size) params.append("size", filters.size);
    if (filters.color) params.append("color", filters.color);
    if (filters.style) params.append("style", filters.style);
    if (filters.material) params.append("material", filters.material);

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProducts(data.data);
          setTotalPages(data.totalPages);
          setTotalProducts(data.total);
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
        setLoading(false);
      });
  }, [page, filters, categoryFromUrl, sortBy]);

  // Handle filter changes from ProductFilters component
  const handleFiltersChange = useCallback((newFilters: SelectedFilters) => {
    setFilters(newFilters);
    setPage(1);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    if (newFilters.collection) {
      url.searchParams.set("collection", newFilters.collection);
    } else {
      url.searchParams.delete("collection");
    }
    if (newFilters.size) {
      url.searchParams.set("size", newFilters.size);
    } else {
      url.searchParams.delete("size");
    }
    window.history.pushState({}, "", url.pathname + url.search);
  }, []);

  // Check if any filter is active
  const hasActiveFilters = filters.collection || filters.color || filters.style || filters.material || filters.size || categoryFromUrl;

  // Get active filter context for breadcrumb display
  const getFilterContext = () => {
    const parts: { label: string; href: string }[] = [{ label: "Shop", href: "/shop" }];

    if (filters.collection) {
      const collection = collections.find(c => c.slug === filters.collection);
      if (collection) {
        parts.push({ label: collection.name, href: `/collections/${collection.slug}` });
      }
    }
    if (categoryFromUrl) {
      parts.push({ label: categoryFromUrl.replace(/-/g, " "), href: "#" });
    }
    if (filters.size) {
      parts.push({ label: filters.size.replace(/-/g, " "), href: "#" });
    }

    return parts;
  };

  const filterContext = getFilterContext();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb Context */}
        {filterContext.length > 1 && (
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-gray-600">
              {filterContext.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-gray-400">/</span>}
                  {index === filterContext.length - 1 ? (
                    <span className="text-gray-900 font-medium capitalize">{item.label}</span>
                  ) : (
                    <Link href={item.href} className="hover:text-primary-600 capitalize">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            {filters.collection
              ? collections.find(c => c.slug === filters.collection)?.name || "Shop"
              : "Our Collection"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of handmade rugs, each piece a testament to centuries of craftsmanship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - using reusable component */}
          <aside className="lg:col-span-1">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={{
                collection: filters.collection,
                size: filters.size,
                color: filters.color,
                style: filters.style,
                material: filters.material,
              }}
              showCollectionFilter={true}
            />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {!loading && `${totalProducts} products found`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Newest</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-gray-200 mb-4"></div>
                    <div className="h-4 bg-gray-200 mb-2"></div>
                    <div className="h-4 bg-gray-200 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No products found matching your criteria.</p>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setFilters({
                        collection: "",
                        size: "",
                        color: "",
                        style: "",
                        material: "",
                      });
                      setPage(1);
                      window.history.pushState({}, "", "/shop");
                    }}
                    className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
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
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
