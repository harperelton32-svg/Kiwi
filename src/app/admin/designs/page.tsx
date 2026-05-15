"use client";

import { useEffect, useState } from "react";
import MobileNavbar from "@/components/MobileNavbar";
import AdminTabs from "@/components/AdminTabs";
import Footer from "@/components/Footer";
import Image from "next/image";

interface ColorOption {
  name: string;
  class: string;
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

const COLOR_PRESETS = [
  { name: 'Black', class: 'bg-black' },
  { name: 'White', class: 'bg-white border border-gray-200' },
  { name: 'Indigo', class: 'bg-indigo-600' },
  { name: 'Red', class: 'bg-red-600' },
  { name: 'Blue', class: 'bg-blue-600' },
  { name: 'Green', class: 'bg-green-600' },
  { name: 'Gray', class: 'bg-gray-500' },
  { name: 'Beige', class: 'bg-[#F5F5DC]' },
];

export default function DesignsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    offerPrice: '',
    isOfferActive: false,
    image: '', 
    gallery: ['', '', '', '', ''],
    colors: [] as ColorOption[]
  });
  const [isAdding, setIsAdding] = useState(false);
  const [storeSettings, setStoreSettings] = useState({ shippingCharge: 0, taxRate: 10 });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setStoreSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings),
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  }

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const finalImage = newProduct.image || `https://placehold.co/400x400/png?text=${encodeURIComponent(newProduct.name)}`;
      
      // If gallery is empty, use placeholders
      const finalGallery = newProduct.gallery.some(img => img !== '') 
        ? newProduct.gallery.filter(img => img !== '')
        : [
            finalImage,
            `${finalImage}&text=${encodeURIComponent(newProduct.name)}+View+2`,
            `${finalImage}&text=${encodeURIComponent(newProduct.name)}+View+3`,
            `${finalImage}&text=${encodeURIComponent(newProduct.name)}+View+4`,
            `${finalImage}&text=${encodeURIComponent(newProduct.name)}+View+5`,
          ];

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          offerPrice: newProduct.offerPrice ? parseFloat(newProduct.offerPrice) : undefined,
          isOfferActive: newProduct.isOfferActive,
          image: finalImage,
          gallery: finalGallery,
          colors: newProduct.colors.length > 0 ? newProduct.colors : COLOR_PRESETS.slice(0, 3)
        }),
      });
      if (response.ok) {
        setNewProduct({ name: '', price: '', offerPrice: '', isOfferActive: false, image: '', gallery: ['', '', '', '', ''], colors: [] });
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const response = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      if (response.ok) {
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleGalleryChange = (index: number, value: string, isEditing: boolean) => {
    if (isEditing && editingProduct) {
      const newGallery = [...(editingProduct.gallery || ['', '', '', '', ''])];
      newGallery[index] = value;
      setEditingProduct({ ...editingProduct, gallery: newGallery });
    } else {
      const newGallery = [...newProduct.gallery];
      newGallery[index] = value;
      setNewProduct({ ...newProduct, gallery: newGallery });
    }
  };

  const toggleColor = (color: ColorOption, isEditing: boolean) => {
    if (isEditing && editingProduct) {
      const currentColors = editingProduct.colors || [];
      const exists = currentColors.find(c => c.name === color.name);
      const newColors = exists 
        ? currentColors.filter(c => c.name !== color.name)
        : [...currentColors, color];
      setEditingProduct({ ...editingProduct, colors: newColors });
    } else {
      const currentColors = newProduct.colors;
      const exists = currentColors.find(c => c.name === color.name);
      const newColors = exists 
        ? currentColors.filter(c => c.name !== color.name)
        : [...currentColors, color];
      setNewProduct({ ...newProduct, colors: newColors });
    }
  };

  return (
    <>
      <MobileNavbar />
      <AdminTabs />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Product Designs & Management</h1>

          {/* Store Settings Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Store Configuration
            </h2>
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Shipping Charge (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={storeSettings.shippingCharge}
                  onChange={(e) => setStoreSettings({ ...storeSettings, shippingCharge: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Update Settings'}
              </button>
            </form>
          </div>

          {/* Add Product Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Classic Denim Shirt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Image URL</label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Leave empty for auto-placeholder"
                  />
                </div>
              </div>

              {/* Offer Section */}
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => setNewProduct({ ...newProduct, isOfferActive: !newProduct.isOfferActive })}
                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${newProduct.isOfferActive ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${newProduct.isOfferActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">Enable Offer Price</h3>
                    <p className="text-xs text-red-700">Display "Special Price" tag on the storefront</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-red-900 mb-2">Offer Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.offerPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, offerPrice: e.target.value })}
                    disabled={!newProduct.isOfferActive}
                    className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none disabled:opacity-50"
                    placeholder="19.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Available Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color, false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                          newProduct.colors.find(c => c.name === color.name)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${color.class}`} />
                        <span className="text-xs font-bold">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Gallery Image Slots</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <input
                        key={i}
                        type="text"
                        value={newProduct.gallery[i]}
                        onChange={(e) => handleGalleryChange(i, e.target.value, false)}
                        className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder={`Img ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                {isAdding ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : 'Create Product Design'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden group">
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          const gallery = product.gallery && product.gallery.length === 5 
                            ? product.gallery 
                            : [product.image, '', '', '', ''];
                          setEditingProduct({ ...product, gallery, colors: product.colors || [] });
                        }}
                        className="bg-white text-gray-900 p-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-white text-red-600 p-3 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-indigo-600 font-extrabold mt-1">Rs. {product.price.toFixed(2)}</p>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex -space-x-1">
                        {(product.colors || []).map((c, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full border border-white ${c.class}`} title={c.name} />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${product.gallery && product.gallery[i] ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Design</h2>
                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => setEditingProduct({ ...editingProduct, isOfferActive: !editingProduct.isOfferActive })}
                      className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${editingProduct.isOfferActive ? 'bg-red-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform ${editingProduct.isOfferActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <span className="font-bold text-red-900">Offer Active</span>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-red-900 mb-1">Offer Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.offerPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, offerPrice: parseFloat(e.target.value) })}
                      disabled={!editingProduct.isOfferActive}
                      className="w-full px-4 py-2 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Image URL</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Available Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color, true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                          (editingProduct.colors || []).find(c => c.name === color.name)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${color.class}`} />
                        <span className="text-xs font-bold">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Gallery Slider Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 w-12">Slot {i + 1}</span>
                        <input
                          type="text"
                          value={editingProduct.gallery?.[i] || ''}
                          onChange={(e) => handleGalleryChange(i, e.target.value, true)}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Image URL"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
