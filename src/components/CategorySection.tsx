import ProductGrid from "./ProductGrid";
import { Product } from "./ProductCard";

export default function CategorySection({ title, products }: { title: string; products: Product[] }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}