"use client";

import { useInquiryStore } from "@/store/inquiryStore";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function InquiryListPage() {
  const { items, removeItem, updateQuantity, clearInquiry, getTotalItems } = useInquiryStore();

  const handleClearList = () => {
    if (confirm("Are you sure you want to clear your inquiry list?")) {
      clearInquiry();
      toast.success("Inquiry list cleared");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Your Inquiry List is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Browse our collection and add products you're interested in to your inquiry list.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            My Inquiry List
          </h1>
          <p className="text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your inquiry list
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inquiry Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-6 flex gap-4">
                      <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={item.image || "/placeholder-rug.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.sku && (
                          <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-3 flex md:justify-center items-center">
                      <span className="md:hidden font-semibold mr-2">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300 font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex md:justify-end items-center">
                      <button
                        onClick={() => {
                          removeItem(item.productId);
                          toast.success("Removed from inquiry list");
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Clear List Button */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={handleClearList}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Inquiry List
                </button>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Continue Browsing
              </Link>
            </div>
          </div>

          {/* Submit Inquiry Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">
                Ready to Inquire?
              </h2>

              <p className="text-gray-600 mb-6">
                Submit your inquiry list and our team will contact you with wholesale pricing and availability.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Total Products</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Total Pieces</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-primary-600 text-white text-center py-4 rounded font-semibold hover:bg-primary-700 transition-colors mb-4"
              >
                Submit Inquiry
              </Link>

              <p className="text-xs text-gray-600 text-center">
                Our team typically responds within 24-48 business hours.
              </p>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span>Wholesale pricing available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span>Worldwide shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span>Custom orders welcome</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
