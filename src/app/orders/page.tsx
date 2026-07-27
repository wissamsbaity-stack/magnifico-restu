import { requireStaff } from "@/lib/auth/staff";
import { fetchUnreadOrders } from "@/lib/orders/queries";
import { fetchOrderHistory } from "@/app/orders/actions";
import { OrdersDashboard } from "@/components/orders/OrdersDashboard";
import { getSiteSettings } from "@/lib/settings/site-settings";

export default async function OrdersPage() {
  const [{ supabase }, settings, history] = await Promise.all([
    requireStaff(),
    getSiteSettings(),
    fetchOrderHistory({ page: 0 }),
  ]);

  const newOrders = await fetchUnreadOrders(supabase);

  return (
    <OrdersDashboard
      restaurantName={settings.name}
      logoUrl={settings.branding.logo}
      initialNewOrders={newOrders}
      initialHistoryOrders={history.orders}
      initialHistoryHasMore={history.hasMore}
      initialHistoryTotalCount={history.totalCount}
    />
  );
}
