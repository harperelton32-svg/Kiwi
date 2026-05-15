import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-r from-gray-50 to-white">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-7xl font-bold text-black mb-6 leading-tight">
          KIWI Clothing
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Premium mobile-first fashion. Experience luxury style with lightning-fast performance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/shop"
            className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Shop Collection
          </a>
          <a
            href="/about"
            className="border border-black text-black px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}