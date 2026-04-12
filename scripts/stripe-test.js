const fs = require("fs");
const path = require("path");

const SELLABLE_TYPES = new Set(["vinyl", "rarity", "test-pressing"]);
const PLACEHOLDER_MARKERS = ["REPLACE_25_DOLLAR_LINK", "REPLACE_49_DOLLAR_LINK"];

function parseArgs(argv) {
  const options = {
    createSession: false,
    product: "",
    quantity: 1
  };

  argv.forEach((arg) => {
    if (arg === "--create-session") options.createSession = true;
    if (arg.startsWith("--product=")) options.product = arg.split("=")[1] || "";
    if (arg.startsWith("--quantity=")) {
      const parsed = Number.parseInt(arg.split("=")[1], 10);
      options.quantity = Number.isFinite(parsed) ? parsed : 1;
    }
  });

  return options;
}

function toAbs(relPath) {
  return path.resolve(__dirname, "..", relPath);
}

function readStripeConfigWarnings() {
  const warnings = [];
  const stripeConfigPath = toAbs("stripe-config.js");

  try {
    const raw = fs.readFileSync(stripeConfigPath, "utf8");
    PLACEHOLDER_MARKERS.forEach((marker) => {
      if (raw.includes(marker)) {
        warnings.push(
          `stripe-config.js still contains placeholder '${marker}'. Fallback links will not work if API checkout fails.`
        );
      }
    });
  } catch (error) {
    warnings.push(`Unable to read stripe-config.js: ${error.message}`);
  }

  return warnings;
}

function readProducts() {
  const { STRIPE_PRODUCTS } = require("../netlify/functions/_stripe-products");
  return STRIPE_PRODUCTS || {};
}

function chooseProduct(products, preferredKey) {
  if (preferredKey && products[preferredKey]) return preferredKey;

  const sellable = Object.entries(products).find(([, product]) =>
    SELLABLE_TYPES.has(product && product.inventoryType)
  );

  return sellable ? sellable[0] : "";
}

function printHeader(title) {
  console.log("\n=== " + title + " ===");
}

function printList(lines, kind) {
  if (!lines.length) return;
  const prefix = kind === "error" ? "x" : "!";
  lines.forEach((line) => console.log(`${prefix} ${line}`));
}

function envChecks() {
  const errors = [];
  const warnings = [];

  const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  const shippingRate = (process.env.STRIPE_SHIPPING_RATE_STANDARD_ID || "").trim();
  const siteUrl = (process.env.SITE_URL || "").trim();

  if (!stripeSecretKey) {
    errors.push("STRIPE_SECRET_KEY is missing.");
  } else if (!stripeSecretKey.startsWith("sk_test_")) {
    warnings.push(
      "STRIPE_SECRET_KEY does not start with 'sk_test_'. You are likely using a live key."
    );
  }

  if (!shippingRate) {
    errors.push("STRIPE_SHIPPING_RATE_STANDARD_ID is missing.");
  } else if (!shippingRate.startsWith("shr_")) {
    warnings.push("STRIPE_SHIPPING_RATE_STANDARD_ID does not look like a Stripe shipping rate id (shr_...).");
  }

  if (!siteUrl) {
    warnings.push("SITE_URL is not set. Function will fallback to https://poisonwellrecords.com.");
  }

  return { errors, warnings };
}

async function createSession(productKey, quantity) {
  const { handler } = require("../netlify/functions/create-checkout-session");
  const event = {
    httpMethod: "POST",
    body: JSON.stringify({
      productKey,
      quantity,
      cancelPath: "/checkout-cancelled.html"
    })
  };

  return handler(event);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const env = envChecks();
  const linkWarnings = readStripeConfigWarnings();
  const products = readProducts();

  const productKey = chooseProduct(products, options.product);
  const product = productKey ? products[productKey] : null;

  const productErrors = [];
  const productWarnings = [];

  if (!productKey) {
    productErrors.push(
      "No sellable product found. Ensure _data/products has at least one product with inventoryType 'vinyl', 'rarity', or 'test-pressing'."
    );
  } else {
    if (!SELLABLE_TYPES.has(product.inventoryType)) {
      productErrors.push(
        `Product '${productKey}' has inventoryType '${product.inventoryType}', which is not sold by on-site Stripe checkout.`
      );
    }
    if (!Number.isFinite(product.unitAmount) || product.unitAmount <= 0) {
      productErrors.push(`Product '${productKey}' has an invalid unitAmount.`);
    }
    if (!product.name) {
      productWarnings.push(`Product '${productKey}' is missing a display name.`);
    }
  }

  printHeader("Stripe Test Preflight");
  console.log(`Mode: ${options.createSession ? "create test session" : "preflight only"}`);
  console.log(`Selected product: ${productKey || "(none)"}`);
  if (product) {
    console.log(`Product type: ${product.inventoryType || "unknown"}`);
    console.log(`Price (cents): ${product.unitAmount}`);
  }

  const allErrors = [...env.errors, ...productErrors];
  const allWarnings = [...env.warnings, ...productWarnings, ...linkWarnings];

  printList(allWarnings, "warn");
  printList(allErrors, "error");

  if (allErrors.length) {
    console.error("\nPreflight failed. Fix the errors above and run again.");
    process.exit(1);
  }

  if (!options.createSession) {
    console.log("\nPreflight passed. Ready to run a Stripe test checkout session.");
    console.log("Run: npm run stripe:test:session");
    return;
  }

  printHeader("Creating Stripe Checkout Session");
  try {
    const response = await createSession(productKey, options.quantity);
    const body = JSON.parse(response.body || "{}");
    if (response.statusCode !== 200 || !body.url) {
      throw new Error(body.error || `Unexpected response status ${response.statusCode}`);
    }
    console.log("Checkout session created successfully.");
    console.log("Open this URL to complete Stripe test checkout:");
    console.log(body.url);
  } catch (error) {
    console.error(`Failed to create test checkout session: ${error.message}`);
    process.exit(1);
  }
}

main();
