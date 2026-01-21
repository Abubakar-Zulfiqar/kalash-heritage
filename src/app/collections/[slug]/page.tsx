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
  description?: string;
  image?: string;
  hasCategories: boolean;
  categories?: Category[];
  sizes?: Size[];
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

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

  const items = collection.hasCategories ? collection.categories || [] : collection.sizes || [];
  const itemType = collection.hasCategories ? "category" : "size";

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

      {/* Items Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {collection.hasCategories ? "Categories" : "Available Sizes"}
            </h2>
            <p className="text-gray-600 mt-1">
              {collection.hasCategories
                ? `Browse ${items.length} categories in this collection`
                : `Browse ${items.length} sizes in this collection`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={
                    collection.hasCategories
                      ? `/collections/${collection.slug}/${item.slug}`
                      : `/shop?collection=${collection.slug}&size=${item.slug}`
                  }
                  className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
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
                          {collection.hasCategories ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          )}
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    {collection.hasCategories && (item as Category).sizes && (
                      <p className="text-sm text-gray-500 mb-2">
                        {(item as Category).sizes?.length || 0} sizes
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-primary-600 font-medium">
                      <span>
                        {collection.hasCategories ? `View ${itemType}` : "Browse Products"}
                      </span>
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

          {items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">
                No {collection.hasCategories ? "categories" : "sizes"} available in this collection yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
