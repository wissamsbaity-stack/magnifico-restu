# Legacy Vercel QR redirect

This minimal deployment keeps `magnifico-restu.vercel.app` active for printed
QR codes. Vercel redirects every request to the matching path on
`https://magnificostreetfood.com` before serving any page. This keeps `/admin`
pointing at the production admin panel and contains no Next.js or Supabase code.
