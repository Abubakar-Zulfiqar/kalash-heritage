"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-900 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/data/banner-1.jpeg"
          alt="Kalash Heritage craftsmanship"
          fill
          className="object-cover"
          priority
        />
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
              Three Generations of Heritage
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  Our Origins
                </h3>
                <p>
                  In the 1970s, <strong>Jora Ersari</strong> laid the foundation
                  of a craft that would span generations—a tradition of weaving
                  rugs with cultural depth and timeless elegance.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  A Family Legacy
                </h3>
                <p>
                  His son, <strong>Mohammad Abdullah</strong>, carried this
                  vision forward under <em>Tribal Creation</em>, building a
                  reputation for excellence. Today, we—
                  <strong>Yunus Ersari</strong> and{" "}
                  <strong>Yusuf Ersari</strong>—continue as the third
                  generation, blending heritage with modern presentation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  Global Trust
                </h3>
                <p>
                  Our work has reached homes, galleries, and institutions
                  worldwide. We're honored to partner with{" "}
                  <strong>Coco Republic Australia</strong>,{" "}
                  <strong>Timothe Rugs</strong>, <strong>ABC Home</strong>, and
                  many others—partnerships that reflect the trust placed in our
                  heritage.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
              <Image
                src="/data/process/MANUFACTURING PROCESS/Handweaving process/A.jpeg"
                alt="Traditional handweaving process"
                fill
                className="object-cover"
              />
            </div>
            <div className="aspect-square bg-gray-300 rounded-lg overflow-hidden mt-8 relative">
              <Image
                src="/data/process/MANUFACTURING PROCESS/Natural Drying of Dyed Wools/A.jpeg"
                alt="Natural dyed wools drying in sunlight"
                fill
                className="object-cover"
              />
            </div>
            <div className="aspect-square bg-gray-300 rounded-lg overflow-hidden -mt-8 relative">
              <Image
                src="/data/process/MANUFACTURING PROCESS/Wool Dying/A.jpeg"
                alt="Traditional wool dyeing process"
                fill
                className="object-cover"
              />
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
              <Image
                src="/data/WhatsApp Image 2025-12-26 at 15.27.19.jpeg"
                alt="Artisans washing handwoven rugs"
                fill
                className="object-cover"
              />
            </div>
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
              Every rug is a masterpiece, created through a meticulous process
              that honors tradition while embracing quality.
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
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
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Kalash Heritage exists to preserve authenticity and build trust—not
            driven by profit, but by a commitment to cultural heritage and
            craftsmanship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "Preserve",
              description:
                "The art of handwoven rugs and kilims for future generations",
            },
            {
              title: "Celebrate",
              description: "The artisans and their timeless techniques",
            },
            {
              title: "Build Trust",
              description:
                "Through transparency, heritage, and quality in every piece",
            },
            {
              title: "Inspire",
              description:
                "Through cultural storytelling—rugs as artifacts of history and lifestyle",
            },
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-lg text-center"
            >
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center max-w-3xl mx-auto"
        >
          <p className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-primary-600 pl-6">
            "Every rug is more than a product—it is a piece of heritage. Our
            values of integrity, craftsmanship, and cultural respect guide us
            beyond commerce, ensuring that Kalash Heritage remains a showcase of
            trust and tradition."
          </p>
        </motion.div>
      </section>

      {/* Craftsmanship Showcase */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-serif font-bold mb-4">
              Authentic Pakistani & Afghani Craftsmanship
            </h2>
            <p className="text-lg text-primary-100 max-w-3xl mx-auto">
              Rooted in the rich weaving traditions of Pakistan and Afghanistan,
              our artisans carry forward centuries of expertise—honoring
              regional techniques while creating timeless pieces for the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="aspect-[4/5] bg-primary-900 rounded-lg overflow-hidden relative"
            >
              <Image
                src="/data/about-1.jpeg"
                alt="Artisan handwashing traditional rugs"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="aspect-[4/5] bg-primary-900 rounded-lg overflow-hidden relative"
            >
              <Image
                src="/data/about-2.jpeg"
                alt="Handwoven oriental rug"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="aspect-[4/5] bg-primary-900 rounded-lg overflow-hidden relative"
            >
              <Image
                src="/data/about-3.jpeg"
                alt="Traditional weaving techniques"
                fill
                className="object-cover"
              />
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
            Whether you're a collector, dealer, or interior designer, we'd love
            to discuss how our handmade rugs can enhance your space or business.
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
