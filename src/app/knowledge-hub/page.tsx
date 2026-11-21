"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function KnowledgeHubPage() {
  const processes = [
    {
      title: "Wool Selection & Cleaning",
      description:
        "The journey begins with carefully selecting premium wool. Our artisans meticulously sort and clean the raw wool, removing impurities to ensure only the finest quality fibers are used in our rugs.",
      image:
        "/data/process/MANUFACTURING PROCESS/Wool Sorting and Cleaning/A (1).jpeg",
    },
    {
      title: "Natural Dyeing",
      description:
        "Using traditional methods passed down through generations, we dye wool with natural pigments. This time-honored technique creates rich, lasting colors that age beautifully and are environmentally sustainable.",
      image: "/data/dyeing.jpeg",
    },
    {
      title: "Sun Drying",
      description:
        "Freshly dyed wool is hung under the open sky, drying naturally in the sunlight. This traditional method preserves the vibrancy of natural dyes while allowing the fibers to set organically.",
      image:
        "/data/process/MANUFACTURING PROCESS/Natural Drying of Dyed Wools/A.jpeg",
    },
    {
      title: "Loom Preparation",
      description:
        "Before weaving begins, our master weavers carefully prepare the loom, setting up the warp threads with precision. This crucial step determines the rug's foundation and requires years of expertise.",
      image:
        "/data/process/MANUFACTURING PROCESS/pre weaving preperation/A (1).jpeg",
    },
    {
      title: "Hand Weaving",
      description:
        "The heart of our craft—skilled artisans hand-knot each thread, creating intricate patterns one knot at a time. A single rug can take weeks or months to complete, depending on its size and complexity.",
      image: "/data/process/MANUFACTURING PROCESS/Handweaving process/A.jpeg",
    },
    {
      title: "Traditional Washing",
      description:
        "Once woven, rugs undergo a traditional washing process to clean the fibers, soften the texture, and enhance the natural luster of the wool. This step brings out the true beauty of the handwork.",
      image: "/data/washing.jpeg",
    },
    {
      title: "Precision Shearing",
      description:
        "Expert craftspeople carefully shear the rug pile to achieve uniform height and smooth texture. This delicate process requires a steady hand and years of experience.",
      image: "/data/process/MANUFACTURING PROCESS/Shearing Process/A (1).jpeg",
    },
    {
      title: "Final Finishing",
      description:
        "In the final stage, artisans inspect every inch, trim loose threads, and apply finishing touches. Each rug is examined to ensure it meets our three-generation standard of excellence.",
      image: "/data/finishing.jpeg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="/data/process/MANUFACTURING PROCESS/Handweaving process/A  (3).jpeg"
            alt="Traditional handweaving"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white px-4"
        >
          <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-primary-300">
            Educational Series
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            The Art of
            <br />
            Rug Making
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto text-gray-200">
            Discover the centuries-old craft behind every handwoven masterpiece
          </p>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            A Journey Through Time & Tradition
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            For over five decades, the art of handwoven rugs has been preserved
            through our family—from Jora Ersari in the 1970s to today's third
            generation. Each rug represents not just months of meticulous work,
            but centuries of cultural knowledge passed through skilled hands.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            What you see as a finished rug is the culmination of countless hours
            of craftsmanship, rooted in Pakistan and Afghan weaving traditions
            that honor authenticity, patience, and artistic excellence.
          </p>
        </motion.div>
      </section>

      {/* Manufacturing Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              The Manufacturing Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From raw wool to finished masterpiece, every step requires skill,
              patience, and devotion to traditional techniques.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-20">
            {processes.map((process, index) => (
              <motion.div
                key={process.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={`${index % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden relative shadow-lg">
                    <Image
                      src={process.image}
                      alt={process.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="inline-block bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                    Step {index + 1}
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                    {process.title}
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {process.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Heritage Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Pakistan & Afghan Heritage
              </h2>
              <p className="text-xl text-primary-100 leading-relaxed">
                Our rugs embody the rich weaving traditions of Pakistan and
                Afghanistan—regions where carpet making has been elevated to an
                art form for centuries.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-primary-700 p-8 rounded-lg">
                <h3 className="text-2xl font-serif font-bold mb-4">
                  Regional Techniques
                </h3>
                <p className="text-primary-100 leading-relaxed">
                  Each region has its own distinctive weaving style—from the
                  intricate Persian-influenced patterns of Pakistan to the bold
                  geometric designs of Afghan tribal rugs. Our artisans master
                  these regional variations, preserving authenticity in every
                  piece.
                </p>
              </div>

              <div className="bg-primary-700 p-8 rounded-lg">
                <h3 className="text-2xl font-serif font-bold mb-4">
                  Cultural Significance
                </h3>
                <p className="text-primary-100 leading-relaxed">
                  In both Pakistani and Afghani cultures, rugs are more than
                  floor coverings—they're symbols of hospitality, family
                  heritage, and artistic expression. Each pattern carries
                  meaning, often telling stories of tribal identity and
                  historical events.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
            Explore Our Heritage Collection
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Now that you understand the artistry behind each piece, we invite
            you to view our collections and discover rugs that speak to your
            appreciation for cultural heritage and craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collections"
              className="bg-primary-600 text-white px-8 py-4 rounded font-semibold hover:bg-primary-700 transition-colors"
            >
              View Collections
            </Link>
            <Link
              href="/about"
              className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-4 rounded font-semibold hover:bg-primary-50 transition-colors"
            >
              Our Story
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
