import { create } from 'zustand';
import type { Product } from '../types/product';

interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  maxQuantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedRam?: string;
  variantId?: number;
  isSelected?: boolean;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity' | 'isSelected'>) => void;
  totalItems: () => number;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, amount: number) => void;
  totalPrice: () => number; 
  toggleItemSelection: (cartItemId: string) => void;
  toggleAllSelection: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  addToCart: (product) => {
    const currentCart = get().cart;
    const safeCartId = product.cartItemId || `${product.id}-default`;
    const existingItem = currentCart.find((item) => item.cartItemId === safeCartId);

    if (existingItem) {
      if (existingItem.quantity >= existingItem.maxQuantity) {
        alert(`Rất tiếc! Chỉ còn ${existingItem.maxQuantity} sản phẩm trong kho.`);
        return;
      }
      set({
        cart: currentCart.map((item) =>
          item.cartItemId === safeCartId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      if (product.maxQuantity <= 0) {
        alert('Rất tiếc! Sản phẩm này đã hết hàng.');
        return;
      }
      set({ cart: [...currentCart, { ...product, cartItemId: safeCartId, quantity: 1, isSelected: true } as CartItem] });
    }
  },
  totalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
  removeFromCart: (cartItemId) => {
    set({ cart: get().cart.filter(item => item.cartItemId !== cartItemId) });
  },

  updateQuantity: (cartItemId, amount) => {
    set({
      cart: get().cart.map(item => {
        if (item.cartItemId === cartItemId) {
          const nextQty = item.quantity + amount;
          if (amount > 0 && item.quantity >= item.maxQuantity) {
            alert(`Chỉ còn ${item.maxQuantity} sản phẩm trong kho!`);
            return item;
          }
          return { ...item, quantity: Math.min(Math.max(1, nextQty), item.maxQuantity) };
        }
        return item;
      })
    });
  },

  toggleItemSelection: (cartItemId) => {
    set({
      cart: get().cart.map(item =>
        item.cartItemId === cartItemId ? { ...item, isSelected: item.isSelected === false ? true : false } : item
      )
    });
  },

  toggleAllSelection: () => {
    const allSelected = get().cart.every(item => item.isSelected !== false);
    set({
      cart: get().cart.map(item => ({ ...item, isSelected: !allSelected }))
    });
  },

  totalPrice: () => get().cart.filter(item => item.isSelected !== false).reduce((total, item) => total + (item.price * item.quantity), 0),
}));