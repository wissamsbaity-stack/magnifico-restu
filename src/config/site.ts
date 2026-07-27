export const siteConfig = {
  name: "Magnifico Street Food",
  description:
    "Bold Lebanese street food — burgers, wraps, taco boxes, and more, ordered your way via WhatsApp.",
  url: "https://magnificostreetfood.com",
  deliveryFee: 0,
  minOrder: 0,
  whatsappPhone: "96181999162",
  currency: "USD",
  currencySymbol: "$",
  /**
   * Master switch for the built-in Orders system (orders dashboard + in-app
   * checkout). Disabled for the WhatsApp-only setup. All orders code + DB
   * structure are kept intact; flip to true to re-enable later.
   */
  ordersEnabled: false,
};
