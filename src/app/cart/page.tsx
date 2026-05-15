"use client";

import { useCart } from "@/context/CartContext";
import MobileNavbar from "@/components/MobileNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <>
        <MobileNavbar />
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
            <p className="text-lg text-gray-600 mb-8">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MobileNavbar />
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    {/* Small Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-600 mb-3">${item.price.toFixed(2)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right flex flex-col justify-between">
                      <p className="font-semibold text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div>
              <div className="bg-gray-50 p-6 rounded-lg sticky top-20">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (Est.)</span>
                    <span className="font-medium">
                      ${(getTotal() * 0.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>Total</span>
                  <span>${(getTotal() * 1.1).toFixed(2)}</span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Items in cart: <strong>{items.length}</strong>
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center mb-3"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full bg-white border border-black text-black py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}