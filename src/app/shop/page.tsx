"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
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

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Read URL params
  const collectionFromUrl = searchParams.get("collection") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const sizeFromUrl = searchParams.get("size") || "";

  // Filters
  const [selectedCollection, setSelectedCollection] = useState(collectionFromUrl);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync URL params to state
  useEffect(() => {
    setSelectedCollection(collectionFromUrl);
  }, [collectionFromUrl]);

  // Fetch collections for filter
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

    if (selectedCollection) params.append("collection", selectedCollection);
    if (categoryFromUrl) params.append("category", categoryFromUrl);
    if (sizeFromUrl) params.append("size", sizeFromUrl);
    if (selectedColor) params.append("color", selectedColor);
    if (selectedStyle) params.append("style", selectedStyle);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProducts(data.data);
          setTotalPages(data.totalPages);
        } else {
          setProducts([]);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalPages(1);
        setLoading(false);
      });
  }, [page, selectedCollection, categoryFromUrl, sizeFromUrl, selectedColor, selectedStyle, sortBy, minPrice, maxPrice]);

  const colors = ["Red", "Blue", "Grey", "Burgundy", "Navy", "Teal", "Black", "Multi"];
  const styles = ["Oriental", "Modern", "Vintage", "Persian"];

  const resetFilters = () => {
    setSelectedCollection("");
    setSelectedColor("");
    setSelectedStyle("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    // Clear URL params by navigating to /shop
    window.history.pushState({}, "", "/shop");
  };

  // Get active filter context for breadcrumb display
  const getFilterContext = () => {
    const parts: { label: string; href: string }[] = [{ label: "Shop", href: "/shop" }];

    if (collectionFromUrl) {
      const collection = collections.find(c => c.slug === collectionFromUrl);
      if (collection) {
        parts.push({ label: collection.name, href: `/collections/${collection.slug}` });
      }
    }
    if (categoryFromUrl) {
      parts.push({ label: categoryFromUrl.replace(/-/g, " "), href: "#" });
    }
    if (sizeFromUrl) {
      parts.push({ label: sizeFromUrl.replace(/-/g, " "), href: "#" });
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
            {collectionFromUrl
              ? collections.find(c => c.slug === collectionFromUrl)?.name || "Shop"
              : "Our Collection"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of handmade rugs, each piece a testament to centuries of craftsmanship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Reset
                </button>
              </div>

              {/* Collection Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Collection</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="collection"
                      value=""
                      checked={selectedCollection === ""}
                      onChange={(e) => {
                        setSelectedCollection(e.target.value);
                        setPage(1);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                  {collections.map((col) => (
                    <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value={col.slug}
                        checked={selectedCollection === col.slug}
                        onChange={(e) => {
                          setSelectedCollection(e.target.value);
                          setPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value=""
                      checked={selectedColor === ""}
                      onChange={(e) => {
                        setSelectedColor(e.target.value);
                        setPage(1);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                  {colors.map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        checked={selectedColor === color}
                        onChange={(e) => {
                          setSelectedColor(e.target.value);
                          setPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Style Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Style</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="style"
                      value=""
                      checked={selectedStyle === ""}
                      onChange={(e) => {
                        setSelectedStyle(e.target.value);
                        setPage(1);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                  {styles.map((style) => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="style"
                        value={style}
                        checked={selectedStyle === style}
                        onChange={(e) => {
                          setSelectedStyle(e.target.value);
                          setPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {!loading && `${products.length} products found`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
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
                <button
                  onClick={resetFilters}
                  className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
                >
                  Clear all filters
                </button>
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
