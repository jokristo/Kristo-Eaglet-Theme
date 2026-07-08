// Kristo Eaglet — global.js

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
  }

  // Product page: update price + availability on variant change
  var variantSelect = document.querySelector('[data-variant-select]');
  if (variantSelect) {
    var productData = document.querySelector('[data-product-json]');
    if (productData) {
      var product = JSON.parse(productData.textContent);
      variantSelect.addEventListener('change', function () {
        var variant = product.variants.find(function (v) {
          return String(v.id) === variantSelect.value;
        });
        if (!variant) return;
        var priceEl = document.querySelector('[data-product-price]');
        var buyBtn = document.querySelector('[data-buy-button]');
        if (priceEl) {
          priceEl.textContent = formatMoney(variant.price);
        }
        if (buyBtn) {
          buyBtn.disabled = !variant.available;
          buyBtn.textContent = variant.available
            ? buyBtn.dataset.textAdd
            : buyBtn.dataset.textSoldOut;
        }
      });
    }
  }

  // Ajax cart: add to cart without page reload
  var productForm = document.querySelector('.product__form');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var buyBtn = productForm.querySelector('[data-buy-button]');
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
