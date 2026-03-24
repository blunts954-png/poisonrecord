# Payments and Fulfillment Setup

## Stripe for Vinyl, Rarities, and Test Pressings

1. Create a Stripe account and keep the secret key in Netlify only.
2. In Stripe Dashboard, create at least one Shipping Rate and copy its `shr_...` id.
3. In Netlify site settings, add:
   - `SITE_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_SHIPPING_RATE_STANDARD_ID`
   - `STRIPE_SHIPPING_RATE_EXPEDITED_ID` (optional)
   - `STRIPE_ALLOWED_COUNTRIES`
   - `STRIPE_AUTOMATIC_TAX`
4. Redeploy the site.

## CJ Dropshipping for Apparel

1. Create the POD products in CJ Dropshipping.
2. Copy the public CJ product URLs for each product or variant.
3. Paste those URLs into `cj-config.js`.
4. Redeploy the site.

## Current Split

- Records use a Netlify function that creates a server-side Stripe Checkout Session.
- Apparel buttons open CJ Dropshipping product pages.
- No Stripe or CJ secrets belong in browser-loaded files.
