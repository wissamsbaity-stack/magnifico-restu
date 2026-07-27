import { CategoriesPreview } from "@/components/home/CategoriesPreview";
import { PopularSection } from "@/components/home/PopularSection";
import { OrderCTA } from "@/components/home/OrderCTA";
import { Hero } from "@/components/home/Hero";
import { HomePageClientEffects } from "@/components/home/HomePageClientEffects";
import { OurBranches } from "@/components/branch/OurBranches";
import { getHomeHeroBanners } from "@/lib/banner-service";
import { menuService } from "@/lib/menu-service";

export default async function HomePage() {
  const [categories, items, banners] = await Promise.all([
    menuService.getCategories(),
    menuService.getMenuItems(),
    getHomeHeroBanners(),
  ]);

  const popular = items.filter(
    (item) => item.isAvailable && (item.isPopular || item.isBestSeller)
  );

  return (
    <>
      <HomePageClientEffects />
      <Hero banners={banners} />
      <CategoriesPreview categories={categories} menuItems={items} />
      <PopularSection items={popular} />
      <OurBranches />
      <OrderCTA />
    </>
  );
}
