/**
 * Optional Stripe Payment Link fallbacks (public URLs only).
 * Used by site.js when Checkout API fails; keys must match product `id` in _data/products/*.json
 *
 * Production checklist (Netlify → Site settings → Environment variables):
 *   STRIPE_SECRET_KEY           — required for /api/create-checkout-session
 *   STRIPE_SHIPPING_RATE_STANDARD_ID — required for vinyl / rarity / test-pressing checkout
 *   SITE_URL                    — canonical site URL (no trailing slash)
 *   STRIPE_ALLOWED_COUNTRIES    — optional, default US (comma-separated ISO codes)
 *   STRIPE_AUTOMATIC_TAX          — optional, set to "true" to enable Stripe Tax
 *
 * Replace the placeholder Payment Links below with your real buy.stripe.com URLs
 * (one per price tier is fine; map each product id to the correct link).
 */
window.POISON_WELL_STRIPE_LINKS = window.POISON_WELL_STRIPE_LINKS || {};

const STRIPE_LINK_25 = "https://buy.stripe.com/REPLACE_25_DOLLAR_LINK";
const STRIPE_LINK_49 = "https://buy.stripe.com/REPLACE_49_DOLLAR_LINK";

Object.assign(window.POISON_WELL_STRIPE_LINKS, {
  drKnowLiveCbgb1989: STRIPE_LINK_49,
  losBonedrivers: STRIPE_LINK_25,
  slimComeQuickDenimLeatherAndChains: STRIPE_LINK_25,
  thePittsJamestown: STRIPE_LINK_25,
  narthexStructure1984: STRIPE_LINK_25,
  rawSickLove: STRIPE_LINK_25,
  theMissing23rdEndOfAnError: STRIPE_LINK_25,
  iDeclineFailureByDesign: STRIPE_LINK_25,
  iDecline: STRIPE_LINK_25,
  frontStreetKnuckleDraggers: STRIPE_LINK_25,
  /** Rarity-tier fallbacks — replace with real $80 Payment Links when placeholders are swapped */
  fluidFilledIDecline: STRIPE_LINK_49,
  splatterIDecline: STRIPE_LINK_49
});
