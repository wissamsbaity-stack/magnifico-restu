export type OrderType = "delivery" | "pickup";

export interface DeliveryDetails {
  name: string;
  phone: string;
  city: string;
  street: string;
  building: string;
  deliveryInstructions: string;
}

export interface OrderSummary {
  items: {
    name: string;
    quantity: number;
    price: number;
    notes: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface Order extends DeliveryDetails {
  id?: string;
  items: OrderSummary["items"];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status?: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  createdAt?: string;
}
