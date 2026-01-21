"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";

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
}

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    fetch(`/api/collections/${slug}/${categorySlug}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFoundState(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCollection(data.collection);
          setCategory(data.category);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching category:", error);
        setLoading(false);
      });
  }, [slug, categorySlug]);

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

  if (!collection || !category) {
    return null;
  }

  const sizes = category.sizes || [];

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
              <Link href={`/collections/${collection.slug}`} className="hover:text-primary-600">
                {collection.name}
              </Link>
              <span>/</span>
              <span className="text-gray-700">{category.name}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                {category.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Sizes Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Available Sizes</h2>
            <p className="text-gray-600 mt-1">
              Browse {sizes.length} sizes in {category.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sizes.map((size, index) => (
              <motion.div
                key={size.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/shop?collection=${collection.slug}&category=${categorySlug}&size=${size.slug}`}
                  className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                    {size.image ? (
                      <Image
                        src={size.image}
                        alt={size.name}
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
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {size.name}
                    </h3>
                    {size.description && (
                      <p className="text-gray-600 line-clamp-2 mb-2">
                        {size.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-primary-600 font-medium">
                      <span>Browse Products</span>
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

          {sizes.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">
                No sizes available in this category yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
