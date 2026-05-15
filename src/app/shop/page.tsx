import MobileNavbar from "@/components/MobileNavbar";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import { Product } from "@/components/ProductCard";

const allProducts: Product[] = [
  { id: '1', name: 'Premium Cotton T-Shirt', price: 39.99, image: 'https://via.placeholder.com/400x400?text=T-Shirt' },
  { id: '2', name: 'Slim Fit Jeans', price: 89.99, image: 'https://via.placeholder.com/400x400?text=Jeans' },
  { id: '3', name: 'Casual Hoodie', price: 59.99, image: 'https://via.placeholder.com/400x400?text=Hoodie' },
  { id: '4', name: 'Designer Sneakers', price: 129.99, image: 'https://via.placeholder.com/400x400?text=Sneakers' },
  { id: '5', name: 'Leather Jacket', price: 199.99, image: 'https://via.placeholder.com/400x400?text=Jacket' },
  { id: '6', name: 'Summer Dress', price: 79.99, image: 'https://via.placeholder.com/400x400?text=Dress' },
  { id: '7', name: 'Wool Sweater', price: 99.99, image: 'https://via.placeholder.com/400x400?text=Sweater' },
  { id: '8', name: 'Athletic Shorts', price: 34.99, image: 'https://via.placeholder.com/400x400?text=Shorts' },
  { id: '9', name: 'Denim Jacket', price: 109.99, image: 'https://via.placeholder.com/400x400?text=Denim+Jacket' },
  { id: '10', name: 'Silk Blouse', price: 69.99, image: 'https://via.placeholder.com/400x400?text=Blouse' },
  { id: '11', name: 'Cargo Pants', price: 79.99, image: 'https://via.placeholder.com/400x400?text=Pants' },
  { id: '12', name: 'Baseball Cap', price: 24.99, image: 'https://via.placeholder.com/400x400?text=Cap' },
];

export default function Shop() {
  return (
    <>
      <MobileNavbar />
      <CategorySection title="Shop All Products" products={allProducts} />
      <Footer />
    </>
  );
}