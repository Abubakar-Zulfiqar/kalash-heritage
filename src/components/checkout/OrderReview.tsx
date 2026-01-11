"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { CurrencyService } from "@/services/currency/CurrencyService";
import toast from "react-hot-toast";

export default function OrderReview() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const {
    shippingAddress,
    shippingOption,
    createAccount,
    accountPassword,
    setStep,
    setOrderInfo,
    reset,
  } = useCheckoutStore();
  const { currency } = useCurrencyStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getTotalPrice();
  const shippingCost = shippingOption?.cost || 0;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !shippingOption) {
      toast.error("Please complete shipping information");
      setStep("shipping");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          shippingCost,
          currency: "USD",
          createAccount,
          accountPassword: createAccount ? accountPassword : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const { orderId, orderNumber, paymentUrl } = await response.json();

      setOrderInfo(orderId, orderNumber);

      if (paymentUrl) {
        // Redirect to Payoneer payment page
        window.location.href = paymentUrl;
      } else {
        // For now, go to success page (payment not configured)
        clearCart();
        reset();
        router.push(`/checkout/success?orderId=${orderId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertedSubtotal = CurrencyService.convert(subtotal, "USD", currency);
  const convertedShipping = CurrencyService.convert(shippingCost, "USD", currency);
  const convertedTotal = CurrencyService.convert(total, "USD", currency);

  return (
    <div className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
          <button
            onClick={() => setStep("shipping")}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Edit
          </button>
        </div>
        {shippingAddress && (
          <div className="text-gray-600">
            <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>
            <p>{shippingAddress.email}</p>
            {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
            <p className="mt-2">{shippingAddress.addressLine1}</p>
            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
            <p>
              {shippingAddress.city}
              {shippingAddress.state && `, ${shippingAddress.state}`}{" "}
              {shippingAddress.postalCode}
            </p>
            <p>{shippingAddress.country}</p>
          </div>
        )}
      </div>

      {/* Shipping Method */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>
        {shippingOption && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Standard Shipping ({shippingOption.region})
              </p>
              <p className="text-sm text-gray-500">
                Estimated delivery: {shippingOption.estimatedDays}
              </p>
            </div>
            <p className="font-medium text-gray-900">
              {CurrencyService.formatPrice(convertedShipping, currency)}
            </p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900">
                {CurrencyService.formatPrice(
                  CurrencyService.convert(item.price * item.quantity, "USD", currency),
                  currency
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{CurrencyService.formatPrice(convertedSubtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{CurrencyService.formatPrice(convertedShipping, currency)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>{CurrencyService.formatPrice(convertedTotal, currency)}</span>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("shipping")}
          className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
        >
          &larr; Back to Shipping
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Place Order & Pay"}
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        By placing your order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
