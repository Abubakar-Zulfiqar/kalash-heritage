"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { CurrencyService } from "@/services/currency/CurrencyService";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import ShippingForm from "@/components/checkout/ShippingForm";
import OrderReview from "@/components/checkout/OrderReview";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice } = useCartStore();
  const { step, shippingOption } = useCheckoutStore();
  const { currency } = useCurrencyStore();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const subtotal = getTotalPrice();
  const shippingCost = shippingOption?.cost || 0;
  const total = subtotal + shippingCost;

  const convertedSubtotal = CurrencyService.convert(subtotal, "USD", currency);
  const convertedShipping = CurrencyService.convert(shippingCost, "USD", currency);
  const convertedTotal = CurrencyService.convert(total, "USD", currency);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="relative inline-block h-10 w-32">
            <Image
              src="/kalaash-heritage-logo.png"
              alt="Kalash Heritage"
              fill
              className="object-contain"
            />
          </Link>
        </div>

        <CheckoutSteps currentStep={step} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" && <ShippingForm />}
            {step === "review" && <OrderReview />}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder-rug.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {CurrencyService.formatPrice(
                          CurrencyService.convert(item.price, "USD", currency),
                          currency
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{CurrencyService.formatPrice(convertedSubtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shippingOption
                      ? CurrencyService.formatPrice(convertedShipping, currency)
                      : "Calculated at next step"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{CurrencyService.formatPrice(convertedTotal, currency)}</span>
                </div>
              </div>

              {shippingOption && (
                <p className="text-xs text-gray-500 mt-4">
                  Estimated delivery: {shippingOption.estimatedDays}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
