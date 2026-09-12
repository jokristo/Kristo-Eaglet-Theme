// Kristo Eaglet — global.js

document.addEventListener('DOMContentLoaded', function () {
  // ---------- Mobile menu toggle ----------
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
  }

  var productData = document.querySelector('[data-product-json]');
  var product = null;
  if (productData) {
    try { product = JSON.parse(productData.textContent); } catch (e) { product = null; }
  }

  // ---------- Product gallery ----------
  var galleryMain = document.querySelector('[data-gallery-main]');
  var thumbs = document.querySelectorAll('[data-gallery-thumb]');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      if (!galleryMain) return;
      galleryMain.src = thumb.dataset.full;
      thumbs.forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  });

  // ---------- Variant selection from separate option inputs ----------
  var optionInputs = document.querySelectorAll('[data-option-input]');
  var variantIdInput = document.querySelector('[data-variant-id]');
  var priceEl = document.querySelector('[data-product-price]');
  var buyBtn = document.querySelector('[data-buy-button]');
  var barPrice = document.querySelector('[data-buy-bar-price]');
  var barImage = document.querySelector('[data-buy-bar-image]');

  function selectedOptions() {
    var values = [];
    document.querySelectorAll('[data-option-input]:checked').forEach(function (input) {
      values[parseInt(input.dataset.optionPosition, 10) - 1] = input.value;
    });
    return values;
  }

  function findVariant(values) {
    if (!product) return null;
    return product.variants.find(function (v) {
      return v.options.every(function (opt, i) { return opt === values[i]; });
    }) || null;
  }

  // Grise les combinaisons qui n'existent pas / sont en rupture
  function refreshAvailability() {
    if (!product) return;
    var current = selectedOptions();

    optionInputs.forEach(function (input) {
      var pos = parseInt(input.dataset.optionPosition, 10) - 1;
      var candidate = current.slice();
      candidate[pos] = input.value;

      var match = product.variants.find(function (v) {
        return v.options.every(function (opt, i) {
          if (i === pos) return opt === input.value;
          if (candidate[i] === undefined) return true;
          return opt === candidate[i];
        });
      });

      var label = document.querySelector('label[for="' + input.id + '"]');
      var usable = !!match && match.available;
      input.disabled = !match;
      if (label) label.classList.toggle('is-unavailable', !usable);
    });
  }

  function updateVariant() {
    if (!product) return;
    var values = selectedOptions();
    var variant = findVariant(values);

    // Libellé de l'option affiché à côté du nom
    values.forEach(function (val, i) {
      var out = document.querySelector('[data-option-selected="' + (i + 1) + '"]');
      if (out && val) out.textContent = val;
    });

    refreshAvailability();

    if (!variant) {
      if (buyBtn) {
        buyBtn.disabled = true;
        buyBtn.textContent = buyBtn.dataset.textUnavailable || 'Unavailable';
      }
      return;
    }

    if (variantIdInput) variantIdInput.value = variant.id;
    if (priceEl) priceEl.textContent = formatMoney(variant.price);
    if (barPrice) barPrice.textContent = formatMoney(variant.price);

    if (variant.featured_image && variant.featured_image.src) {
      var src = variant.featured_image.src;
      if (galleryMain) galleryMain.src = src;
      if (barImage) barImage.src = src;
    }

    if (buyBtn) {
      buyBtn.disabled = !variant.available;
      buyBtn.textContent = variant.available ? buyBtn.dataset.textAdd : buyBtn.dataset.textSoldOut;
    }

    // Met l'URL à jour sans recharger, pour que le partage pointe sur la bonne variante
    if (window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
  }

  if (optionInputs.length) {
    optionInputs.forEach(function (input) {
      input.addEventListener('change', updateVariant);
    });
    refreshAvailability();
  }

  // ---------- Barre d'achat collante ----------
  var buyBar = document.querySelector('[data-buy-bar]');
  var buyBarButton = document.querySelector('[data-buy-bar-button]');
  if (buyBar && buyBtn) {
    if (buyBarButton) {
      buyBarButton.addEventListener('click', function () {
        buyBtn.click();
        buyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          buyBar.hidden = entry.isIntersecting;
        });
      }, { rootMargin: '0px 0px -80px 0px' });
      observer.observe(buyBtn);
    }
  }

  // ---------- Guide des tailles ----------
  var sizeModal = document.querySelector('[data-size-guide]');
  if (sizeModal) {
    document.querySelectorAll('[data-size-guide-open]').forEach(function (el) {
      el.addEventListener('click', function () {
        sizeModal.hidden = false;
        document.body.style.overflow = 'hidden';
      });
    });
    document.querySelectorAll('[data-size-guide-close]').forEach(function (el) {
      el.addEventListener('click', closeSizeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sizeModal.hidden) closeSizeModal();
    });
  }
  function closeSizeModal() {
    if (!sizeModal) return;
    sizeModal.hidden = true;
    document.body.style.overflow = '';
  }

  // ---------- Ajax cart ----------
  var productForm = document.querySelector('.product__form');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (buyBtn) buyBtn.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(productForm)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('add-to-cart failed');
          return fetch('/cart.js');
        })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          var count = document.querySelector('[data-cart-count]');
          if (count) {
            count.textContent = cart.item_count;
            count.hidden = cart.item_count === 0;
          }
          if (buyBtn) {
            buyBtn.textContent = buyBtn.dataset.textAdded || 'Added';
            setTimeout(function () {
              buyBtn.textContent = buyBtn.dataset.textAdd;
              buyBtn.disabled = false;
            }, 1800);
          }
        })
        .catch(function () {
          // Fallback: classic submit if the Ajax call fails
          // (programmatic .submit() does not re-trigger this listener)
          if (buyBtn) buyBtn.disabled = false;
          productForm.submit();
        });
    });
  }

  function formatMoney(cents) {
    var currency = document.body.dataset.currency || 'USD';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency
    }).format(cents / 100);
  }
});
