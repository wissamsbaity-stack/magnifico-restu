/**
 * Build magnifico-menu.json from scraped thrubits menu data.
 * Source: https://rest.thrubits.com/restaurant/magnifico-restaurant
 * Scraped via browser automation from rendered page (Jul 2026).
 */

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const scraped = [
  {
    name: "Starters",
    items: [
      { name: "MOZERELLA STICKS", description: "5 pcs", price: 6.11 },
      { name: "FRIES", description: "", price: 3.33 },
      { name: "WEDGES", description: "", price: 4.0 },
      { name: "CHEDDAR BALLS", description: "5 cheddar cheese balls", price: 5.5 },
      { name: "HOT CHEDDAR TRIANGLES", description: "5 hot cheddar triangles", price: 6.0 },
      { name: "WINGS", description: "6 pcs wings", price: 5.5 },
      { name: "FAMILY FRIES", description: "", price: 7.7 },
    ],
  },
  {
    name: "Sandwiches",
    items: [
      {
        name: "PULLED BEEF WRAP",
        description:
          "pulled beef, cheddar, pickels, pulga sauce, magnifico sauce, chips, iceberg",
        price: 8.87,
      },
      {
        name: "TWISTER",
        description:
          "crispy strips, cheddar sauce, chips, bbq, aoili sauce, pickles, lettuce",
        price: 7.15,
      },
      {
        name: "FAHITA",
        description: "green pepper, onion, corn, mozerella cheese, avocado sauce",
        price: 8.22,
      },
      {
        name: "CHICKEN SUB",
        description:
          "chicken, mozzerella cheese, corn, soy sauce, aoili sauce, lettuce, pickels, chips",
        price: 7.87,
      },
      {
        name: "PHILLY STEAK",
        description: "PHILLY STEAK BEEF, ONION, GREEN PEPPER, MOZERELLA CHEESE, MAYO",
        price: 9.0,
      },
    ],
  },
  {
    name: "Beef burgers",
    items: [
      {
        name: "SWISS MUSHROOM BURGER",
        description:
          "beef patty, fresh mushroom sauce, swiss cheese, magnifico sauce, cheesy sauce",
        price: 8.25,
      },
      {
        name: "MAGNIFICO BEEF",
        description:
          "double beef patty, cheddar patty, bacon, magnifico sauce, pulga sauce, pickles, lettuce, tomato",
        price: 11.0,
      },
      {
        name: "DOUBLE SMASH BURGER",
        description:
          "double smashed beef patties, pulga sauce, magnifico sauce, bacon, pickels, onions, cheddar slice",
        price: 8.87,
      },
      {
        name: "PULLED BEEF BURGER",
        description:
          "pulled beef, cheddar, chips, pickles, magnifico sauce, pulga sauce, lettuce",
        price: 8.28,
      },
      {
        name: "SMOKEY BEEF BURGER",
        description:
          "pulled beef, beef patty, cheddar sauce, magnifico sauce, pulga sauce, pickles, lettuce",
        price: 9.61,
      },
      {
        name: "OKLAHOMA BEEF BURGER",
        description:
          "Double beef patties, cheddar slice, emmental slice, pickles, lettuce, bacon, pulga sauce, magnifico sauce",
        price: 10.0,
      },
      {
        name: "AMERICAN BEEF",
        description: "beef patty, onion, lettuce, pickles, bbq sauce, cocktail, cheddar, tomato",
        price: 6.6,
      },
      {
        name: "LEBANESE BEEF",
        description: "beef patty, fries, coleslow, metchup",
        price: 6.6,
      },
      {
        name: "CHILLI MANGO",
        description:
          "BEF PATTY, CHILLI MANGO SAUCE, PULGA SAUCE, PICKLED ONION, EMMENTAL SLICE, LETTUCE",
        price: 8.5,
      },
    ],
  },
  {
    name: "Chicken burgers",
    items: [
      {
        name: "MAGNIFICO ZINGER",
        description:
          "Double chicken zinger patties, cheddar patty, aoilli sauce, magnifico sauce, turkey, pickles, lettuce",
        price: 10.0,
      },
      {
        name: "HONEY MUSTARD CHICKEN",
        description:
          "chicken patty, mozerella paty, lettuce, pickles, chips, honey mustard sauce",
        price: 8.25,
      },
      {
        name: "CHICKEN MOZERELLA",
        description: "Grilled chicken patty, mozerella patty, pulga sauce, lettuce, pickles",
        price: 7.5,
      },
      {
        name: "GRILLED CHICKEN BURGER",
        description:
          "grilled chicken breast, smoked turkey slice, lettuce, pickles, chips, bbq sauce, cheddar sauce, aoili sauce",
        price: 8.25,
      },
      {
        name: "ESCALOPE BURGER",
        description: "escalope, aoilli sauce, coleslaw, cocktail, pickles",
        price: 7.7,
      },
      {
        name: "CHICKEN CAJUN BURGER",
        description: "CHICKEN BREAST, CHEDDAR, CHIPS, LETTUCE, PICKLES, CAJUN SAUCE",
        price: 7.7,
      },
    ],
  },
  {
    name: "Box corner",
    items: [
      {
        name: "CRISPY BOX",
        description: "5 crispy pcs, cocktail sauce, garlic sauce, pickles, coleslaw",
        price: 9.7,
      },
      {
        name: "FLAME BOX",
        description: "5 flame crispy pcs, cocktail sauce, garlic sauce, pickles, coleslaw",
        price: 9.7,
      },
      {
        name: "FULL BROASTED",
        description: "8 chicken pcs, garlic sauce, cocktail sauce, pickles, coleslaw",
        price: 19.8,
      },
      {
        name: "HALF BROASTED",
        description: "4 chicken pcs, garlic sauce, cocktail sauce, pickles, coleslaw",
        price: 9.8,
      },
    ],
  },
  {
    name: "Magnifico old specials",
    items: [
      {
        name: "MAGNIFICO CHICKEN WRAP",
        description:
          "crispy chicken, coleslaw, cheddar, chips, pickels, aoili sauce, cocktail sauce",
        price: 9.5,
      },
      {
        name: "MAGNIFICO BEEF WRAP",
        description:
          "PULED BEEF, CHEDDAR, CHIPS, LETTUCE, PICKLES, MAGNIFICO SAUCE , PULGA SAUCE",
        price: 10.0,
      },
      {
        name: "CRAZY FRIES CHICEKN",
        description:
          "FRIES, CRISPY STRIPS, PICKELS, JALEPENOS, CHEDDAR, COCKTAIL SAUCE, OAILI SAUCE, COLESLOW",
        price: 7.7,
      },
      {
        name: "CARZY FRIES BEEF",
        description: "PULLED BEEF, FRIES, MAGNIFICO SAUCEC, PULGA SAUCE, PICKLES, JALEPENO",
        price: 7.7,
      },
    ],
  },
  {
    name: "drinks",
    items: [
      { name: "pepsi", description: "", price: 1.0 },
      { name: "7up", description: "", price: 1.0 },
      { name: "mirinda", description: "", price: 1.0 },
      { name: "sparkling water", description: "", price: 1.5 },
      { name: "ayran", description: "", price: 1.0 },
    ],
  },
  {
    name: "KIDS CORNER",
    items: [
      {
        name: "KIDS NUGGETS",
        description: "5 PCS NUGGETS, FRIES AND JUICE",
        price: 6.66,
      },
    ],
  },
];

const categories = scraped.map((cat, index) => {
  const slug = slugify(cat.name);
  return {
    id: `cat-${slug}`,
    name: cat.name,
    slug,
    description: "",
    sortOrder: index,
    icon: null,
  };
});

const categoryIdByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

const menuItems = [];
for (const cat of scraped) {
  cat.items.forEach((item, index) => {
    const slug = slugify(item.name);
    menuItems.push({
      id: `item-${slug}`,
      name: item.name,
      slug,
      description: item.description,
      price: item.price,
      categoryId: categoryIdByName[cat.name],
      imageUrl: "",
      isPopular: false,
      isBestSeller: false,
      isAvailable: true,
      tags: [],
      displayOrder: index,
    });
  });
}

const output = {
  categories,
  menuItems,
  stats: {
    totalCategories: categories.length,
    totalItems: menuItems.length,
  },
};

const outPath = join(root, "src/data/magnifico-menu.json");
writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(`Wrote ${categories.length} categories and ${menuItems.length} items to ${outPath}`);
