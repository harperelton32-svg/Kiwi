"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import MobileNavbar from "@/components/MobileNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeSettings, setStoreSettings] = useState({ shippingCharge: 0, taxRate: 10 });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json() as { shippingCharge: number; taxRate: number };
        setStoreSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    }
    fetchSettings();
  }, []);

  const totalTax = getTotal() * (storeSettings.taxRate / 100);
  const finalTotal = getTotal() + totalTax + storeSettings.shippingCharge;

  if (items.length === 0 && !orderPlaced) {
    return (
      <>
        <MobileNavbar />
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">Checkout</h1>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrderId = `KIWI-${Date.now()}`;
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newOrderId,
          customerDetails: formData,
          items: items,
          total: finalTotal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      setOrderId(newOrderId);
      setConfirmedTotal(finalTotal);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <>
        <MobileNavbar />
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
              <p className="text-lg text-gray-600 mb-2">Thank you for your order</p>
              <p className="text-2xl font-bold text-black mb-8">{orderId}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-blue-900 border-b border-blue-100 pb-2">Order Summary</h2>
              <div className="space-y-3 text-gray-700">
                <p className="flex justify-between">
                  <span className="font-medium">Name:</span> <span>{formData.fullName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Email:</span> <span>{formData.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Phone:</span> <span>{formData.phone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Delivery:</span> <span className="text-right">{formData.address}, {formData.city}, {formData.state}</span>
                </p>
                <div className="pt-4 border-t border-blue-200 mt-4">
                  <p className="flex justify-between text-xl">
                    <strong className="text-blue-900">Total Amount:</strong> 
                    <strong className="text-blue-900 font-black text-2xl">Rs. {confirmedTotal.toFixed(2)}</strong>
                  </p>
                </div>
                <p className="flex justify-between items-center mt-2">
                  <span className="font-medium">Payment:</span> 
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Cash on Delivery
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-3 text-yellow-900">COD Information</h3>
              <p className="text-gray-700">
                Your order will be delivered soon. Please have the exact amount ready at the time of
                delivery. No additional charges will be levied.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                A confirmation email has been sent to <strong>{formData.email}</strong>
              </p>
              <Link
                href="/shop"
                className="inline-block bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all transform active:scale-95 shadow-md"
              >
                Continue Shopping
              </Link>
            </div>
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
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Delivery Information</h2>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Province / State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-600">
                           <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <label className="ml-4 cursor-pointer flex-1">
                          <span className="font-bold text-green-900 text-lg">
                            Cash on Delivery (COD)
                          </span>
                          <p className="text-sm text-green-700 mt-1">
                            Pay securely with cash when your order arrives at your doorstep.
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all transform active:scale-[0.98] mt-8 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isSubmitting ? "Processing..." : "Place Order (COD)"}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-50 p-8 rounded-2xl sticky top-20 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex justify-between text-sm">
                      <div className="flex-1 pr-4">
                         <span className="font-medium text-gray-800">{item.name}</span>
                         <div className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">
                            {item.color} / {item.size} x {item.quantity}
                         </div>
                      </div>
                      <span className="font-bold text-gray-900 whitespace-nowrap">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">Rs. {getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-bold ${storeSettings.shippingCharge === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {storeSettings.shippingCharge === 0 ? 'Free' : `Rs. ${storeSettings.shippingCharge.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({storeSettings.taxRate}%)</span>
                    <span className="font-bold text-gray-900">Rs. {totalTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-8">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-black text-indigo-600 uppercase">Rs. {finalTotal.toFixed(2)}</span>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    <strong>Payment on Delivery:</strong> Please ensure you have the exact amount ready upon arrival.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
