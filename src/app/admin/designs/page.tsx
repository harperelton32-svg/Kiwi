"use client";

import { useEffect, useState } from "react";
import MobileNavbar from "@/components/MobileNavbar";
import AdminTabs from "@/components/AdminTabs";
import Footer from "@/components/Footer";
import Image from "next/image";

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

// Removed COLOR_PRESETS as per user request for hex selection

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
    gallery: ['', '', '', ''],
    colors: [] as ColorOption[]
  });
  const [isAdding, setIsAdding] = useState(false);
  const [storeSettings, setStoreSettings] = useState({ shippingCharge: 0, taxRate: 10 });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [customColor, setCustomColor] = useState({ name: '', hex: '#000000' });

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json() as { shippingCharge: number; taxRate: number; };
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
      const data = await response.json() as Product[];
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
      
      // If gallery is empty, use empty array instead of placeholders
      const finalGallery = newProduct.gallery.some(img => img !== '') 
        ? newProduct.gallery.filter(img => img !== '')
        : [];

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
          colors: newProduct.colors
        }),
      });
      if (response.ok) {
        setNewProduct({ name: '', price: '', offerPrice: '', isOfferActive: false, image: '', gallery: ['', '', '', ''], colors: [] });
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.8));
          } else {
            resolve(reader.result as string);
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean, index: number = 0, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      if (isGallery) {
        handleGalleryChange(index, base64, isEditing);
      } else {
        if (isEditing && editingProduct) {
          setEditingProduct({ ...editingProduct, image: base64 });
        } else {
          setNewProduct({ ...newProduct, image: base64 });
        }
      }
    } catch (error) {
      console.error('Failed to convert image:', error);
      alert('Failed to process image. Please try a smaller file.');
    }
  };

  const handleGalleryChange = (index: number, value: string, isEditing: boolean) => {
    if (isEditing && editingProduct) {
      const newGallery = [...(editingProduct.gallery || ['', '', '', ''])];
      newGallery[index] = value;
      setEditingProduct({ ...editingProduct, gallery: newGallery });
    } else {
      const newGallery = [...newProduct.gallery];
      newGallery[index] = value;
      setNewProduct({ ...newProduct, gallery: newGallery });
    }
  };

  const addCustomColor = (isEditing: boolean) => {
    if (!customColor.name || !customColor.hex) return;
    const colorToAdd = { ...customColor };
    
    if (isEditing && editingProduct) {
      setEditingProduct({ 
        ...editingProduct, 
        colors: [...(editingProduct.colors || []), colorToAdd] 
      });
    } else {
      setNewProduct({ 
        ...newProduct, 
        colors: [...newProduct.colors, colorToAdd] 
      });
    }
    setCustomColor({ name: '', hex: '#000000' });
  };

  const removeColor = (colorName: string, isEditing: boolean) => {
    if (isEditing && editingProduct) {
      setEditingProduct({ 
        ...editingProduct, 
        colors: (editingProduct.colors || []).filter(c => c.name !== colorName) 
      });
    } else {
      setNewProduct({ 
        ...newProduct, 
        colors: newProduct.colors.filter(c => c.name !== colorName) 
      });
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      {newProduct.image ? (
                        <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
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
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Product Colors</h3>
                  
                  {/* Add Color Form */}
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text"
                      placeholder="Color Name (e.g. Sunset Red)"
                      value={customColor.name}
                      onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none min-w-0"
                    />
                    <input 
                      type="color"
                      value={customColor.hex}
                      onChange={(e) => setCustomColor({ ...customColor, hex: e.target.value })}
                      className="w-10 h-10 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer flex-shrink-0"
                    />
                    <button 
                      type="button"
                      onClick={() => addCustomColor(false)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {newProduct.colors.map((color) => (
                      <div
                        key={color.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white border-indigo-100"
                      >
                        <div className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: color.hex }} />
                        <span className="text-xs font-bold text-gray-700">{color.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeColor(color.name, false)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ))}
                    {newProduct.colors.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No colors added yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Gallery Images</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="relative aspect-square rounded-lg bg-white border border-gray-200 overflow-hidden group/item">
                        {newProduct.gallery[i] ? (
                          <>
                            <img src={newProduct.gallery[i]} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => handleGalleryChange(i, '', false)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true, i, false)}
                              className="hidden"
                            />
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          </label>
                        )}
                      </div>
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
                <div key={product.id} className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden">
                  <div className="aspect-square relative overflow-hidden bg-gray-100 border-b border-gray-100">
                    <img
                      src={product.image || 'https://placehold.co/400x400/png?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-indigo-600 font-extrabold mt-1">Rs. {product.price.toFixed(2)}</p>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex -space-x-1">
                          {(product.colors || []).map((c, i) => (
                            <div 
                              key={i} 
                              className="w-4 h-4 rounded-full border border-white shadow-sm" 
                              style={{ backgroundColor: c.hex }} 
                              title={c.name} 
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          {[product.image, ...(product.gallery || [])].filter(Boolean).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const gallery = [...(product.gallery || []), '', '', '', ''].slice(0, 4);
                          setEditingProduct({ ...product, gallery, colors: product.colors || [] });
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-bold transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-bold transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete
                      </button>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 md:p-8">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false, 0, true)}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Product Colors</h3>
                  
                  {/* Add Color Form */}
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text"
                      placeholder="Color Name"
                      value={customColor.name}
                      onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none min-w-0"
                    />
                    <input 
                      type="color"
                      value={customColor.hex}
                      onChange={(e) => setCustomColor({ ...customColor, hex: e.target.value })}
                      className="w-10 h-10 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer flex-shrink-0"
                    />
                    <button 
                      type="button"
                      onClick={() => addCustomColor(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {(editingProduct.colors || []).map((color) => (
                      <div
                        key={color.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white border-indigo-100"
                      >
                        <div className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: color.hex }} />
                        <span className="text-xs font-bold text-gray-700">{color.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeColor(color.name, true)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Gallery Slider Images</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="relative aspect-square rounded-lg bg-white border border-gray-200 overflow-hidden group/edititem">
                        {editingProduct.gallery?.[i] ? (
                          <>
                            <img src={editingProduct.gallery[i]} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => handleGalleryChange(i, '', true)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover/edititem:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true, i, true)}
                              className="hidden"
                            />
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          </label>
                        )}
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
