# Cloudflare migration assets

This directory contains the staged D1/R2 migration work. Nothing here is
bound to the production Worker until the Supabase backup has completed and
the imported data has been verified.

## D1 schema

`d1/0001_initial.sql` preserves all current restaurant content tables and
historical profiles/orders. It also adds media metadata and a content version
record for cache invalidation.

The public application will use cached content with a bundled last-known-good
snapshot. Admin writes will update D1 and invalidate that cache. WhatsApp
checkout remains client-side and does not create D1 order traffic.

## Media plan

R2 will store original, display, and thumbnail variants under versioned keys.
Public URLs will be immutable and receive long-lived cache headers. The admin
upload flow will create the variants automatically; restaurant staff will not
need to optimize files manually.
