"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

interface ColorOption {
  name: string;
  hex: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  isOfferActive?: boolean;
  image: string;
  gallery?: string[];
  colors?: ColorOption[];
}

export default function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, removeFromCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const displayPrice = product.isOfferActive && product.offerPrice ? product.offerPrice : product.price;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colors = (product.colors && product.colors.length > 0)
    ? product.colors
    : [
        { name: 'Midnight Black', hex: '#000000' },
        { name: 'Cotton White', hex: '#ffffff' },
        { name: 'Royal Indigo', hex: '#4f46e5' }
      ];
  const sizes = ['S', 'M', 'L', 'XL'];

  // Always show primary image first, then valid gallery images
  const validGallery = product.gallery ? product.gallery.filter(img => img && img.trim() !== '') : [];
  const productImages = [
    product.image || 'https://placehold.co/400x400/png?text=No+Image',
    ...validGallery
  ];

  const inCart = items.some((i) => 
    i.id === product.id && i.color === selectedColor && i.size === selectedSize
  );

  const selectionComplete = selectedColor && selectedSize;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isModalOpen && productImages.length > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isModalOpen, productImages.length]);

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (productImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (productImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) nextImage();
    if (distance < -minSwipeDistance) prevImage();
  };

  const handleToggleCart = () => {
    if (!selectionComplete) return;

    if (inCart) {
      removeFromCart(product.id, selectedColor!, selectedSize!);
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: product.image || productImages[0],
        quantity: 1,
        color: selectedColor!,
        size: selectedSize!
      });
    }
  };

  return (
    <>
      {/* Main Card */}
      <div 
        className="group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-lg relative">
          {product.isOfferActive && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-tighter shadow-xl z-10 animate-pulse">
              Special Price
            </div>
          )}
          <img
            src={product.image || 'https://placehold.co/400x400/png?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
             <span className="bg-white/90 text-black px-4 py-2 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-sm">
               Quick View
             </span>
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-sm mb-1 group-hover:text-indigo-600 transition-colors truncate px-2">{product.name}</h3>
          <div className="flex flex-wrap items-baseline justify-center gap-1 sm:gap-2 px-1">
            <p className={`font-bold text-sm sm:text-base ${product.isOfferActive ? 'text-red-600' : 'text-gray-900'}`}>Rs. {displayPrice}</p>
            {product.isOfferActive && (
              <p className="text-gray-400 line-through text-[10px] sm:text-xs italic">Rs. {product.price}</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section with Slider */}
            <div 
              className="w-full md:w-1/2 bg-gray-100 relative h-80 md:h-auto overflow-hidden group/slider touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndEvent}
            >
              {productImages.length > 0 && (
                <img
                  src={productImages[currentImageIndex] || 'https://placehold.co/400x400/png?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  key={currentImageIndex}
                />
              )}
              
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? "w-6 bg-indigo-600" : "w-1.5 bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Details Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative overflow-y-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <div className="flex-1">
                <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold mb-2 block">Premium Collection</span>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h2>
                  {product.isOfferActive && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Limited Time Offer
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-6">
                  <p className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">Rs. {displayPrice.toFixed(2)}</p>
                  {product.isOfferActive && (
                    <p className="text-lg sm:text-xl text-gray-400 line-through font-light decoration-red-400/50">Rs. {product.price.toFixed(2)}</p>
                  )}
                </div>
                
                {/* Color Selection */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                    Select Color
                    {selectedColor && <span className="text-indigo-600 normal-case font-medium">{selectedColor}</span>}
                  </h3>
                  <div className="flex gap-4">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 border border-gray-200 ${
                          selectedColor === color.name ? 'ring-4 ring-indigo-200 ring-offset-2' : ''
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                    Select Size
                    {selectedSize && <span className="text-indigo-600 normal-case font-medium">Size {selectedSize}</span>}
                  </h3>
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

                <div className="prose text-sm text-gray-500 mb-8 border-t border-gray-100 pt-6">
                  <p>Experience the perfect blend of style and comfort with this premium piece. Crafted from high-quality materials, it's designed to elevate your everyday wardrobe.</p>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={handleToggleCart}
                  disabled={!selectionComplete}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform shadow-md ${
                    !selectionComplete
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : inCart 
                        ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 hover:scale-[1.02]" 
                        : "bg-black text-white hover:bg-gray-900 hover:scale-[1.02] active:scale-95"
                  }`}
                >
                  {!selectionComplete ? "Select Color & Size" : inCart ? "Remove from Cart" : "Add to Cart"}
                </button>

                {inCart && (
                  <Link 
                    href="/cart"
                    className="w-full py-4 rounded-xl font-bold text-lg text-center block bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm"
                  >
                    View Cart
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export type { Product };