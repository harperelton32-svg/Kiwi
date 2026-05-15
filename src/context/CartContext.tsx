"use client";

import { createContext, useState, useContext, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void;
  updateItem: (id: string, oldColor: string | undefined, oldSize: string | undefined, newColor: string, newSize: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => 
        i.id === item.id && i.color === item.color && i.size === item.size
      );
      if (existingItem) {
        return prevItems.map((i) =>
          (i.id === item.id && i.color === item.color && i.size === item.size) 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const updateItem = (id: string, oldColor: string | undefined, oldSize: string | undefined, newColor: string, newSize: string) => {
    setItems((prevItems) => {
      const itemToUpdate = prevItems.find(i => i.id === id && i.color === oldColor && i.size === oldSize);
      if (!itemToUpdate) return prevItems;

      // If new variation already exists, merge them
      const existingItem = prevItems.find(i => i.id === id && i.color === newColor && i.size === newSize && i !== itemToUpdate);
      
      if (existingItem) {
        return prevItems.filter(i => i !== itemToUpdate).map(i => 
          i === existingItem ? { ...i, quantity: i.quantity + itemToUpdate.quantity } : i
        );
      }

      return prevItems.map(i => 
        i === itemToUpdate ? { ...i, color: newColor, size: newSize } : i
      );
    });
  };

  const removeFromCart = (id: string, color?: string, size?: string) => {
    setItems((prevItems) => prevItems.filter((item) => 
      !(item.id === id && item.color === color && item.size === size)
    ));
  };

  const updateQuantity = (id: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, color, size);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          (item.id === id && item.color === color && item.size === size) ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, updateItem, clearCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}