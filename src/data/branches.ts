import type { Branch } from "@/types/branch";

/**
 * Static fallback branches used when Supabase is not configured. These mirror
 * the seed rows in supabase/migrations/018_branches.sql and are fully editable
 * from the Admin Panel once the database is connected.
 */
export const staticBranches: Branch[] = [
  {
    id: "branch-sayed-hadi",
    name: "Autostrade Sayed Hadi",
    slug: "sayed-hadi",
    address: "Autostrade Sayed Hadi, Beirut, Lebanon",
    phone: "81 999 162",
    whatsapp: "96181999162",
    googleMapsUrl: "",
    hours: [{ days: "Daily", time: "11:00 AM - 1:00 AM" }],
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "branch-centro-mall",
    name: "Centro Mall",
    slug: "centro-mall",
    address: "Centro Mall, Lebanon",
    phone: "",
    whatsapp: "96181999162",
    googleMapsUrl: "",
    hours: [{ days: "Daily", time: "11:00 AM - 11:00 PM" }],
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "branch-dahye-food-truck",
    name: "Dahye Food Truck",
    slug: "dahye-food-truck",
    address: "Old Saida Road, facing Hachem Gas Station, Dahye, Lebanon",
    phone: "",
    whatsapp: "96181999162",
    googleMapsUrl: "",
    hours: [{ days: "Daily", time: "5:30 PM - 12:00 AM" }],
    sortOrder: 2,
    isActive: true,
  },
];
