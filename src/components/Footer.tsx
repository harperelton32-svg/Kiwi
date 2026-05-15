export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">KIWI</h3>
            <p className="text-gray-400 text-sm">Premium clothing for the modern lifestyle.</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/shop" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="/cart" className="hover:text-white transition-colors">Shopping Cart</a></li>
              <li><a href="/shop?category=men" className="hover:text-white transition-colors">Men</a></li>
              <li><a href="/shop?category=women" className="hover:text-white transition-colors">Women</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {/* Social media icons can be added here */}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 KIWI Clothing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}