(function () {
  const baseUrl = 'https://poisonwellrecords.netlify.app';
  const pathMap = {
    'index.html': '/',
    'ventura-punk-vinyl.html': '/ventura-punk-vinyl',
    'apparel.html': '/apparel',
    'ventura-punk-record-store-online.html': '/ventura-punk-record-store-online',
    '805-punk-bands.html': '/805-punk-bands',
    '805-punk-shows-events.html': '/805-punk-shows-events',
    'about-poison-well-records.html': '/about-poison-well-records',
    'contact-wholesale.html': '/contact-wholesale',
    'faq.html': '/faq',
    'dr-know-live-cbgb-1989-ventura-hardcore.html': '/dr-know-live-cbgb-1989-ventura-hardcore'
  };

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

  const yearNodes = document.querySelectorAll('[data-current-year]');
  const y = new Date().getFullYear();
  yearNodes.forEach(function (n) { n.textContent = String(y); });

  const canonicalNode = document.querySelector('link[rel="canonical"]');
  if (!canonicalNode) {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = currentCanonical();
    document.head.appendChild(link);
  }

  const images = document.querySelectorAll('img.product-image');
  images.forEach(function (img) {
    if (!img.getAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });

  const jsonLdNodes = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  const hasOrgSchema = jsonLdNodes.some(function (n) { return n.textContent.includes('"@type": "Organization"'); });
  const hasStoreSchema = jsonLdNodes.some(function (n) { return n.textContent.includes('"@type": "Store"'); });
  const hasBreadcrumbSchema = jsonLdNodes.some(function (n) { return n.textContent.includes('"@type":"BreadcrumbList"') || n.textContent.includes('"@type": "BreadcrumbList"'); });

  if (!hasOrgSchema) {
    const org = document.createElement('script');
    org.type = 'application/ld+json';
    org.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Poison Well Records',
      description: 'Ventura 805 punk vinyl label and online store archiving SoCal punk rock',
      url: baseUrl,
      logo: baseUrl + '/poison-well-records-logo-ventura-805-punk-label.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ventura',
        addressRegion: 'CA',
        postalCode: '93001',
        addressCountry: 'US'
      },
      sameAs: [
        'https://www.instagram.com/poisonwellrecords',
        'https://www.youtube.com/@poisonwellrecords',
        'https://www.x.com/PoisonWellRcrds'
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
      name: 'Poison Well Records',
      image: baseUrl + '/poison-well-records-logo-ventura-805-punk-label.png',
      description: '805 and SoCal punk vinyl record store and label shipping worldwide from Ventura, California',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ventura',
        addressRegion: 'CA',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '34.2746',
        longitude: '-119.2290'
      },
      url: baseUrl,
      telephone: '+1-XXX-XXX-XXXX',
      priceRange: '$20-$40',
      paymentAccepted: 'Credit Card, Debit Card',
      currenciesAccepted: 'USD'
    });
    document.head.appendChild(store);
  }

  if (!hasBreadcrumbSchema) {
    const crumbLabel = {
      '/': 'Home',
      '/ventura-punk-vinyl': 'Ventura Punk Vinyl',
      '/apparel': 'Apparel',
      '/ventura-punk-record-store-online': 'Vinyl',
      '/805-punk-bands': 'Artists & 805 Archive',
      '/805-punk-shows-events': 'Shows & Events',
      '/about-poison-well-records': 'About',
      '/contact-wholesale': 'Contact / Wholesale',
      '/faq': 'FAQ',
      '/dr-know-live-cbgb-1989-ventura-hardcore': 'Dr. Know Live CBGB 1989'
    };
    const canon = currentCanonical();
    const suffix = canon.replace(baseUrl, '') || '/';
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl + '/'
        }
      ]
    };
    if (suffix !== '/') {
      breadcrumb.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: crumbLabel[suffix] || document.title,
        item: canon
      });
    }
    const crumbNode = document.createElement('script');
    crumbNode.type = 'application/ld+json';
    crumbNode.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(crumbNode);
  }

  const stripeLinks = window.POISON_WELL_STRIPE_LINKS || {};
  window.goToCheckout = function (productKey) {
    const checkoutUrl = stripeLinks[productKey];
    if (!checkoutUrl) {
      alert('Stripe checkout link is not set yet for this record. Add it in stripe-config.js');
      return;
    }
    window.location.href = checkoutUrl;
  };

  // Variant-aware checkout helper: accepts a base product key and the card element
  window.goToCheckoutVariant = function (baseKey, cardEl) {
    if (!cardEl) cardEl = document.querySelector('.card');
    const size = (cardEl.dataset.size) || (cardEl.querySelector('select') ? cardEl.querySelector('select').value : '');
    const qty = parseInt((cardEl.querySelector('.qty-input') && cardEl.querySelector('.qty-input').value) || 1, 10) || 1;
    const variantKey = size ? (baseKey + '_' + size) : baseKey;
    const checkoutUrl = stripeLinks[variantKey] || stripeLinks[baseKey];
    if (!checkoutUrl) {
      alert('No checkout link configured for ' + variantKey + '. Check stripe-config.js');
      return;
    }
    // append qty query for demo purposes (real Stripe Payment Links may not accept qty via query)
    const url = qty > 1 ? (checkoutUrl + '?qty=' + qty) : checkoutUrl;
    window.location.href = url;
  };

  // Update buy button labels to reflect selected size and quantity
  window.updateBuyButton = function (cardEl) {
    if (!cardEl) return;
    const size = cardEl.dataset.size || (cardEl.querySelector('select') ? cardEl.querySelector('select').value : '');
    const qty = cardEl.querySelector('.qty-input') ? parseInt(cardEl.querySelector('.qty-input').value || 1, 10) : 1;
    const priceNode = cardEl.querySelector('.price');
    const basePriceText = priceNode ? priceNode.textContent.trim() : '';
    const btn = cardEl.querySelector('.buy-btn');
    if (!btn) return;
    const sizePart = size ? (size + ' ') : '';
    btn.textContent = 'Buy ' + sizePart + '×' + qty + (basePriceText ? ' — ' + basePriceText : '');
  };

  // Initialize buy button labels on pages with apparel cards
  function initApparelUI() {
    const apparelCards = document.querySelectorAll('main .card');
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApparelUI);
  } else {
    initApparelUI();
  }

  const gate = document.getElementById('splash-gate');
  const logoDoor = document.getElementById('logo-door');
  if (gate && logoDoor) {
    const openGate = function () {
      if (gate.classList.contains('open')) return;
      gate.classList.add('open');
      window.setTimeout(function () {
        gate.classList.add('hide');
      }, 850);
    };
    window.setTimeout(openGate, 2200);
    logoDoor.addEventListener('click', openGate);
    logoDoor.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGate();
      }
    });
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

        fetch('/', {
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

  const storeTabs = document.querySelectorAll('.store-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const tabFootnote = document.getElementById('tab-footnote');

  // Helper to activate a store tab by name (e.g. 'vinyl', 'test-pressings')
  function setActiveStoreTab(targetTab) {
    if (!targetTab) return;
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
  }

  if (storeTabs.length > 0) {
    storeTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const targetTab = this.getAttribute('data-tab');
        setActiveStoreTab(targetTab);
      });
    });

    // If the page loaded with a hash like #tab-vinyl, activate that tab
    if (window.location.hash && window.location.hash.indexOf('#tab-') === 0) {
      const ht = window.location.hash.replace('#tab-', '');
      setActiveStoreTab(ht);
    }

    // Wire header dropdown links to activate tabs client-side when on the store page
    const dropdownLinks = document.querySelectorAll('.nav-dropdown .dropdown-content a');
    if (dropdownLinks.length > 0) {
      dropdownLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          // If already on the store page, prevent navigation and activate tab directly
          if (window.location.pathname === '/ventura-punk-record-store-online' || window.location.pathname === '/ventura-punk-record-store-online.html') {
            e.preventDefault();
            const hash = this.hash || this.getAttribute('href').split('#')[1] || '';
            const target = hash.replace('tab-', '');
            setActiveStoreTab(target);
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
})();
