"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 text-center text-white px-4"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Generations of craftsmanship woven into every thread
          </p>
        </motion.div>
      </section>

      {/* Heritage Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
              Heritage of Excellence
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                For generations, the art of carpet weaving has been passed down through our family,
                from skilled hands to eager apprentices. What began in the traditional workshops
                of Pakistan has evolved into Kalash Heritage, a name trusted by collectors and
                dealers worldwide.
              </p>
              <p>
                Our journey represents more than just business—it's a commitment to preserving
                an ancient craft while meeting the demands of modern aesthetics. Each rug that
                leaves our factory carries with it centuries of tradition, innovation, and
                unwavering dedication to quality.
              </p>
              <p>
                Based in Lahore, Pakistan, with our head office in Dubai, we've built bridges
                between traditional artisans and global markets, ensuring that this beautiful
                heritage continues to flourish in homes around the world.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden"></div>
            <div className="aspect-square bg-gray-300 rounded-lg overflow-hidden mt-8"></div>
            <div className="aspect-square bg-gray-300 rounded-lg overflow-hidden -mt-8"></div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden"></div>
          </motion.div>
        </div>
      </section>

      {/* Craftsmanship Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Craftsmanship
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every rug is a masterpiece, created through a meticulous process that honors
              tradition while embracing quality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Design & Planning",
                description:
                  "Our master designers create patterns that blend traditional motifs with contemporary aesthetics.",
              },
              {
                step: "02",
                title: "Material Selection",
                description:
                  "We source only the finest wool, silk, and cotton, ensuring premium quality in every fiber.",
              },
              {
                step: "03",
                title: "Hand Weaving",
                description:
                  "Skilled artisans spend weeks or months hand-knotting each rug with precision and care.",
              },
              {
                step: "04",
                title: "Quality Control",
                description:
                  "Rigorous inspection ensures every piece meets our exacting standards before shipment.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-serif font-bold text-primary-300 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Our Values
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: "Authenticity",
              description:
                "Every rug is 100% handmade, preserving traditional techniques passed down through generations.",
            },
            {
              title: "Quality",
              description:
                "We never compromise on materials or craftsmanship, ensuring each piece is a lasting investment.",
            },
            {
              title: "Trust",
              description:
                "Transparency in our process and pricing builds lasting relationships with our customers worldwide.",
            },
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-lg"
            >
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                {value.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Factory & Team */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif font-bold mb-6">
                Our Manufacturing Excellence
              </h2>
              <p className="text-lg text-primary-100 mb-6 leading-relaxed">
                Our state-of-the-art facility in Lahore, Pakistan combines traditional
                craftsmanship with modern quality control. Here, over 200 skilled artisans
                work daily, creating rugs that will be treasured for generations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary-300 flex-shrink-0 mt-1"
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
                  <div>
                    <strong className="text-white">200+ Skilled Artisans</strong>
                    <p className="text-primary-200">Master weavers and craftspeople</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary-300 flex-shrink-0 mt-1"
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
                  <div>
                    <strong className="text-white">Global Reach</strong>
                    <p className="text-primary-200">
                      Exporting to 30+ countries worldwide
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary-300 flex-shrink-0 mt-1"
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
                  <div>
                    <strong className="text-white">Sustainable Practices</strong>
                    <p className="text-primary-200">
                      Eco-friendly materials and processes
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-video bg-primary-900 rounded-lg overflow-hidden"
            >
              {/* Placeholder for factory image */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
            Let's Create Something Beautiful Together
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you're a collector, dealer, or interior designer, we'd love to
            discuss how our handmade rugs can enhance your space or business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary-600 text-white px-8 py-4 rounded font-semibold hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/shop"
              className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-4 rounded font-semibold hover:bg-primary-50 transition-colors"
            >
              View Collection
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
