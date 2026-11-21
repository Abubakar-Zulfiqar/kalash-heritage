"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Size {
  id: string;
  name: string;
  slug: string;
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

export default function CollectionsClient({
  initialCollections,
}: {
  initialCollections: Collection[];
}) {
  // Loaded on the server and delivered with the HTML
  const collections = initialCollections;
  const loading = false;

  const getItemCount = (collection: Collection) => {
    if (collection.hasCategories && collection.categories) {
      return `${collection.categories.length} categories`;
    } else if (collection.sizes) {
      return `${collection.sizes.length} sizes`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="text-3xl tracking-[0.3em] uppercase mb-4 text-primary-600 font-semibold">
              Heritage Exhibition
            </h3>
          </motion.div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection, index) => (
                <motion.div key={collection.id} initial={false}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index < 3}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-32 h-32 text-primary-300 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-2">
                        {collection.description || `Explore our ${collection.name.toLowerCase()} collection`}
                      </p>
                      {getItemCount(collection) && (
                        <p className="text-sm text-gray-500 mb-2">{getItemCount(collection)}</p>
                      )}
                      <div className="mt-4 flex items-center text-primary-600 font-medium">
                        <span>View Collection</span>
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
          )}

          {!loading && collections.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">No collections available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
                Pakistani & Afghani Weaving Traditions
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Each collection represents centuries of cultural heritage passed through three generations of our family. Our artisans honor time-honored Pakistani and Afghani techniques, ensuring every rug is a unique testament to regional craftsmanship.
              </p>
              <p className="text-gray-700 leading-relaxed">
                From the intricate floral motifs of Persian-inspired carpets to the bold geometric patterns of traditional Afghani kilims, every collection preserves the distinct identity of its cultural origin—these are living artifacts of history.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src="/data/process/MANUFACTURING PROCESS/Handweaving process/A  (4).jpeg"
                alt="Traditional rug handweaving craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
              Interested in Learning More?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a collector, interior designer, or simply appreciate cultural heritage, we welcome inquiries about our pieces, their history, and the artisans behind them.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/knowledge-hub"
                className="inline-block bg-primary-600 text-white px-8 py-4 rounded hover:bg-primary-700 transition-colors font-medium text-lg"
              >
                Explore Our Craft
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-white border-2 border-primary-600 text-primary-600 px-8 py-4 rounded hover:bg-primary-50 transition-colors font-medium text-lg"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
