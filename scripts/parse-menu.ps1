$jsonPath = Join-Path $env:USERPROFILE ".cursor\browser-logs\cdp-response-Runtime.evaluate-2026-06-13T15-32-51-983Z.json"
$outPath = Join-Path $PSScriptRoot "..\src\data\menu-extracted.json"

$raw = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$menuData = $raw.result.value | ConvertFrom-Json

$restaurant = @{
  name = "Bob's Burger"
  legalName = "BOB'S BURGER & MORE S.A.R.L"
  tagline = "For Delivery"
  logo = "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/2.jpg"
  phones = @("70/012 935", "05/807 432", "70 033 430", "70 012 935")
  whatsappOrder = "96170583901"
  email = "ahmad.kob.1@gmail.com"
  address = @{
    street = "Near Zarifa Cafe"
    city = "Aramoun"
    state = "Lebanon"
    country = "Lebanon"
  }
  instagram = "https://www.instagram.com/bobburger.lb"
  facebook = "bobs burger & more sarl"
  currency = "LBP"
  currencySymbol = "LL"
  coordinates = @{ lat = 33.790275857563; lng = 35.48766374588 }
  brandLogo = "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/2.jpg"
  coverImage = "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/cover8_2.jpg"
  sourceMenuUrl = "https://menu.omegasoftware.ca/bobs"
}

$categories = @()
$menuItems = @()
$sortOrder = 1

foreach ($section in $menuData.menu) {
  $slug = ($section.DESCRIPTION -replace "[^a-zA-Z0-9]+", "-" -replace "^-|-$", "").ToLower()
  $catId = "cat-$slug"
  $categories += @{
    id = $catId
    name = $section.DESCRIPTION
    slug = $slug
    description = $section.DESCRIPTION
    sortOrder = $sortOrder
    imageUrl = $section.PIC
    sourceId = $section.ID
  }
  $sortOrder++

  foreach ($group in $section.groups) {
    foreach ($item in $group.items) {
      $itemSlug = ($item.ITEMNAME -replace "[^a-zA-Z0-9]+", "-" -replace "^-|-$", "").ToLower()
      $menuItems += @{
        id = "item-$($item.ID)"
        sourceId = $item.ID
        name = $item.ITEMNAME
        slug = "$itemSlug-$($item.ID)"
        description = if ($item.ITEMDESCRIPTION) { $item.ITEMDESCRIPTION } else { "" }
        price = $item.PRICE
        priceLbp = $item.PRICE
        categoryId = $catId
        categoryName = $section.DESCRIPTION
        groupName = $group.GROUPNAME
        imageUrl = if ($item.PIC) { $item.PIC } else { $null }
        isFeatured = ($item.NEWITEM -eq -1)
        isPopular = ($item.POPULAR -eq -1)
        isAvailable = $true
        tags = @()
      }
    }
  }
}

$output = @{
  extractedAt = (Get-Date).ToString("o")
  source = @{
    menu = "https://menu.omegasoftware.ca/bobs"
    instagram = "https://www.instagram.com/bobburger.lb"
  }
  restaurant = $restaurant
  categories = $categories
  menuItems = $menuItems
  stats = @{
    totalCategories = $categories.Count
    totalItems = $menuItems.Count
    itemsWithImages = ($menuItems | Where-Object { $_.imageUrl }).Count
    popularItems = ($menuItems | Where-Object { $_.isPopular }).Count
    featuredItems = ($menuItems | Where-Object { $_.isFeatured }).Count
  }
}

$output | ConvertTo-Json -Depth 10 | Set-Content $outPath -Encoding UTF8
Write-Host "Wrote $($menuItems.Count) items to $outPath"
