"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerImages = [
    "/data/banner-1.jpeg",
    "/data/banner-2.jpeg",
    "/data/banner-3.jpeg",
  ];

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerImages.length]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Image Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={bannerImages[currentSlide]}
                alt={`Heritage banner ${currentSlide + 1}`}
                fill
                className="object-cover"
                priority={currentSlide === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white px-4"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-primary-300"
          >
            Since 1970s
          </motion.p>
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6">
            Kalash Heritage
          </h1>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/about"
              className="bg-white text-gray-900 px-8 py-4 rounded-none font-semibold hover:bg-gray-100 transition-colors"
            >
              Discover Our Heritage
            </Link>
            <Link
              href="/collections"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-none font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              View Collections
            </Link>
          </div>
        </motion.div>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Heritage Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              A Legacy Three Generations Strong
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From traditional workshops in the 1970s to a globally trusted name
              today—our story is one of dedication, authenticity, and family.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {[
              {
                era: "1970s",
                generation: "First Generation",
                description:
                  "Laid the foundation of our craft, establishing a tradition of weaving rugs with cultural depth and timeless elegance.",
              },
              {
                era: "1990s-2000s",
                generation: "Second Generation",
                description:
                  "Carried the vision forward under Tribal Creation, building a reputation for excellence and trust in the carpet industry.",
              },
              {
                era: "Today",
                generation: "Third Generation",
                description:
                  "Continuing the legacy, blending heritage with modern presentation to showcase our family's craft to the world.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.era}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center mb-6">
                  <div className="inline-block bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                    {item.era}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    {item.generation}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-center">
                  {item.description}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 w-12 h-0.5 bg-primary-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Our Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection of handmade rugs, each telling its
            own story of heritage and artistry.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Oriental Classics",
              description:
                "Traditional designs from centuries of craftsmanship",
            },
            {
              title: "Modern Collection",
              description: "Contemporary patterns for modern spaces",
            },
            {
              title: "Vintage Kilims",
              description: "Authentic vintage pieces with unique character",
            },
          ].map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] bg-gray-200 mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
                {collection.title}
              </h3>
              <p className="text-gray-600 mb-4">{collection.description}</p>
              <Link
                href="/shop"
                className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center gap-2"
              >
                View Collection
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Craftsmanship Behind the Scenes */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              The Art of Handweaving
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each rug is a labor of love, created through a meticulous process
              that honors centuries-old techniques passed down through
              generations of artisans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                image:
                  "/data/process/MANUFACTURING PROCESS/Wool Sorting & Cleaning/A (1).jpeg",
                title: "Wool Selection",
                description: "Carefully sorting premium quality wool",
              },
              {
                image: "/data/dyeing.jpeg",
                title: "Natural Dyeing",
                description: "Using traditional natural dye methods",
              },
              {
                image:
                  "/data/process/MANUFACTURING PROCESS/Handweaving process/A  (3).jpeg",
                title: "Hand Weaving",
                description: "Artisans weaving intricate patterns by hand",
              },
              {
                image: "/data/finishing.jpeg",
                title: "Finishing",
                description: "Final touches ensure lasting quality",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="aspect-square bg-gray-200 mb-4 overflow-hidden rounded-lg relative">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/knowledge-hub"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-none font-semibold hover:bg-primary-700 transition-colors"
            >
              Learn More About Our Process
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trusted Partners */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 md:order-1"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                <Image
                  src="/data/process/MANUFACTURING PROCESS/Natural Drying of Dyed Wools/A.jpeg"
                  alt="Natural dyed wool drying"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-300 mt-8 rounded-lg overflow-hidden relative">
                <Image
                  src="/data/WhatsApp Image 2025-12-26 at 15.28.23.jpeg"
                  alt="Handwoven rug detail"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-300 -mt-8 rounded-lg overflow-hidden relative">
                <Image
                  src="/data/WhatsApp Image 2025-12-26 at 15.28.24 (1).jpeg"
                  alt="Oriental rug craftsmanship"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                <Image
                  src="/data/WhatsApp Image 2025-12-26 at 15.27.20.jpeg"
                  alt="Traditional rug washing"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Sustainability & Ethics
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Our commitment to the environment and artisan communities runs
              deep. Every rug we create honors both nature and the skilled hands
              that craft it.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Natural & Organic Materials
                  </p>
                  <p className="text-gray-600">
                    100% natural wool and cotton, dyed with plant-based and
                    mineral dyes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Fair Trade & Ethical Labor
                  </p>
                  <p className="text-gray-600">
                    Fair wages and safe working conditions for all our artisans
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Zero-Waste Traditional Methods
                  </p>
                  <p className="text-gray-600">
                    Hand-weaving techniques that minimize environmental impact
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Heritage Preservation
                  </p>
                  <p className="text-gray-600">
                    Supporting local communities and preserving traditional
                    craftsmanship
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/about"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-none font-semibold hover:bg-primary-700 transition-colors"
            >
              Learn More About Our Values
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Explore Our Heritage Collection
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Each rug is more than a product—it's a cultural artifact,
              handwoven with techniques passed through three generations.
              Discover pieces that tell stories of tradition, craftsmanship, and
              timeless beauty.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/collections"
                className="inline-block bg-white text-primary-800 px-10 py-4 rounded-none font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                View Collections
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-transparent border-2 border-white text-white px-10 py-4 rounded-none font-semibold text-lg hover:bg-white hover:text-primary-800 transition-colors"
              >
                Connect With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
