(function () {
  const baseUrl = 'https://poisonwellrecords.netlify.app';
  const pathMap = {
    'index.html': '/',
    'ventura-punk-vinyl.html': '/ventura-punk-vinyl',
    'apparel.html': '/apparel',
    'ventura-punk-record-store-online.html': '/ventura-punk-record-store-online',
    '805-punk-bands.html': '/805-punk-bands',
    'about-poison-well-records.html': '/about-poison-well-records',
    'contact-wholesale.html': '/contact-wholesale',
    'faq.html': '/faq',
    'press.html': '/press',
    'rarities.html': '/rarities',
    'dr-know-live-cbgb-1989-ventura-hardcore.html': '/dr-know-live-cbgb-1989-ventura-hardcore',
    'music-videos.html': '/music-videos',
    'digital-music-hub.html': '/digital-music-hub',
    'privacy-policy.html': '/privacy-policy',
    '805-punk-shows-events.html': '/805-punk-shows-events',
    'thank-you.html': '/thank-you'
  };
  let pageGateFailSafeTimer = null;

  function forceOpenSplashGate() {
    const gate = document.getElementById('splash-gate');
    document.body.classList.remove('gate-active');
    if (!gate) return;
    gate.classList.add('open', 'hide');
    gate.style.pointerEvents = 'none';
    gate.style.display = 'none';
    gate.setAttribute('aria-hidden', 'true');
  }

  // Never let the intro gate block access if a later initializer throws.
  const gateCheck = document.getElementById('splash-gate');
  if (gateCheck) {
    pageGateFailSafeTimer = window.setTimeout(forceOpenSplashGate, 14000);
  } else if (document.body.classList.contains('gate-active')) {
    // Immediate cleanup if class is present but gate is missing (ghosting fix)
    document.body.classList.remove('gate-active');
  }

  function currentFile() {
    const p = window.location.pathname;
    const f = p.split('/').pop();
    return f || 'index.html';
  }

  function currentCanonical() {
    const file = currentFile();
    const path = pathMap[file] || '/';
    return baseUrl + path;
  }

  function normalizePath(pathname) {
    let path = pathname || '/';
    if (!path.startsWith('/')) path = '/' + path;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path.endsWith('.html')) path = path.slice(0, -5);
    return path || '/';
  }

  const pagePath = normalizePath(window.location.pathname);
  const pageSlug = pagePath === '/' ? 'home' : pagePath.replace(/^\//, '').replace(/[^a-z0-9-]/gi, '-');
  document.body.classList.add('page-' + pageSlug);

  function markCurrentNavLink() {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll('header nav a[href]');
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.indexOf('mailto:') === 0 || href.indexOf('http') === 0) return;
      const hrefPath = normalizePath(href.split('#')[0]);
      if (hrefPath === currentPath) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function ensureGeoMeta() {
    const metas = [
      { name: 'geo.region', content: 'US-CA' },
      { name: 'geo.placename', content: 'Ventura' },
      { name: 'geo.position', content: '34.2746;-119.2290' },
      { name: 'ICBM', content: '34.2746, -119.2290' }
    ];
    metas.forEach(m => {
      if (!document.querySelector(`meta[name="${m.name}"]`)) {
        const el = document.createElement('meta');
        el.name = m.name;
        el.content = m.content;
        document.head.appendChild(el);
      }
    });
  }

  function ensureFavicon() {
    if (!document.querySelector('link[rel*="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      // Use existing assets if possible, fallback to a logo-like file
      link.href = 'assets/Jamestown the pitts.png'; 
      document.head.appendChild(link);
    }
  }

  function ensureAlertBar() {
    const header = document.querySelector('.site-header, .topbar, header');
    if (!header) return;
    const releaseAnnouncement = document.body.getAttribute('data-release-announcement') || 'Dr. Know - Live CBGB 1989';
    const line =
      'NEW RELEASE ANNOUNCEMENT: <strong>' + releaseAnnouncement + '</strong> is live now. <a href="dr-know-live-cbgb-1989-ventura-hardcore.html">VIEW &amp; BUY -></a>';
    const alertMarkup =
      '<div class="alert-marquee">' +
      '<span>' + line + '</span>' +
      '<span aria-hidden="true">' + line + '</span>' +
      '</div>';
    const existing = document.querySelector('.alert-bar');
    if (existing) {
      existing.innerHTML = alertMarkup;
      return;
    }
    const alertBar = document.createElement('div');
    alertBar.className = 'alert-bar';
    alertBar.setAttribute('role', 'region');
    alertBar.setAttribute('aria-label', 'Limited pressing alert');
    alertBar.innerHTML = alertMarkup;
    header.insertAdjacentElement('afterend', alertBar);
  }

  function ensureVinylBackground() {
    let spinner = document.querySelector('.vinyl-bg-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'vinyl-bg-spinner';
      spinner.setAttribute('aria-hidden', 'true');
      document.body.insertAdjacentElement('afterbegin', spinner);
    }
    let labelEl = document.querySelector('.vinyl-band-label');
    if (!labelEl) {
      labelEl = document.createElement('span');
      labelEl.className = 'vinyl-band-label';
      labelEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(labelEl);
    }
    const bandLabels = {
      '/': { band: 'Dr. Know', color: '#e85c0d', label: 'CBGB 1989' },
      '/ventura-punk-record-store-online': { band: 'RAW', color: '#f5a623', label: 'Sick Love' },
      '/apparel': { band: 'Poison Well', color: '#cc2200', label: '805 Merch' },
      '/805-punk-bands': { band: 'I Decline', color: '#b5651d', label: 'SoCal HC' },
      '/about-poison-well-records': { band: 'Narthex', color: '#8b4513', label: '1984' },
      '/contact-wholesale': { band: 'Front Street', color: '#d2691e', label: 'Knuckle Draggers' },
      '/faq': { band: 'Los Bonedrivers', color: '#cd853f', label: 'Distro' },
      '/dr-know-live-cbgb-1989-ventura-hardcore': { band: 'Dr. Know', color: '#ff4500', label: 'Live CBGB' }
    };
    const currentPath = normalizePath(window.location.pathname);
    const data = bandLabels[currentPath] || bandLabels['/'];
    if (!data) return;
    spinner.style.setProperty('--label-color', data.color);
    spinner.setAttribute('data-band', data.band);
    labelEl.textContent = data.band.toUpperCase();
    labelEl.style.color = data.color;
  }

  function initNavToggle() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    function setNavState(isOpen) {
      toggle.setAttribute('aria-expanded', String(isOpen));
      nav.classList.toggle('open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    }

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setNavState(!isOpen);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setNavState(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setNavState(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 800) {
        setNavState(false);
      }
    });
  }

  function initBackToTop() {
    if (document.querySelector('.back-to-top')) return;
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }





  const images = document.querySelectorAll('img');
  const imagePathFixes = {
    '/assets/Jamestown the pitts.png': '/assets/jamestown the pitts.png',
    '/assets/handsome devils - VTK.jpg': '/assets/handsome devils - vtk.jpg',
    '/assets/Narthex Structure - Expression.jpg': '/assets/narthex structure - expression.jpg',
    '/assets/Rubberband - babe magnet.webp': '/assets/rubberband - babe magnet.webp'
  };
  const fallbackCover = '/assets/idecline-skull-headed.jpg';
  images.forEach(function (img) {
    const currentSrc = img.getAttribute('src');
    if (currentSrc && imagePathFixes[currentSrc]) {
      img.setAttribute('src', imagePathFixes[currentSrc]);
    }
    img.addEventListener('error', function () {
      // Prevent broken placeholders from surviving in production on case-sensitive hosts.
      if (img.dataset.fallbackApplied === 'true') return;
      img.dataset.fallbackApplied = 'true';
      img.setAttribute('src', fallbackCover);
    });
    if (!img.getAttribute('alt')) img.setAttribute('alt', 'Poison Well Records - Ventura Punk Vinyl & Culture');
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  });

  const yearNodes = document.querySelectorAll('[data-current-year]');
  const y = new Date().getFullYear();
  yearNodes.forEach(function (n) { n.textContent = String(y); });

  const footerCreditLinks = document.querySelectorAll('.footer-credit');
  footerCreditLinks.forEach(function (node) {
    if (!node || node.querySelector('a')) return;
    const text = (node.textContent || '').trim();
    if (!/chaoticallyorganizedai\.com/i.test(text)) return;
    node.innerHTML = 'Powered by <a href="https://chaoticallyorganizedai.com" target="_blank" rel="noopener noreferrer">Chaotically Organized AI.com</a>';
  });

  const jsonLdNodes = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  const hasOrgSchema = jsonLdNodes.some(function (n) { return n.textContent.includes('"@type": "Organization"'); });
  const hasStoreSchema = jsonLdNodes.some(function (n) { return n.textContent.includes('"@type": "Store"'); });

  if (!hasOrgSchema) {
    const org = document.createElement('script');
    org.type = 'application/ld+json';
    org.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Poison Well Records',
      description: 'Ventura 805 punk vinyl label and online store archiving SoCal punk rock',
      url: baseUrl,
      logo: baseUrl + '/assets/jamestown%20the%20pitts.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ventura',
        addressRegion: 'CA',
        postalCode: '93001',
        addressCountry: 'US'
      },
      sameAs: [
        'https://www.tiktok.com/@poisonwellrecords',
        'https://www.instagram.com/poisonwellrecords',
        'https://www.discogs.com/user/PoisonWellRecords',
        'https://poisonwellrecords.bandcamp.com',
        'https://www.facebook.com/poisonwellrecords/',
        'https://www.youtube.com/@poisonwellrecords'
      ]
    });
    document.head.appendChild(org);
  }

  if (!hasStoreSchema) {
    const store = document.createElement('script');
    store.type = 'application/ld+json';
    store.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Store',
      'name': 'Poison Well Records Shop',
      'image': baseUrl + '/assets/jamestown%20the%20pitts.png',
      'description': '805 and SoCal punk vinyl record store and label shipping worldwide from Ventura, California',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Ventura',
        'addressRegion': 'CA',
        'addressCountry': 'US'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '34.2746',
        'longitude': '-119.2290'
      },
      'url': baseUrl + '/ventura-punk-record-store-online',
      'priceRange': '$$',
      'paymentAccepted': 'Stripe, Credit Card',
      'currenciesAccepted': 'USD'
    });
    document.head.appendChild(store);
  }

  const hasBreadcrumbSchema = jsonLdNodes.some(function (n) { return n.textContent.includes('"@type":"BreadcrumbList"') || n.textContent.includes('"@type": "BreadcrumbList"'); });
  if (!hasBreadcrumbSchema) {
    const crumbLabel = {
      '/': 'Home',
      '/apparel': 'Apparel',
      '/ventura-punk-record-store-online': 'Vinyl',
      '/805-punk-bands': 'Artists & 805 Archive',
      '/about-poison-well-records': 'About',
      '/contact-wholesale': 'Contact / Wholesale',
      '/faq': 'FAQ',
      '/dr-know-live-cbgb-1989-ventura-hardcore': 'Dr. Know Live CBGB 1989',
      '/digital-music-hub': 'Digital Music Hub',
      '/privacy-policy': 'Privacy Policy',
      '/805-punk-shows-events': '805 Shows & Events',
      '/ventura-punk-vinyl': 'Ventura Punk Vinyl',
      '/press': 'Press',
      '/rarities': 'Rarities'
    };
    const canon = currentCanonical();
    const suffix = canon.replace(baseUrl, '') || '/';
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl + '/' }]
    };
    if (suffix !== '/') {
      breadcrumb.itemListElement.push({ '@type': 'ListItem', position: 2, name: crumbLabel[suffix] || document.title, item: canon });
    }
    const crumbNode = document.createElement('script');
    crumbNode.type = 'application/ld+json';
    crumbNode.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(crumbNode);
  }

  const stripeLinks = window.POISON_WELL_STRIPE_LINKS || {};

  /** Netlify Forms expects POST to the current page path (not always `/`). */
  function netlifyFormPostPath() {
    var p = window.location.pathname || '/';
    if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
    return p;
  }

  function clampCheckoutQuantity(value, max) {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.min(max || 10, parsed));
  }

  function setCheckoutBusy(triggerEl, isBusy, busyLabel) {
    if (!triggerEl) return;
    if (!triggerEl.dataset.originalLabel) {
      triggerEl.dataset.originalLabel = triggerEl.textContent.trim();
    }
    triggerEl.disabled = !!isBusy;
    triggerEl.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    triggerEl.textContent = isBusy ? (busyLabel || 'Loading...') : triggerEl.dataset.originalLabel;
  }

  function fallbackToStripePaymentLink(productKey, quantity) {
    const checkoutUrl = stripeLinks[productKey];
    if (!checkoutUrl) return false;
    const url = quantity > 1 ? (checkoutUrl + '?qty=' + quantity) : checkoutUrl;
    window.location.href = url;
    return true;
  }

  async function createStripeCheckoutSession(productKey, options) {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productKey: productKey,
        quantity: options.quantity || 1,
        cancelPath: options.cancelPath || (window.location.pathname + window.location.search + window.location.hash)
      })
    });

    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || 'Unable to start Stripe checkout.');
    }
    return payload;
  }

  window.goToCheckout = async function (productKey, triggerEl) {
    setCheckoutBusy(triggerEl, true, 'Opening Stripe...');
    try {
      const payload = await createStripeCheckoutSession(productKey, {
        quantity: 1,
        cancelPath: window.location.pathname + window.location.search + window.location.hash
      });
      window.location.href = payload.url;
    } catch (error) {
      setCheckoutBusy(triggerEl, false);
      if (fallbackToStripePaymentLink(productKey, 1)) {
        return;
      }
      alert(error && error.message ? error.message : 'Stripe checkout is unavailable right now.');
    }
  };

  // Variant-aware checkout helper: accepts a base product key and the card element
  window.goToCheckoutVariant = async function (baseKey, cardEl, triggerEl) {
    if (!cardEl) cardEl = document.querySelector('.card');
    const size = (cardEl.dataset.size) || (cardEl.querySelector('select') ? cardEl.querySelector('select').value : '');
    const qty = clampCheckoutQuantity((cardEl.querySelector('.qty-input') && cardEl.querySelector('.qty-input').value) || 1, 10);
    const variantKey = size ? (baseKey + '_' + size) : baseKey;
    setCheckoutBusy(triggerEl, true, 'Opening Stripe...');
    try {
      const payload = await createStripeCheckoutSession(variantKey, {
        quantity: qty
      });
      window.location.href = payload.url;
      return;
    } catch (error) {
      setCheckoutBusy(triggerEl, false);
      if (fallbackToStripePaymentLink(variantKey, qty) || fallbackToStripePaymentLink(baseKey, qty)) {
        return;
      }
      alert(error && error.message ? error.message : ('No checkout path configured for ' + variantKey + '.'));
    }
  };

  // Update buy button labels to reflect selected size and quantity
  window.updateBuyButton = function (cardEl) {
    if (!cardEl) return;
    const size = cardEl.dataset.size || (cardEl.querySelector('select') ? cardEl.querySelector('select').value : '');
    const qty = cardEl.querySelector('.qty-input') ? clampCheckoutQuantity(cardEl.querySelector('.qty-input').value || 1, 10) : 1;
    const priceNode = cardEl.querySelector('.price');
    const basePriceText = priceNode ? priceNode.textContent.trim() : '';
    const btn = cardEl.querySelector('.buy-btn');
    if (!btn) return;
    const labelPrefix = cardEl.dataset.provider === 'cj' ? 'Order on CJ ' : 'Buy ';
    const sizePart = size ? (size + ' ') : '';
    btn.textContent = labelPrefix + sizePart + '×' + qty + (basePriceText ? ' — ' + basePriceText : '');
    btn.dataset.originalLabel = btn.textContent;
  };

  // Initialize buy button labels on pages with apparel cards
  function initApparelUI() {
    const apparelCards = Array.from(document.querySelectorAll('main .card')).filter(function (card) {
      return !!(card.querySelector('select') || card.querySelector('.qty-input'));
    });
    apparelCards.forEach(function (card) {
      // set initial dataset.size from select if present
      const sel = card.querySelector('select');
      if (sel && !card.dataset.size) card.dataset.size = sel.value;
      // ensure qty input has sensible bounds
      const q = card.querySelector('.qty-input');
      if (q) {
        q.setAttribute('min', '1');
        q.setAttribute('max', '10');
        q.addEventListener('input', function () {
          if (parseInt(q.value || 0, 10) < 1) q.value = 1;
          if (parseInt(q.value || 0, 10) > 10) q.value = 10;
        });
      }
      // attach change listeners to selects
      if (sel) sel.addEventListener('change', function () { card.dataset.size = sel.value; window.updateBuyButton(card); });
      // update button label now
      window.updateBuyButton(card);
    });
  }
  // Run on DOM ready
  function initLatestRelease() {
    const target = document.getElementById('latest-release-cards');
    if (!target) return;
    // prefer the first release card inside the releases grid
    const first = document.querySelector('.release-grid .release-card') || document.querySelector('.release-card');
    if (!first) return;
    const clone = first.cloneNode(true);
    // Tweak clone: remove duplicate buy links and adjust copy for 'Latest Release'
    const links = clone.querySelectorAll('.release-links a');
    if (links && links.length > 1) {
      // keep only the first (View Release) and the first Buy-like link if present
      let kept = [];
      // keep first link (assumed "View Release")
      kept.push(links[0]);
      // find a buy link by text that contains 'Buy' or 'Buy Vinyl' or 'Buy Now'
      for (let i = 1; i < links.length; i++) {
        const t = (links[i].textContent || '').toLowerCase();
        if (t.indexOf('buy') !== -1) { kept.push(links[i]); break; }
      }
      // remove all link nodes and re-append the kept ones
      const parent = links[0].parentNode;
      parent.innerHTML = '';
      kept.forEach(function (lnk) { parent.appendChild(lnk); });
    }
    // Adjust release-hook copy to highlight newest drop
    const hook = clone.querySelector('.release-hook');
    if (hook) {
      if (!hook.textContent.toLowerCase().includes('new')) {
        hook.textContent = 'Newest drop — ' + hook.textContent.trim();
      }
    }
    // Remove any duplicate buy buttons elsewhere inside the clone
    const buyButtons = clone.querySelectorAll('.buy-btn');
    if (buyButtons && buyButtons.length > 1) {
      for (let i = 1; i < buyButtons.length; i++) buyButtons[i].remove();
    }
    // Add a CTA link to the cloned card that opens an email prefilled with the release title
    const titleNode = clone.querySelector('h3');
    const releaseTitle = titleNode ? titleNode.textContent.trim() : 'Poison Well Records release';
    const cta = document.createElement('a');
    cta.className = 'btn primary';
    cta.href = 'mailto:poisonwellrecords@gmail.com?subject=' + encodeURIComponent('Interested in buying: ' + releaseTitle);
    cta.textContent = 'Contact to Buy';
    // append CTA into release-links if present, otherwise to clone
    const relLinks = clone.querySelector('.release-links');
    if (relLinks) {
      const wrapper = document.createElement('div');
      wrapper.style.marginTop = '0.6rem';
      wrapper.appendChild(cta);
      relLinks.parentNode.insertBefore(wrapper, relLinks.nextSibling);
    } else {
      clone.appendChild(cta);
    }
    target.appendChild(clone);
  }

  // Add 'Contact to Buy' CTA to all existing release cards on the page
  function initReleaseCTAs() {
    if (!document.body.classList.contains('page-home')) return;
    const cards = document.querySelectorAll('.release-card');
    if (!cards || cards.length === 0) return;
    cards.forEach(function (card) {
      if (card.__ctaAdded) return;
      if (card.querySelector('.buy-btn')) { card.__ctaAdded = true; return; }
      const titleNode = card.querySelector('h3');
      const releaseTitle = titleNode ? titleNode.textContent.trim() : 'Poison Well Records release';
      const existing = card.querySelector('a[href^="mailto:"]');
      if (existing) { card.__ctaAdded = true; return; }
      const cta = document.createElement('a');
      cta.className = 'btn';
      cta.href = 'mailto:poisonwellrecords@gmail.com?subject=' + encodeURIComponent('Interested in buying: ' + releaseTitle);
      cta.textContent = 'Contact to Buy';
      // place CTA after release-links if present, otherwise append at end
      const relLinks = card.querySelector('.release-links');
      if (relLinks) {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '0.6rem';
        wrapper.appendChild(cta);
        relLinks.parentNode.insertBefore(wrapper, relLinks.nextSibling);
      } else {
        card.appendChild(cta);
      }
      card.__ctaAdded = true;
    });
  }

  function initStoreSearch() {
    const searchInput = document.getElementById('store-search') || document.getElementById('storeSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function (e) {
      const term = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.release-grid .release-card, .release-grid .vinyl-card');
      cards.forEach(function (card) {
        const h3 = card.querySelector('h3');
        const artist = card.querySelector('.artist');
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        const text = ((h3 ? h3.textContent : '') + ' ' + (artist ? artist.textContent : '') + ' ' + tags).toLowerCase();
        card.style.display = !term || text.indexOf(term) !== -1 ? '' : 'none';
      });
    });
  }

  function initContactWholesale() {
    const forms = document.querySelectorAll('form[name="contact"]');
    forms.forEach(function (form) {
      if (!form.hasAttribute('netlify')) return;
      if (form.__pwNetlifyAjax) return;
      form.__pwNetlifyAjax = true;
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const fd = new FormData(form);
        if (!fd.get('form-name')) fd.append('form-name', form.getAttribute('name') || 'contact');
        const params = new URLSearchParams();
        for (const pair of fd.entries()) params.append(pair[0], pair[1]);
        fetch(netlifyFormPostPath(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        }).then(function (res) {
          if (res.ok || res.status === 200 || res.status === 302) {
            window.location.href = '/thank-you';
            return;
          }
          form.submit();
        }).catch(function () {
          form.submit();
        }).finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
      });
    });
  }

