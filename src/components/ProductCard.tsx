"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group">
      <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-lg relative">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <button
          onClick={handleAddToCart}
          className={`absolute inset-0 flex items-end justify-center pb-4 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 ${
            isAdded ? "bg-opacity-40" : ""
          }`}
        >
          <span
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              isAdded
                ? "bg-green-500 text-white"
                : "bg-white text-black opacity-0 group-hover:opacity-100"
            }`}
          >
            {isAdded ? "Added ✓" : "Add to Cart"}
          </span>
        </button>
      </div>
      <h3 className="font-medium text-sm mb-1">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
    </div>
  );
}

export type { Product };