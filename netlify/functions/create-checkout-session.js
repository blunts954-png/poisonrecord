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

function parseBody(rawBody) {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return null;
  }
}

function clampQuantity(value, maxQuantity) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(maxQuantity || 1, parsed));
}

function sanitizePath(inputPath) {
  if (typeof inputPath !== "string" || !inputPath.startsWith("/")) {
    return "/";
  }
  if (inputPath.startsWith("//")) {
    return "/";
  }
  return inputPath;
}

function resolveSiteUrl(headers) {
  const configured = (process.env.SITE_URL || "").trim().replace(/\/$/, "");
  if (configured) return configured;

  const forwardedProto = headers["x-forwarded-proto"] || "https";
  const forwardedHost = headers["x-forwarded-host"] || headers.host;
  if (forwardedHost) {
    return forwardedProto + "://" + forwardedHost;
  }

  return "https://poisonwellrecords.netlify.app";
}

function parseAllowedCountries() {
  const configured = (process.env.STRIPE_ALLOWED_COUNTRIES || "US")
    .split(",")
    .map(function (value) { return value.trim().toUpperCase(); })
    .filter(Boolean);

  return configured.length ? configured : ["US"];
}

function buildShippingOptions() {
  const shippingOptions = [];
  const standardRate = (process.env.STRIPE_SHIPPING_RATE_STANDARD_ID || "").trim();
  const cjRate = (process.env.STRIPE_SHIPPING_RATE_CJ_ID || process.env.STRIPE_SHIPPING_RATE_EXPEDITED_ID || "").trim();

  if (standardRate) {
    shippingOptions.push({ shipping_rate: standardRate });
  }
  if (cjRate) {
    shippingOptions.push({ shipping_rate: cjRate });
  }

  return shippingOptions;
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const body = parseBody(event.body);
  if (!body) {
    return json(400, { error: "Invalid JSON body." });
  }

  const productKey = typeof body.productKey === "string" ? body.productKey.trim() : "";
  const product = STRIPE_PRODUCTS[productKey];
  if (!product) {
    return json(400, { error: "Unknown product key." });
  }

  const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!stripeSecretKey) {
    return json(500, {
      error: "Stripe secret key is not configured. Add STRIPE_SECRET_KEY in Netlify environment variables."
    });
  }

  const shippingOptions = buildShippingOptions();
  if (shippingOptions.length === 0) {
    return json(500, {
      error: "Stripe shipping rates are not configured. Add STRIPE_SHIPPING_RATE_STANDARD_ID before going live."
    });
  }

  const quantity = clampQuantity(body.quantity, product.maxQuantity || 1);
  const cancelPath = sanitizePath(body.cancelPath || "/ventura-punk-record-store-online");
  const siteUrl = resolveSiteUrl(event.headers || {});
  const imageUrl = siteUrl + product.imagePath;
  const stripe = new Stripe(stripeSecretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: siteUrl + "/order-confirmation?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + cancelPath,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true
      },
      shipping_address_collection: {
        allowed_countries: parseAllowedCountries()
      },
      shipping_options: shippingOptions,
      automatic_tax: {
        enabled: String(process.env.STRIPE_AUTOMATIC_TAX).toLowerCase() === "true"
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: product.unitAmount,
            product_data: {
              name: product.name,
              description: product.description,
              images: [imageUrl],
              metadata: {
                productKey: productKey,
                inventoryType: product.inventoryType
              }
            }
          },
          quantity: quantity
        }
      ],
      metadata: {
        productKey: productKey,
        inventoryType: product.inventoryType,
        cancelPath: cancelPath
      }
    });

    return json(200, {
      id: session.id,
      url: session.url
    });
  } catch (error) {
    return json(500, {
      error: error && error.message ? error.message : "Unable to create Stripe Checkout session."
    });
  }
};
