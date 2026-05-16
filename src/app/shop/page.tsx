"use client";

import { useEffect, useState } from "react";
import MobileNavbar from "@/components/MobileNavbar";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import { Product } from "@/components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <MobileNavbar />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : (
        <CategorySection title="Shop All Products" products={products} />
      )}
      <Footer />
    </>
  );
}