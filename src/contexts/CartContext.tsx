"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { notifyItemAdded } from "@/lib/cart-events";
import { useSettings } from "@/contexts/SettingsContext";
import {
  cartReducer,
  getCartItemCount,
  getCartSubtotal,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart";
import type { CartItem } from "@/types/cart";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (
    item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  useEffect(() => {
    dispatch({ type: "HYDRATE", payload: loadCartFromStorage() });
  }, []);

  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
      dispatch({ type: "ADD_ITEM", payload: item });
      notifyItemAdded(item.name);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    dispatch({ type: "UPDATE_NOTES", payload: { id, notes } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", payload: true });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", payload: false });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", payload: !state.isOpen });
  }, [state.isOpen]);

  const subtotal = useMemo(() => getCartSubtotal(state.items), [state.items]);
  const itemCount = useMemo(() => getCartItemCount(state.items), [state.items]);
  const deliveryFee = state.items.length > 0 ? settings.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const value = useMemo(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      addItem,
      removeItem,
      updateQuantity,
      updateNotes,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      state.items,
      state.isOpen,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      addItem,
      removeItem,
      updateQuantity,
      updateNotes,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
