"use client";
import { useEffect, useState } from "react";
import MobileNavbar from "@/components/MobileNavbar";
import HeroBanner from "@/components/HeroBanner";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import { Product } from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data.slice(0, 8)); // Just show first 8 as featured
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
      <HeroBanner />
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : (
        <CategorySection title="Featured Products" products={products} />
      )}
      <Footer />
    </>
  );
}
