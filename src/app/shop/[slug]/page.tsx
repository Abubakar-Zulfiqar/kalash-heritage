"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInquiryStore } from "@/store/inquiryStore";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  dimensions?: string;
  diameter?: string;
  material?: string;
  color?: string;
  colors?: string[];
  style?: string;
  origin?: string;
  pattern?: string;
  stock: number;
  sku: string;
  size?: {
    id: string;
    name: string;
    slug: string;
    category?: {
      id: string;
      name: string;
      slug: string;
      collection?: {
        id: string;
        name: string;
        slug: string;
      };
    };
    collection?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addItem = useInquiryStore((state) => state.addItem);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div>
              <div className="h-8 bg-gray-200 mb-4"></div>
              <div className="h-4 bg-gray-200 mb-2"></div>
              <div className="h-4 bg-gray-200 w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <Link
            href="/shop"
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToInquiry = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      slug: product.slug,
      sku: product.sku,
      quantity,
    });
    toast.success(`Added ${quantity} piece(s) to your inquiry list`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-gray-900">
            Collections
          </Link>
          {/* Collection (either from size.category.collection or size.collection) */}
          {(product.size?.category?.collection || product.size?.collection) && (
            <>
              <span>/</span>
              <Link
                href={`/collections/${(product.size?.category?.collection || product.size?.collection)?.slug}`}
                className="hover:text-gray-900"
              >
                {(product.size?.category?.collection || product.size?.collection)?.name}
              </Link>
            </>
          )}
          {/* Category (if exists) */}
          {product.size?.category && (
            <>
              <span>/</span>
              <Link
                href={`/collections/${product.size.category.collection?.slug}/${product.size.category.slug}`}
                className="hover:text-gray-900"
              >
                {product.size.category.name}
              </Link>
            </>
          )}
          {/* Size */}
          {product.size && (
            <>
              <span>/</span>
              <span className="text-gray-700">{product.size.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery with Slider */}
          <div className="relative">
            {/* Main Image Slider */}
            <div
              className="relative overflow-hidden touch-pan-y"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
              }}
              onTouchEnd={(e) => {
                const touchStartX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || "0");
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 50) {
                  if (diff > 0 && selectedImage < product.images.length - 1) {
                    setSelectedImage(selectedImage + 1);
                  } else if (diff < 0 && selectedImage > 0) {
                    setSelectedImage(selectedImage - 1);
                  }
                }
              }}
            >
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full"
                style={{ aspectRatio: '1/1' }}
              >
                <Image
                  src={product.images[selectedImage] || "/placeholder-rug.svg"}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>

              {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                    className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                    className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Dot Indicators */}
            {product.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      selectedImage === index
                        ? "bg-primary-600 w-6"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnails - Desktop only */}
            <div className="hidden md:grid grid-cols-5 gap-2 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder-rug.svg"}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Show collection name */}
            {(product.size?.category?.collection || product.size?.collection) && (
              <p className="text-sm text-primary-600 font-semibold mb-2">
                {(product.size?.category?.collection || product.size?.collection)?.name}
              </p>
            )}

            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Contact for Pricing */}
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <p className="text-xl font-semibold text-primary-700">
                Contact for Pricing
              </p>
              <p className="text-sm text-primary-600 mt-1">
                Add to your inquiry list or contact us directly for wholesale pricing
              </p>
            </div>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Product Specifications */}
            <div className="border-t border-b border-gray-200 py-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.size && (
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.size.name}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.dimensions}
                    </span>
                  </div>
                )}
                {product.diameter && (
                  <div>
                    <span className="text-gray-600">Diameter:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.diameter}
                    </span>
                  </div>
                )}
                {product.material && (
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.material}
                    </span>
                  </div>
                )}
                {product.style && (
                  <div>
                    <span className="text-gray-600">Style:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.style}</span>
                  </div>
                )}
                {product.pattern && (
                  <div>
                    <span className="text-gray-600">Pattern:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.pattern}</span>
                  </div>
                )}
                {product.origin && (
                  <div>
                    <span className="text-gray-600">Origin:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.origin}</span>
                  </div>
                )}
                {product.colors && product.colors.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Colors:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.colors.join(", ")}
                    </span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-600">SKU:</span>
                  <span className="ml-2 font-medium text-gray-900">{product.sku}</span>
                </div>
              </div>
            </div>

            {/* Inquiry Actions */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-semibold text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToInquiry}
                  className="flex-1 bg-primary-600 text-white py-4 rounded font-semibold text-lg hover:bg-primary-700 transition-colors"
                >
                  Add to Inquiry List
                </button>
                <Link
                  href="/contact"
                  className="flex-1 bg-white border-2 border-primary-600 text-primary-600 py-4 rounded font-semibold text-lg hover:bg-primary-50 transition-colors text-center flex items-center justify-center"
                >
                  Contact Us Directly
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Add products to your inquiry list and submit for wholesale pricing
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
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
                <span className="text-gray-700">100% Handmade</span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
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
                <span className="text-gray-700">Worldwide Shipping</span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
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
                <span className="text-gray-700">Quality Guaranteed</span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
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
                <span className="text-gray-700">Wholesale Available</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
