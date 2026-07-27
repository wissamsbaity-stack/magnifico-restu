import type { CartAction, CartItem } from "@/types/cart";
import { generateId } from "@/lib/utils";

export function cartReducer(
  state: { items: CartItem[]; isOpen: boolean },
  action: CartAction
): { items: CartItem[]; isOpen: boolean } {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) =>
          item.menuItemId === action.payload.menuItemId &&
          item.notes === (action.payload.notes ?? "")
      );

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity ?? 1),
                }
              : item
          ),
        };
      }

      const newItem: CartItem = {
        id: generateId(),
        menuItemId: action.payload.menuItemId,
        name: action.payload.name,
        price: action.payload.price,
        quantity: action.payload.quantity ?? 1,
        notes: action.payload.notes ?? "",
        imageUrl: action.payload.imageUrl,
      };

      return {
        ...state,
        items: [...state.items, newItem],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "UPDATE_NOTES":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, notes: action.payload.notes }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "SET_OPEN":
      return { ...state, isOpen: action.payload };

    case "HYDRATE":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartLineTotal(item), 0);
}

export function getCartLineTotal(item: CartItem): number {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  return item.price * quantity;
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

const CART_STORAGE_KEY = "magnifico-cart";

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    return parsed.map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: Number(item.price) || 0,
    }));
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