/* --- CONSOLIDATED INITIALIZATION --- */
function initAll() {
    ensureGeoMeta();
    ensureFavicon();
    ensureAlertBar();
    ensureVinylBackground();
    initNavToggle();
    initBackToTop();
    initApparelUI();
    // Keep catalog order stable; avoid duplicating top release cards.
    // initLatestRelease();
    initReleaseCTAs();
    initStoreSearch();
    initContactWholesale();
    markCurrentNavLink();
}

document.addEventListener('DOMContentLoaded', initAll);

  const gate = document.getElementById('splash-gate');
  const splashVideo = document.getElementById('splash-video');
  const splashVideoWrap = document.getElementById('splash-video-wrap');
  const splashVideoCta = document.getElementById('splash-video-cta');
  const enterHint = document.getElementById('enter-hint');
  if (gate && splashVideo) {
    document.body.classList.add('gate-active');
    let introFollowRaf = null;
    let hideGateTimer = null;
    let forcedOpenTimer = null;
    let gateReleased = false;
    const clamp = function (value, min, max) {
      return Math.max(min, Math.min(max, value));
    };
    const clearGateTimers = function () {
      if (hideGateTimer) {
        window.clearTimeout(hideGateTimer);
        hideGateTimer = null;
      }
      if (forcedOpenTimer) {
        window.clearTimeout(forcedOpenTimer);
        forcedOpenTimer = null;
      }
    };
    const resetIntroView = function () {
      splashVideo.style.setProperty('--intro-scale', '1');
      splashVideo.style.setProperty('--intro-shift-y', '0%');
      splashVideo.style.setProperty('--intro-origin-y', '50%');
    };
    const stopIntroFollow = function () {
      if (introFollowRaf) {
        window.cancelAnimationFrame(introFollowRaf);
        introFollowRaf = null;
      }
    };
    const runIntroFollow = function () {
      const duration = splashVideo.duration;
      const progress = duration && Number.isFinite(duration) ? clamp(splashVideo.currentTime / duration, 0, 1) : 0;
      const diveStart = 0.64;
      const diveProgress = clamp((progress - diveStart) / (1 - diveStart), 0, 1);
      const eased = Math.pow(diveProgress, 2.2);
      const maxScale = window.matchMedia('(max-width: 700px)').matches ? 1.72 : 1.52;
      const scale = 1 + ((maxScale - 1) * eased);
      const shiftY = (-1.4 * eased);
      const originY = 50 + (9 * eased);
      splashVideo.style.setProperty('--intro-scale', scale.toFixed(3));
      splashVideo.style.setProperty('--intro-shift-y', shiftY.toFixed(2) + '%');
      splashVideo.style.setProperty('--intro-origin-y', originY.toFixed(1) + '%');
      if (!splashVideo.paused && !splashVideo.ended && !gate.classList.contains('open')) {
        introFollowRaf = window.requestAnimationFrame(runIntroFollow);
      } else {
        introFollowRaf = null;
      }
    };
    const startIntroFollow = function () {
      stopIntroFollow();
      resetIntroView();
      introFollowRaf = window.requestAnimationFrame(runIntroFollow);
    };
    const extraIntroMs = 5000;
    const scheduleGateFallback = function () {
      if (gateReleased || gate.classList.contains('video-awaiting-input')) {
        return;
      }
      if (forcedOpenTimer) {
        window.clearTimeout(forcedOpenTimer);
      }
      const durationMs = Number.isFinite(splashVideo.duration) && splashVideo.duration > 0
        ? Math.ceil(Math.max(2, splashVideo.duration - splashVideo.currentTime + 0.35) * 1000) + extraIntroMs
        : 12000;
      forcedOpenTimer = window.setTimeout(function () {
        openGate();
      }, durationMs);
    };
    const openGate = function () {
      if (gateReleased || gate.classList.contains('open')) return;
      gateReleased = true;
      if (pageGateFailSafeTimer) {
        window.clearTimeout(pageGateFailSafeTimer);
        pageGateFailSafeTimer = null;
      }
      clearGateTimers();
      stopIntroFollow();
      gate.classList.remove('video-awaiting-input');
      gate.classList.remove('video-playing');
      gate.classList.add('open');
      gate.style.pointerEvents = 'none';
      gate.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('gate-active');
      hideGateTimer = window.setTimeout(function () {
        gate.classList.add('hide');
        gate.style.display = 'none';
      }, 620);
    };

    const showTapToPlay = function () {
      clearGateTimers();
      stopIntroFollow();
      resetIntroView();
      gate.classList.remove('video-playing');
      gate.classList.add('video-awaiting-input');
      if (enterHint) enterHint.textContent = 'Tap video to start intro or wait to enter site';
      forcedOpenTimer = window.setTimeout(function () {
        if (gateReleased || !gate.classList.contains('video-awaiting-input')) {
          return;
        }
        if (enterHint) enterHint.textContent = 'Opening site...';
        openGate();
      }, 4000);
    };

    const markPlaying = function () {
      gate.classList.add('video-playing');
      gate.classList.remove('video-awaiting-input');
      if (enterHint) enterHint.textContent = 'Playing intro... (Tap to skip)';
      startIntroFollow();
      scheduleGateFallback();
      
      // Anti-freeze logic: If video time doesn't advance for 2 seconds while "playing", bypass
      let lastCheckTime = splashVideo.currentTime;
      let stallCounter = 0;
      const stallInterval = window.setInterval(function() {
        if (gateReleased) {
          window.clearInterval(stallInterval);
          return;
        }
        if (splashVideo.paused) return;
        
        if (Math.abs(splashVideo.currentTime - lastCheckTime) < 0.01) {
          stallCounter++;
          if (stallCounter >= 4) { // 2 seconds (0.5s * 4)
            console.log("Splash bypass via stall detection");
            window.clearInterval(stallInterval);
            openGate();
          }
        } else {
          stallCounter = 0;
          lastCheckTime = splashVideo.currentTime;
        }
      }, 500);
    };

    const playIntro = function () {
      if (gateReleased) {
        return;
      }
      splashVideo.muted = true;
      if (
        splashVideo.ended ||
        (Number.isFinite(splashVideo.duration) && splashVideo.duration > 0 && splashVideo.currentTime >= splashVideo.duration - 0.2)
      ) {
        splashVideo.currentTime = 0;
      }
      const playPromise = splashVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          markPlaying();
        }).catch(function () {
          showTapToPlay();
        });
      } else {
        markPlaying();
      }

      // Safety timeout in case video hangs or fails to fire 'ended'
      window.setTimeout(function() {
        if (!gate.classList.contains('open')) {
          console.log("Splash bypass via safety timeout after 5s");
          openGate();
        }
      }, 12500); // give video + logo reveal noticeably longer runway
      
      // Expose to global for the skip button in index.html
      window.PW_dismissSplash = openGate;
    };

    // Early bypass for broken files (e.g. 0-byte startofsite.mp4)
    splashVideo.addEventListener('error', function() {
      console.warn("Splash video error or 0-byte file detected. Opening gate.");
      openGate(); 
    });
    
    // Check if video is functionally broken on start
    window.setTimeout(function() {
      const isBroken = splashVideo.readyState === 0 || 
                       (splashVideo.networkState === 3) || 
                       (splashVideo.error);
      if (isBroken && !gateReleased) {
        console.warn("Splash video seems broken or missing. Failsafe bypass.");
        openGate();
      }
    }, 2000);

    splashVideo.addEventListener('ended', function () {
      window.setTimeout(openGate, extraIntroMs);
    });
    splashVideo.addEventListener('loadedmetadata', scheduleGateFallback);
    splashVideo.addEventListener('playing', function() {
      const fallback = document.getElementById('splash-logo-fallback');
      if (fallback) {
        window.setTimeout(function () {
          fallback.style.opacity = '0';
        }, 1200);
      }
    });
    splashVideo.addEventListener('canplay', scheduleGateFallback);
    splashVideo.addEventListener('timeupdate', function () {
      // Intentionally no auto-open near the end; we keep the final frame
      // visible longer for the logo/album reveal.
    });

    const startFromUser = function (e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (gate.classList.contains('video-playing')) {
        openGate(); // Skip if already playing
      } else {
        playIntro();
      }
    };

    if (splashVideoWrap) {
      splashVideoWrap.addEventListener('click', function () {
        if (gate.classList.contains('video-awaiting-input')) {
          startFromUser();
        } else if (gate.classList.contains('video-playing')) {
          openGate(); // Click to skip
        }
      });
      splashVideoWrap.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (gate.classList.contains('video-awaiting-input')) {
            startFromUser(e);
          } else if (gate.classList.contains('video-playing')) {
            openGate();
          }
        }
      });
    }

    if (splashVideoCta) {
      splashVideoCta.addEventListener('click', startFromUser);
    }

    if (gate) {
      gate.addEventListener('click', function() {
        if (gate.classList.contains('video-awaiting-input')) {
          startFromUser();
        } else if (gate.classList.contains('video-playing')) {
          openGate();
        }
      });
    }

    resetIntroView();
    playIntro();
    window.setTimeout(function () {
      if (gateReleased) {
        return;
      }
      if (splashVideo.paused && !gate.classList.contains('open')) {
        showTapToPlay();
      }
    }, 1500); // Give it a bit more time on slow mobile connections
    window.setTimeout(function () {
      if (!gateReleased && !gate.classList.contains('video-awaiting-input')) {
        openGate();
      }
    }, 23000);
  }

  // Newsletter form handling (Netlify-friendly + AJAX fallback)
  (function () {
    const forms = document.querySelectorAll('form.newsletter-form');
    if (!forms || forms.length === 0) return;
    forms.forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const successNode = form.querySelector('.newsletter-success');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const fd = new FormData(form);
        if (!fd.get('form-name')) fd.append('form-name', form.getAttribute('name') || 'newsletter');
        // Convert to URL-encoded body for Netlify compatibility
        const params = new URLSearchParams();
        for (const pair of fd.entries()) params.append(pair[0], pair[1]);

        fetch(netlifyFormPostPath(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        }).then(function (res) {
          // On success redirect to a thank-you page (Netlify will also redirect when JS is disabled)
          if (res.ok || res.status === 200 || res.status === 201) {
            try { window.location.href = '/thank-you'; return; } catch (e) { /* ignore */ }
          }
          // Fallback: show inline success message
          if (successNode) {
            successNode.style.display = 'block';
            successNode.textContent = 'Thanks — you are on the list.';
          }
          form.reset();
        }).catch(function () {
          if (successNode) {
            successNode.style.display = 'block';
            successNode.textContent = 'Thanks — you are on the list.';
          }
          form.reset();
        }).finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
      });
    });
  })();

  // Store Tabs Navigation
  const tabFootnotes = {
    'vinyl': 'Browse all vinyl releases from the Poison Well Records catalog.',
    'test-pressings': 'Ultra-limited pressings created for serious collectors. Once they disappear, they do not return.',
    'digital-releases': 'Stream and download the catalog. Past, present, and restored releases from the PWR archive.',
    'rarities': 'Hard-to-find recordings, historic releases, and underground artifacts preserved for the dedicated listener.'
  };

  const storeTabs = document.querySelectorAll('.tab-btn, .store-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const tabFootnote = document.getElementById('tab-footnote');

  // Helper to activate a store tab by name (e.g. 'vinyl', 'rarities')
  function setActiveStoreTab(targetTab) {
    if (!targetTab) return;
    if (targetTab.indexOf('tab-') === 0) targetTab = targetTab.slice(4);
    // Update active tab button
    storeTabs.forEach(function (t) { t.classList.remove('active'); if (t.getAttribute('data-tab') === targetTab) t.classList.add('active'); });
    // Update active content
    tabContents.forEach(function (content) {
      content.classList.remove('active');
      if (content.id === 'tab-' + targetTab) {
        content.classList.add('active');
      }
    });
    // Update footnote text
    if (tabFootnote && tabFootnotes[targetTab]) {
      tabFootnote.textContent = tabFootnotes[targetTab];
    }

    if (window.location.hash.replace(/^#/, '') !== 'tab-' + targetTab) {
      history.replaceState(null, '', '#tab-' + targetTab);
    }

    const activeTabButton = document.querySelector('.tab-btn[data-tab="' + targetTab + '"], .store-tab[data-tab="' + targetTab + '"]');
    if (activeTabButton && window.matchMedia('(max-width: 768px)').matches) {
      activeTabButton.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  if (storeTabs.length > 0) {
    storeTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const targetTab = this.getAttribute('data-tab');
        setActiveStoreTab(targetTab);
      });
    });

    if (window.location.hash && window.location.hash.indexOf('#tab-') === 0) {
      const ht = window.location.hash.replace(/^#tab-/, '');
      setActiveStoreTab(ht);
    } else if (storeTabs[0]) {
      setActiveStoreTab(storeTabs[0].getAttribute('data-tab'));
    }

    // Wire header dropdown links to activate tabs client-side when on the store page
    const dropdownLinks = document.querySelectorAll('.nav-dropdown .dropdown-content a');
    if (dropdownLinks.length > 0) {
      dropdownLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          // If already on the store page, prevent navigation and activate tab directly
          if (window.location.pathname === '/ventura-punk-record-store-online' || window.location.pathname === '/ventura-punk-record-store-online.html') {
            e.preventDefault();
            var hrefHash = (this.hash || '').replace(/^#/, '') || (this.getAttribute('href') || '').split('#')[1] || '';
            if (hrefHash.indexOf('tab-') === 0) hrefHash = hrefHash.slice(4);
            setActiveStoreTab(hrefHash);
            // close any open dropdowns by blurring and updating aria
            this.blur();
            const navDrop = this.closest('.nav-dropdown');
            if (navDrop) {
              const main = navDrop.querySelector('.nav-main');
              if (main) main.setAttribute('aria-expanded', 'false');
            }
          }
          // Otherwise, allow default navigation to the store page which will read the hash on load
        });
      });
    }
    // Enhance dropdown accessibility: toggle aria-expanded on hover/focus and close on Escape
    const navDropdowns = document.querySelectorAll('.nav-dropdown');
    navDropdowns.forEach(function (nd) {
      const main = nd.querySelector('.nav-main');
      const content = nd.querySelector('.dropdown-content');
      if (!main) return;
      main.setAttribute('aria-haspopup', 'true');
      main.setAttribute('aria-expanded', 'false');

      nd.addEventListener('mouseenter', function () { main.setAttribute('aria-expanded', 'true'); });
      nd.addEventListener('mouseleave', function () { main.setAttribute('aria-expanded', 'false'); });
      nd.addEventListener('focusin', function () { main.setAttribute('aria-expanded', 'true'); });
      nd.addEventListener('focusout', function (e) {
        // if focus moved outside the dropdown, close it
        if (!nd.contains(e.relatedTarget)) {
          main.setAttribute('aria-expanded', 'false');
        }
      });

      // Close dropdown on Escape key
      nd.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
          main.setAttribute('aria-expanded', 'false');
          main.focus();
        }
      });
    });
  }

  // Lightbox for product cover previews
  (function () {
    const body = document.body;
    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('div');
    inner.className = 'lightbox-inner';

    const img = document.createElement('img');
    img.alt = '';

    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '✕';
    closeBtn.type = 'button';

    // navigation buttons
    const navLeft = document.createElement('button');
    navLeft.className = 'lightbox-nav-button lightbox-prev';
    navLeft.innerHTML = '◀';
    const navRight = document.createElement('button');
    navRight.className = 'lightbox-nav-button lightbox-next';
    navRight.innerHTML = '▶';

    const navLeftWrap = document.createElement('div');
    navLeftWrap.className = 'lightbox-nav lightbox-nav-left';
    navLeftWrap.appendChild(navLeft);
    const navRightWrap = document.createElement('div');
    navRightWrap.className = 'lightbox-nav lightbox-nav-right';
    navRightWrap.appendChild(navRight);

    inner.appendChild(img);
    inner.appendChild(caption);
    backdrop.appendChild(inner);
    backdrop.appendChild(navLeftWrap);
    backdrop.appendChild(navRightWrap);
    backdrop.appendChild(closeBtn);
    body.appendChild(backdrop);

    let gallery = [];
    let currentIndex = -1;

    function openLightboxAt(index) {
      if (index < 0 || index >= gallery.length) return;
      const item = gallery[index];
      img.src = item.src;
      img.alt = item.alt || item.title || '';
      // show index and title
      caption.textContent = ((index + 1) + ' / ' + gallery.length) + (item.title ? ' — ' + item.title : '');
      currentIndex = index;
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    function closeLightbox() {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      // explicit delay to hide display after transition
      setTimeout(() => {
        if (!backdrop.classList.contains('open')) {
           backdrop.style.display = 'none';
        }
      }, 200);
      img.src = '';
      currentIndex = -1;
    }

    function navigate(delta) {
      if (gallery.length === 0) return;
      let next = currentIndex + delta;
      if (next < 0) next = gallery.length - 1;
      if (next >= gallery.length) next = 0;
      openLightboxAt(next);
    }

    navLeft.addEventListener('click', function (e) { e.stopPropagation(); navigate(-1); });
    navRight.addEventListener('click', function (e) { e.stopPropagation(); navigate(1); });

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop || e.target === closeBtn) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Attach handlers to product images site-wide and build gallery
    function preloadImage(url) {
      if (!url) return;
      const p = new Image();
      p.src = url;
      return p;
    }

    function attachLightboxHandlers() {
      const imgs = Array.from(document.querySelectorAll('img.product-image'));
      gallery = imgs.map(function (el, i) {
        return {
          src: el.getAttribute('data-full-src') || el.getAttribute('src'),
          alt: el.getAttribute('alt') || '',
          title: (el.closest('.card') && el.closest('.card').querySelector('h3')) ? el.closest('.card').querySelector('h3').textContent.trim() : ''
        };
      });

      imgs.forEach(function (el, i) {
        if (el.__lightboxBound) return;
        el.__lightboxBound = true;
        // preload full-size on hover/focus
        const full = el.getAttribute('data-full-src') || el.getAttribute('src');
        el.addEventListener('mouseenter', function () { preloadImage(full); });
        el.addEventListener('focus', function () { preloadImage(full); });
        el.addEventListener('click', function (evt) {
          if (el.closest('a')) evt.preventDefault();
          openLightboxAt(i);
        });
      });
    }

    // Run once on load and expose attach function
    attachLightboxHandlers();
    window.PW_attachLightbox = attachLightboxHandlers;
  })();

  // Admin Access — auth is handled by Netlify Identity on the admin page
  window.PW_AdminLogin = function() {
    window.location.href = '/admin/index.html';
  };
})();
