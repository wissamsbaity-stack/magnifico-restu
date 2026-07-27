/**
 * Admin dashboard configuration — scaffold for future implementation.
 */
export const adminConfig = {
  basePath: "/admin",
  title: "Admin",
  routes: {
    dashboard: "/admin",
    menu: "/admin/menu",
    categories: "/admin/categories",
    settings: "/admin/settings",
  },
} as const;

export type AdminRouteKey = keyof typeof adminConfig.routes;
