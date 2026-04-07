# Poison Well — post-deploy checks

Your live site URL (replace if you use a custom domain):

**`https://poisonwellrecords.netlify.app`**

---

## 1. Google Rich Results (schema / FAQ)

1. Open **[Google Rich Results Test](https://search.google.com/test/rich-results)**.
2. Paste your URL (start with the homepage, then `/faq.html`).
3. Click **Test URL**.
4. Fix any **errors** (warnings are optional). If something fails, note which page and which schema type.

---

## 2. Social / Open Graph previews

These show how links look when shared (image, title, description).

| Tool | What to paste |
|------|----------------|
| **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)** | Homepage URL, then **Scrape Again** if you changed meta tags. |
| **[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)** | Same URL (optional). |

Twitter/X often uses the same `og:` / `twitter:` tags; after deploy, share a link in a DM to yourself to confirm the image loads.

---

## 3. Stripe checkout (real end-to-end)

**Prerequisites (Netlify → Site → Environment variables):**

- `STRIPE_SECRET_KEY` — live secret from [Stripe Dashboard](https://dashboard.stripe.com/apikeys) (or test key for a test order).
- `STRIPE_SHIPPING_RATE_STANDARD_ID` — required for physical vinyl (see `create-checkout-session.js`).
- `SITE_URL` — e.g. `https://poisonwellrecords.netlify.app` (no trailing slash).

**Payment Link fallbacks** (`stripe-config.js`):

- Replace `REPLACE_25_DOLLAR_LINK` and `REPLACE_49_DOLLAR_LINK` with real **`buy.stripe.com/...`** links from Stripe **Payment Links**, or checkout will only work when the Netlify function succeeds.

**Manual click test (desktop + phone):**

1. Homepage → pick **Buy Vinyl** on a few titles (include **Dr. Know**).
2. Shop page → same for **Shim Come Quick** and one other title.
3. Confirm you reach Stripe, totals look right, and **cancel** returns to your site (or complete a small test payment in **Test mode** first).

**$65 free shipping:** Banner text is on the site; confirming the **discount or free shipping** actually applies requires one test cart at or above $65 in Stripe (or your shipping rules in Stripe Dashboard).

---

## 4. Optional: custom logo file

If you add **`assets/pwricon.png`**, you can point Organization schema / admin logo back to it. Until then, the site uses **`jamestown the pitts.png`** so image URLs do not 404.

---

## 5. Search Console (after go-live)

1. **[Google Search Console](https://search.google.com/search-console)** → add property → verify (HTML tag or DNS).
2. Submit sitemap if you have one (`sitemap.xml`).

---

## Quick “all green” summary

- [ ] Rich Results: homepage + FAQ — no errors  
- [ ] Share debug — image + title look correct  
- [ ] Stripe env vars set on Netlify  
- [ ] Real Payment Link URLs in `stripe-config.js` (or rely only on API)  
- [ ] Test checkout completes or cancels cleanly  
- [ ] Spot-check **Buy Vinyl** from homepage and shop on mobile  
