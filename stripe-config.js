/**
 * Optional Stripe Payment Link fallbacks (public URLs only).
 * Used by site.js when Checkout API fails; keys must match product `id` in _data/products/*.json
 */
window.POISON_WELL_STRIPE_LINKS = window.POISON_WELL_STRIPE_LINKS || {};

// TODO: replace with your real Stripe Payment Links.
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
  shimComeQuickInBetween: STRIPE_LINK_25,
  stalag13InControl: STRIPE_LINK_25,
  illReputeWhatsNext: STRIPE_LINK_25,
  falseConfession1984: STRIPE_LINK_25,
  agressionFullCircle: STRIPE_LINK_25,
  rklLiveBerlin: STRIPE_LINK_25,
  scaredStraightBornWild: STRIPE_LINK_25
});
