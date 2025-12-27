"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white px-4"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6">
            Timeless Elegance
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-2xl mx-auto">
            Handcrafted Oriental Rugs & Kilims
          </p>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-xl mx-auto">
            Exquisite craftsmanship woven into every thread. From our looms in Pakistan to your home.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-white text-gray-900 px-8 py-4 rounded-none font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Collection
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-none font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Our Story
            </Link>
          </div>
        </motion.div>
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
            Discover our curated selection of handmade rugs, each telling its own story of heritage and artistry.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Oriental Classics", description: "Traditional designs from centuries of craftsmanship" },
            { title: "Modern Collection", description: "Contemporary patterns for modern spaces" },
            { title: "Vintage Kilims", description: "Authentic vintage pieces with unique character" },
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Why Kalash Heritage?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building trust through quality, transparency, and generations of expertise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: "✨", title: "Authentic Craftsmanship", description: "100% handmade by skilled artisans" },
              { icon: "🌍", title: "Global Shipping", description: "We deliver worldwide with care" },
              { icon: "🏭", title: "Direct From Factory", description: "No middlemen, best prices guaranteed" },
              { icon: "🛡️", title: "Quality Guaranteed", description: "Rigorous quality control process" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Heritage of Excellence
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              For generations, our family has been weaving stories into carpets. Each piece represents not just a product, but a legacy of craftsmanship passed down through time.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              From our factory in Lahore, Pakistan, we export premium handmade rugs to customers worldwide. Our commitment to quality and authenticity has made us trusted partners for dealers and collectors globally.
            </p>
            <Link
              href="/about"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-none font-semibold hover:bg-primary-700 transition-colors"
            >
              Learn More About Us
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-square bg-gray-200" />
            <div className="aspect-square bg-gray-300 mt-8" />
            <div className="aspect-square bg-gray-300 -mt-8" />
            <div className="aspect-square bg-gray-200" />
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
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Explore our collection and find the perfect rug that speaks to your style and story.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-white text-primary-800 px-10 py-4 rounded-none font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Browse All Products
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
