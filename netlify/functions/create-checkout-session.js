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

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return json(500, { error: "STRIPE_SECRET_KEY missing from environment variables." });
  }

  const shippingRate = process.env.STRIPE_SHIPPING_RATE_STANDARD_ID;
  if (product.inventoryType === 'vinyl' || product.inventoryType === 'rarity') {
    if (!shippingRate) {
      return json(500, { error: "STRIPE_SHIPPING_RATE_STANDARD_ID is not configured for physical products." });
    }
  }

  const stripe = new Stripe(stripeSecretKey);
  const siteUrl = (process.env.SITE_URL || "https://poisonwellrecords.netlify.app").replace(/\/$/, "");

  try {
    const sessionOptions = {
      mode: "payment",
      success_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/ventura-punk-record-store-online`,
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
          quantity: 1,
        }
      ],
      shipping_address_collection: {
        allowed_countries: (process.env.STRIPE_ALLOWED_COUNTRIES || "US").split(",").map(c => c.trim().toUpperCase())
      }
    };

    // Only apply shipping options if a rate exists and it's a physical product
    if (shippingRate && (product.inventoryType === 'vinyl' || product.inventoryType === 'rarity')) {
      sessionOptions.shipping_options = [{ shipping_rate: shippingRate }];
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return json(200, { url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    return json(500, { error: `Stripe API Error: ${error.message}` });
  }
};
