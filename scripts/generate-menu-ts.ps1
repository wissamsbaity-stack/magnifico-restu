$jsonPath = Join-Path $PSScriptRoot "..\src\data\menu-extracted.json"
$menuTsPath = Join-Path $PSScriptRoot "..\src\data\menu.ts"
$restaurantTsPath = Join-Path $PSScriptRoot "..\src\data\restaurant.ts"

$data = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$r = $data.restaurant

$displayNames = @{
  "Sides" = "Sides"
  "baked potato" = "Baked Potato"
  "WRAPS AND SUBS" = "Wraps & Subs"
  "Beef Burger" = "Beef Burgers"
  "ANGUS BURGERS" = "Angus Burgers"
  "Chicken Burger" = "Chicken Burgers"
  "upgrade" = "Upgrades"
  "Soft Drink" = "Beverages"
  "add on's" = "Add-Ons"
  "value meals" = "Value Meals"
}

$categoryDescriptions = @{
  "Sides" = "Crispy fries, wings, tenders and golden sides"
  "baked potato" = "Oven-baked loaded potatoes"
  "WRAPS AND SUBS" = "Wraps and Lebanese-style subs"
  "Beef Burger" = "Char-grilled beef burgers"
  "ANGUS BURGERS" = "Premium black Angus patties"
  "Chicken Burger" = "Grilled and crispy chicken burgers"
  "upgrade" = "Make it a combo meal"
  "Soft Drink" = "Soft drinks and refreshments"
  "add on's" = "Sauces, dips and extras"
  "value meals" = "Special offers and promos"
}

$lines = @()
$lines += "import type { Category, MenuItem } from `"@/types/menu`";"
$lines += "import extracted from `"./menu-extracted.json`";"
$lines += ""
$lines += "const PLACEHOLDER_IMAGE = `"https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/2.jpg`";"
$lines += ""
$lines += "export const DELIVERY_FEE = 0;"
$lines += ""
$lines += "const categoryMeta: Record<string, { name: string; description: string }> = {"

foreach ($cat in $data.categories) {
  $key = $cat.name
  $display = $displayNames[$key]
  if (-not $display) { $display = $cat.name }
  $desc = $categoryDescriptions[$key]
  if (-not $desc) { $desc = $cat.description }
  $lines += "  `"$($cat.id)`": { name: `"$display`", description: `"$desc`" },"
}
$lines += "};"
$lines += ""
$lines += "export const categories: Category[] = extracted.categories"
$lines += "  .map((cat) => ({"
$lines += "    id: cat.id,"
$lines += "    name: categoryMeta[cat.id]?.name ?? cat.name,"
$lines += "    slug: cat.slug,"
$lines += "    description: categoryMeta[cat.id]?.description ?? cat.description,"
$lines += "    sortOrder: cat.sortOrder,"
$lines += "  }))"
$lines += "  .sort((a, b) => a.sortOrder - b.sortOrder);"
$lines += ""
$lines += "export const menuItems: MenuItem[] = extracted.menuItems.map((item) => ({"
$lines += "  id: item.id,"
$lines += "  name: item.name,"
$lines += "  slug: item.slug,"
$lines += "  description: item.description,"
$lines += "  price: item.price,"
$lines += "  categoryId: item.categoryId,"
$lines += "  imageUrl: item.imageUrl ?? PLACEHOLDER_IMAGE,"
$lines += "  isFeatured: item.isFeatured,"
$lines += "  isPopular: item.isPopular,"
$lines += "  isAvailable: item.isAvailable,"
$lines += "  tags: item.tags,"
$lines += "}));"
$lines += ""
$lines += "export { extracted as menuExtracted };"

$lines -join "`n" | Set-Content $menuTsPath -Encoding UTF8

$restaurantLines = @(
  "export const restaurantInfo = {"
  "  name: `"Bob's Burger`","
  "  legalName: `"$($r.legalName)`","
  "  tagline: `"Craft burgers & more — delivered across Lebanon`","
  "  phone: `"70/012 935`","
  "  phoneSecondary: `"05/807 432`","
  "  email: `"$($r.email)`","
  "  whatsapp: `"$($r.whatsappOrder)`","
  "  address: {"
  "    street: `"$($r.address.street)`","
  "    city: `"$($r.address.city)`","
  "    state: `"$($r.address.state)`","
  "    country: `"$($r.address.country)`","
  "  },"
  "  coordinates: { lat: $($r.coordinates.lat), lng: $($r.coordinates.lng) },"
  "  hours: ["
  "    { days: `"Daily`", time: `"Check Instagram for hours`" },"
  "  ],"
  "  social: {"
  "    instagram: `"$($r.instagram)`","
  "    facebook: `"https://www.facebook.com/$($r.facebook)`","
  "  },"
  "  branding: {"
  "    logo: `"$($r.brandLogo)`","
  "    cover: `"$($r.coverImage)`","
  "  },"
  "} as const;"
)

$restaurantLines -join "`n" | Set-Content $restaurantTsPath -Encoding UTF8
Write-Host "Generated menu.ts and restaurant.ts"
