window.POISON_WELL_STRIPE_LINKS = {
  // Optional fallback Stripe Payment Links for record inventory.
  // Primary record checkout now uses the server-side Netlify function.
  // This file is shipped to the browser. Do not store Stripe secret keys here.
  // Format: https://buy.stripe.com/test_... (placeholders for demo/testing only)
  drKnowLiveCbgb1989: "https://buy.stripe.com/test_14k4gK6zA0mH5bC6op",
  frontStreetKnuckleDraggers: "https://buy.stripe.com/test_5kA6rYbGd0mJ4a0dQR",
  narthexStructure1984: "https://buy.stripe.com/test_a1B2cD3eF0gH6i7jKL",
  rawSickLove: "https://buy.stripe.com/test_abC12dEfG0hI9jKlmN",
  rawQuarantine: "https://buy.stripe.com/test_9LmN0opQrS1tUvWxYZ",
  theMissing23rdEndOfAnError: "https://buy.stripe.com/test_7GhI8jKlM0nOpQ2rST",
  iDeclineFailureByDesign: "https://buy.stripe.com/test_3AbC4dEfG0hI5jKlm",
  iDecline: "https://buy.stripe.com/test_6XyZ7wVbC0sT9uOpQr",
  shimComeQuickDenimLeatherAndChains: "https://buy.stripe.com/test_8UvWxYzA0bC1dEfGhI",
  losBonedrivers: "https://buy.stripe.com/test_0QrStUvWxY1zAbCdEf"
};

window.goToCheckout = async function(productKey, buttonEl) {
  const originalContent = buttonEl ? buttonEl.innerHTML : 'Buy Now';
  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.innerHTML = '<span class="loading-spinner"></span> Processing...';
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productKey: productKey })
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Checkout initialization failed.');
    }
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    alert('Checkout Unavailable: ' + err.message + '\n\nPlease ensure STRIPE_SECRET_KEY is set in Netlify.');
    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.innerHTML = originalContent;
    }
  }
};
