import { LOGO_SRC } from "@/lib/branding/logo";

export const restaurantInfo = {
  name: "Magnifico Street Food",
  legalName: "Magnifico Street Food",
  tagline: "Bold Lebanese street food",
  phone: "81 999 162",
  phoneSecondary: "",
  email: "hello@magnificostreetfood.com",
  whatsapp: "96181999162",
  address: {
    street: "Autostrade Sayed Hadi",
    city: "Beirut",
    state: "Lebanon",
    country: "Lebanon",
  },
  coordinates: { lat: 33.8547, lng: 35.5623 },
  hours: [{ days: "Daily", time: "11:00 AM - 1:00 AM" }],
  social: {
    instagram: "https://www.instagram.com/magnificostreetfood",
    facebook: "",
  },
  branding: {
    logo: LOGO_SRC,
  },
} as const;
