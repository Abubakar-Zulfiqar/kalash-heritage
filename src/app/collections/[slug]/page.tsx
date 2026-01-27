"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";

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
  price: number;
  salePrice?: number;
  images: string[];
  size?: string;
  material?: string;
  color?: string;
  dimensions?: string;
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");

  // Fetch collection
  useEffect(() => {
    fetch(`/api/collections/${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFoundState(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCollection(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching collection:", error);
        setLoading(false);
      });
  }, [slug]);

  // Fetch products for collections without categories
  useEffect(() => {
    if (!collection || collection.hasCategories) return;

    setProductsLoading(true);
    // Use collection.slug from API response
    // Decode any URL-encoded characters before passing to URLSearchParams (to avoid double-encoding)
    const collectionSlug = decodeURIComponent(collection.slug);
    const params = new URLSearchParams({
      collection: collectionSlug,
      page: page.toString(),
      limit: "12",
      sortBy,
      sortOrder: "DESC",
    });

    if (selectedSize) {
      params.append("size", selectedSize);
    }

    fetch(`/api/products?${params}`)
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
  }, [collection, selectedSize, page, sortBy]);

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 w-1/4 mb-4"></div>
              <div className="h-12 bg-gray-200 w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-200 w-3/4"></div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

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
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
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

  // For collections without categories, show product listing with size filters
  const sizes = collection.sizes || [];

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
          <div className="flex gap-8">
            {/* Left Sidebar - Size Filters */}
            <aside className="w-48 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Size
                  </h2>
                  {selectedSize && (
                    <button
                      onClick={() => {
                        setSelectedSize("");
                        setPage(1);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => {
                          setSelectedSize("");
                          setPage(1);
                        }}
                        className={`text-sm transition-colors ${
                          selectedSize === ""
                            ? "text-gray-900 font-medium"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        All Sizes
                      </button>
                    </li>
                    {sizes.map((size) => (
                      <li key={size.id}>
                        <button
                          onClick={() => {
                            setSelectedSize(size.slug);
                            setPage(1);
                          }}
                          className={`text-sm transition-colors ${
                            selectedSize === size.slug
                              ? "text-gray-900 font-medium"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          {size.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Mobile Size Filter */}
            <div className="lg:hidden mb-6 w-full">
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.slug}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
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
                    No products found{selectedSize ? " for this size" : ""}.
                  </p>
                  {selectedSize && (
                    <button
                      onClick={() => setSelectedSize("")}
                      className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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
      </section>
    </div>
  );
}
