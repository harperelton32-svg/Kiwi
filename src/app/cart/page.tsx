"use client";

import { useState, useEffect } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import MobileNavbar from "@/components/MobileNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, updateItem } = useCart();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [availableColors, setAvailableColors] = useState<{name: string, class: string}[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [storeSettings, setStoreSettings] = useState({ shippingCharge: 0, taxRate: 10 });

  const sizes = ['S', 'M', 'L', 'XL'];

  useEffect(() => {
    fetchSettings();
    if (editingItem) {
      setSelectedColor(editingItem.color || "");
      setSelectedSize(editingItem.size || "");
      fetchProductOptions(editingItem.id);
    }
  }, [editingItem]);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json() as { shippingCharge: number; taxRate: number; };
      setStoreSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }

  async function fetchProductOptions(id: string) {
    try {
      const response = await fetch('/api/products');
      const products = await response.json() as any[];
      const product = products.find((p: any) => p.id.toString() === id.toString());
      
      if (product && product.colors && product.colors.length > 0) {
        setAvailableColors(product.colors);
      } else {
        // Use default presets if product doesn't exist or has no specific colors
        setAvailableColors([
          { name: 'Midnight Black', class: 'bg-black' },
          { name: 'Cotton White', class: 'bg-white border border-gray-200' },
          { name: 'Royal Indigo', class: 'bg-indigo-600' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch product options:', error);
      // Fallback on error
      setAvailableColors([
        { name: 'Midnight Black', class: 'bg-black' },
        { name: 'Cotton White', class: 'bg-white border border-gray-200' },
        { name: 'Royal Indigo', class: 'bg-indigo-600' }
      ]);
    }
  }

  const handleUpdateVariation = () => {
    if (editingItem && selectedColor && selectedSize) {
      updateItem(editingItem.id, editingItem.color, editingItem.size, selectedColor, selectedSize);
      setEditingItem(null);
    }
  };

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
                {items.map((item) => {
                  const itemKey = `${item.id}-${item.color}-${item.size}`;
                  return (
                    <div
                      key={itemKey}
                      className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white shadow-sm"
                    >
                      <div className="flex gap-4 flex-1">
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
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.color && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                                Size {item.size}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 font-semibold">Rs. {item.price.toFixed(2)}</p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <p className="font-bold text-xl text-indigo-600">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id, item.color, item.size)}
                            className="text-red-600 hover:text-red-800 transition-colors text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary */}
            <div>
              <div className="bg-gray-50 p-6 rounded-2xl sticky top-20 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs. {getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${storeSettings.shippingCharge === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {storeSettings.shippingCharge === 0 ? 'Free' : `Rs. ${storeSettings.shippingCharge.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({storeSettings.taxRate}%)</span>
                    <span className="font-medium">
                      Rs. {(getTotal() * (storeSettings.taxRate / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>Total</span>
                  <span>Rs. {(getTotal() * (1 + storeSettings.taxRate / 100) + storeSettings.shippingCharge).toFixed(2)}</span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Items in cart: <strong>{items.length}</strong>
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all text-center mb-3 shadow-lg active:scale-95 transform"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full bg-white border border-black text-black py-4 rounded-xl font-bold hover:bg-gray-50 transition-all text-center active:scale-95 transform"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {editingItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingItem(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Edit Selection</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Color</h3>
                  <div className="flex gap-4">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 ${color.class} ${
                          selectedColor === color.name ? 'ring-4 ring-indigo-200 ring-offset-2' : ''
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Size</h3>
                  <div className="flex gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${
                          selectedSize === size
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateVariation}
                    className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}