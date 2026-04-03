const Stripe = require("stripe");
const { STRIPE_PRODUCTS } = require("./_stripe-products");

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  const rawBody = event.body;
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (parseError) {
    return json(400, { error: "Invalid JSON in request body." });
  }

  const productKey = body.productKey;
  if (!productKey) {
    return json(400, { error: "Missing productKey in request." });
  }

  const product = STRIPE_PRODUCTS[productKey];
  if (!product) {
    return json(400, { error: `Product '${productKey}' not found in catalog. Verify _data/products/ for correct JSON filename.` });
  }

  const isOnSiteStripeProduct = product.inventoryType === "rarity" || product.inventoryType === "vinyl";
  if (!isOnSiteStripeProduct) {
    return json(400, {
      error: "This item is not sold directly on the site. Please use its linked platform or contact Poison Well Records."
    });
  }

  const requestedQuantity = Number.parseInt(body.quantity, 10);
  const maxQuantity = Number.isFinite(product.maxQuantity) ? product.maxQuantity : 10;
  const quantity = Number.isFinite(requestedQuantity)
    ? Math.max(1, Math.min(maxQuantity, requestedQuantity))
    : 1;

  const requestedCancelPath = typeof body.cancelPath === "string" ? body.cancelPath.trim() : "";
  const cancelPath = requestedCancelPath.startsWith("/") && !requestedCancelPath.startsWith("//")
    ? requestedCancelPath
    : "/ventura-punk-record-store-online.html";

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return json(500, { error: "STRIPE_SECRET_KEY missing from environment variables." });
  }

  const shippingRate = process.env.STRIPE_SHIPPING_RATE_STANDARD_ID;
  const isPhysicalProduct = true;
  if (isPhysicalProduct) {
    if (!shippingRate) {
      return json(500, { error: "STRIPE_SHIPPING_RATE_STANDARD_ID is not configured for physical products." });
    }
  }

  const stripe = new Stripe(stripeSecretKey);
  const siteUrl = (process.env.SITE_URL || "https://poisonwellrecords.netlify.app").replace(/\/$/, "");
  const automaticTaxEnabled = String(process.env.STRIPE_AUTOMATIC_TAX || "").toLowerCase() === "true";

  try {
    const sessionOptions = {
      mode: "payment",
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${cancelPath}`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: product.unitAmount,
            product_data: {
              name: product.name,
              description: product.description,
              images: product.imagePath ? [siteUrl + product.imagePath] : [],
            }
          },
          quantity,
        }
      ],
      metadata: {
        productKey,
        inventoryType: product.inventoryType || "unknown",
        quantity: String(quantity)
      }
    };

    if (automaticTaxEnabled) {
      sessionOptions.automatic_tax = { enabled: true };
    }

    if (isPhysicalProduct) {
      sessionOptions.shipping_address_collection = {
        allowed_countries: (process.env.STRIPE_ALLOWED_COUNTRIES || "US").split(",").map(c => c.trim().toUpperCase())
      };
    }

    if (shippingRate && isPhysicalProduct) {
      sessionOptions.shipping_options = [{ shipping_rate: shippingRate }];
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return json(200, { url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    return json(500, { error: `Stripe API Error: ${error.message}` });
  }
};
