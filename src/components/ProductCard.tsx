"use client";

import Link from "next/link";
import Image from "next/image";
import { useInquiryStore } from "@/store/inquiryStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    images: string[];
    size?: string;
    material?: string;
    color?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useInquiryStore((state) => state.addItem);

  const handleAddToInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      slug: product.slug,
      sku: product.sku,
    });
    toast.success("Added to inquiry list");
  };

  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="aspect-[4/5] bg-gray-100 mb-4 overflow-hidden relative">
        <Image
          src={product.images[0] || "/placeholder-rug.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToInquiry}
            className="bg-white text-gray-900 px-4 py-2 text-sm font-semibold hover:bg-gray-100 border border-gray-300"
            title="Add to inquiry list"
          >
            Add to Inquiry
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-primary-600 font-medium mb-2">
          Contact for pricing
        </p>

        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {product.size && <span>{product.size}</span>}
          {product.material && <span>• {product.material}</span>}
        </div>
      </div>
    </Link>
  );
}
