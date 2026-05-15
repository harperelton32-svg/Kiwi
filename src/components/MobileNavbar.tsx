"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function MobileNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-black">
            KIWI
          </Link>
        </div>

        <div className="flex items-center">
          <Link href="/" className="hidden md:block text-sm font-medium hover:text-gray-600 transition-colors mr-4">
            Home
          </Link>
          <Link href="/shop" className="hidden md:block text-sm font-medium hover:text-gray-600 transition-colors mr-4">
            Shop
          </Link>
          <Link href="/about" className="hidden md:block text-sm font-medium hover:text-gray-600 transition-colors mr-4">
            About
          </Link>
          <Link href="/contact" className="hidden md:block text-sm font-medium hover:text-gray-600 transition-colors mr-4">
            Contact
          </Link>
          <Link
            href="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Shopping cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="block py-2 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block py-2 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
