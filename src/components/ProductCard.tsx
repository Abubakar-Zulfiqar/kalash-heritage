"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrencyStore } from "@/store/currencyStore";
import { CurrencyService } from "@/services/currency/CurrencyService";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    images: string[];
    size?: string;
    material?: string;
    color?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { currency } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);

  const displayPrice = product.salePrice || product.price;
  const convertedPrice = CurrencyService.convert(displayPrice, "USD", currency);
  const formattedPrice = CurrencyService.formatPrice(convertedPrice, currency);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image: product.images[0],
      slug: product.slug,
    });
    toast.success("Added to cart!");
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
        {product.salePrice && (
          <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1 text-sm font-semibold">
            SALE
          </div>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-6 py-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
        >
          Add to Cart
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-accent-600">
                {formattedPrice}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {CurrencyService.formatPrice(
                  CurrencyService.convert(product.price, "USD", currency),
                  currency
                )}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {product.size && <span>{product.size}</span>}
          {product.material && <span>• {product.material}</span>}
        </div>
      </div>
    </Link>
  );
}
