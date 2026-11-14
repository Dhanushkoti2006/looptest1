'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from './types';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  coupon: Coupon | null;
  discountAmount: number;
  subtotal: number;
  shippingCharge: number;
  taxAmount: number;
  totalAmount: number;
  addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('loop_and_love_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('loop_and_love_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.warn('Could not load cart/wishlist from local storage:', e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('loop_and_love_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('loop_and_love_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const addToCart = (
    product: Product,
    color?: string,
    size?: string,
    quantity: number = 1
  ) => {
    const selectedColor = color || (product.variants?.[0]?.colorName ?? 'Standard');
    const selectedSize = size || (product.variants?.[0]?.sizeName ?? 'Standard');
    const itemPrice = product.discountPrice || product.price;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.color === selectedColor &&
          item.size === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          product.stock,
          updated[existingIdx].quantity + quantity
        );
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${selectedColor}-${selectedSize}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          image: product.images[0] || '/images/loop-and-love-logo.jpg',
          color: selectedColor,
          size: selectedSize,
          price: itemPrice,
          quantity: Math.min(product.stock, quantity),
          maxStock: product.stock,
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.min(item.maxStock, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Free shipping above Rs. 999
  const shippingCharge = subtotal >= 999 || subtotal === 0 ? 0 : 99;

  // Calculate discount
  let discountAmount = 0;
  if (coupon && subtotal >= coupon.minOrderValue) {
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(coupon.maxDiscount, discountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }
  }

  // 5% GST on net taxable value
  const taxAmount = Math.round((subtotal - discountAmount) * 0.05 * 100) / 100;

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCharge + taxAmount);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid && data.coupon) {
        if (subtotal < data.coupon.minOrderValue) {
          return {
            success: false,
            message: `Minimum order value for coupon ${code} is Rs. ${data.coupon.minOrderValue}.`,
          };
        }
        setCoupon(data.coupon);
        return { success: true, message: `Coupon ${code} applied successfully!` };
      }
      return { success: false, message: data.message || 'Invalid or expired coupon code.' };
    } catch {
      return { success: false, message: 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        coupon,
        discountAmount,
        subtotal,
        shippingCharge,
        taxAmount,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
