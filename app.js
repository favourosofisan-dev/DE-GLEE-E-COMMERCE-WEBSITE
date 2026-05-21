const shopGrid = document.getElementById("shopGrid");
const categoryFilters = document.getElementById("categoryFilters");
const shopSearch = document.getElementById("shopSearch");
const shopSort = document.getElementById("shopSort");
const shopCount = document.getElementById("shopCount");
const recommendationForm = document.getElementById("recommendationForm");
const recommendationResult = document.getElementById("recommendationResult");
const recommendationTitle = document.getElementById("recommendationTitle");
const recommendationSummary = document.getElementById("recommendationSummary");
const recommendationGrid = document.getElementById("recommendationGrid");
const recommendationReset = document.getElementById("recommendationReset");
const year = document.getElementById("year");
const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

const cartToggle = document.getElementById("cartToggle");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartBadge = document.getElementById("cartBadge");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartShipping = document.getElementById("cartShipping");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const productModal = document.getElementById("productModal");
const productModalOverlay = document.getElementById("productModalOverlay");
const productModalClose = document.getElementById("productModalClose");
const productModalBody = document.getElementById("productModalBody");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutModalOverlay = document.getElementById("checkoutModalOverlay");
const checkoutModalClose = document.getElementById("checkoutModalClose");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSummary = document.getElementById("checkoutSummary");
const checkoutDisclaimer = document.querySelector(".checkout-disclaimer");
const orderSuccess = document.getElementById("orderSuccess");
const orderSuccessOverlay = document.getElementById("orderSuccessOverlay");
const orderSuccessClose = document.getElementById("orderSuccessClose");
const orderSuccessTitle = document.getElementById("orderSuccessTitle");
const orderSuccessMessage = document.getElementById("orderSuccessMessage");
const orderSuccessAccount = document.getElementById("orderSuccessAccount");
const orderSuccessReference = document.getElementById("orderSuccessReference");
const orderSuccessWhatsApp = document.getElementById("orderSuccessWhatsApp");
const orderSuccessEmail = document.getElementById("orderSuccessEmail");
const paymentProofForm = document.getElementById("paymentProofForm");
const paymentProofFile = document.getElementById("paymentProofFile");
const paymentProofNote = document.getElementById("paymentProofNote");
const paymentProofStatus = document.getElementById("paymentProofStatus");

let activeCategory = "all";
let activeSearch = "";
let activeSort = "featured";
let activeOrder = null;

const recommendationProfiles = {
  skinType: {
    dry: {
      categoryWeights: { moisturizer: 4, treatment: 3, skincare: 2, "body-care": 2, "body-oil": 2 },
      keywords: ["hydration", "moisture", "barrier", "replenishing", "nourish", "dry"]
    },
    oily: {
      categoryWeights: { cleansing: 4, toner: 3, serum: 2, treatment: 2 },
      keywords: ["clarify", "foaming", "balance", "gel", "cleanser", "baha", "bha"]
    },
    combination: {
      categoryWeights: { cleansing: 3, moisturizer: 3, toner: 2, skincare: 2 },
      keywords: ["balance", "gentle", "daily", "lightweight", "refresh"]
    },
    sensitive: {
      categoryWeights: { cleanser: 0, cleansing: 3, moisturizer: 4, treatment: 3 },
      keywords: ["gentle", "sensitive", "barrier", "calm", "replenishing", "micellar"]
    },
    normal: {
      categoryWeights: { skincare: 3, cleansing: 2, moisturizer: 2, serum: 2 },
      keywords: ["radiance", "daily", "smooth", "glow", "fresh"]
    }
  },
  concern: {
    acne: {
      categoryWeights: { cleansing: 4, toner: 4, treatment: 3 },
      keywords: ["blemish", "tea tree", "bha", "clarify", "pores", "breakout"]
    },
    "dark-spots": {
      categoryWeights: { skincare: 3, serum: 3, toner: 2, treatment: 2 },
      keywords: ["bright", "vitamin c", "tone", "even", "glow"]
    },
    dryness: {
      categoryWeights: { moisturizer: 4, treatment: 3, "body-oil": 2, "body-care": 2 },
      keywords: ["hydration", "moisture", "replenishing", "ceramide", "soft"]
    },
    aging: {
      categoryWeights: { skincare: 4, serum: 3, treatment: 2 },
      keywords: ["anti-aging", "firming", "regener", "elasticity", "younger"]
    },
    dullness: {
      categoryWeights: { serum: 3, toner: 3, skincare: 3, cleansing: 1 },
      keywords: ["radiance", "glow", "bright", "vitamin c", "fresh"]
    },
    barrier: {
      categoryWeights: { moisturizer: 4, treatment: 4, cleansing: 2 },
      keywords: ["barrier", "gentle", "sensitive", "calm", "ceramide"]
    }
  },
  goal: {
    cleanse: {
      categoryWeights: { cleansing: 5, toner: 2 },
      keywords: ["cleanser", "wash", "micellar", "foam", "refresh"]
    },
    hydrate: {
      categoryWeights: { moisturizer: 4, treatment: 3, "body-oil": 2, "body-care": 2 },
      keywords: ["hydration", "moisture", "supple", "replenishing", "nourish"]
    },
    glow: {
      categoryWeights: { skincare: 3, serum: 3, toner: 3, "body-care": 1 },
      keywords: ["glow", "bright", "radiance", "vitamin c", "luminous"]
    },
    treat: {
      categoryWeights: { treatment: 4, skincare: 3, serum: 2 },
      keywords: ["targeted", "clarify", "tone", "correcting", "firming"]
    },
    simple: {
      categoryWeights: { cleansing: 3, moisturizer: 3, skincare: 2 },
      keywords: ["simple", "daily", "gentle", "lightweight", "essential"]
    }
  }
};

function renderCategoryFilters() {
  if (!categoryFilters) {
    return;
  }

  categoryFilters.innerHTML = getCatalogCategories().map(
    (category) => `
      <button
        class="filter-chip${category.id === activeCategory ? " is-active" : ""}"
        type="button"
        data-category="${category.id}"
      >
        ${category.label}
      </button>
    `
  ).join("");
}

function getFilteredProducts() {
  let products = [...getProducts()];

  if (activeCategory !== "all") {
    products = products.filter((product) => product.category === activeCategory);
  }

  if (activeSearch.trim()) {
    const query = activeSearch.trim().toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.categoryLabel.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }

  switch (activeSort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "name":
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      products.sort((a, b) => {
        if (Boolean(a.badge) !== Boolean(b.badge)) {
          return a.badge ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  }

  return products;
}

function renderShop() {
  if (!shopGrid) {
    return;
  }

  const products = getFilteredProducts();

  if (shopCount) {
    shopCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
  }

  if (!products.length) {
    shopGrid.innerHTML = `
      <div class="shop-empty">
        <p>No products match your search. Try another category or keyword.</p>
      </div>
    `;
    return;
  }

  shopGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card" data-product-id="${product.id}">
          <button class="product-card-media" type="button" data-open-product="${product.id}" aria-label="View ${product.name}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
            <img src="${encodeURI(product.image)}" alt="${product.name}" loading="lazy">
          </button>
          <div class="product-card-body">
            <div class="product-card-meta">
              <span>${product.categoryLabel}</span>
              <strong>${formatPrice(product.price)}</strong>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-card-actions">
              <button class="button button-secondary button-small" type="button" data-open-product="${product.id}">
                Details
              </button>
              <button class="button button-primary button-small" type="button" data-add-to-cart="${product.id}">
                Add to cart
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function buildRecommendationSummary(skinType, concern, goal) {
  const skinTypeLabel = skinType.charAt(0).toUpperCase() + skinType.slice(1);
  const concernLabels = {
    acne: "breakout-prone skin",
    "dark-spots": "dark spots and uneven tone",
    dryness: "dryness and dehydration",
    aging: "fine lines and firmness support",
    dullness: "dullness and low radiance",
    barrier: "barrier care and sensitivity"
  };
  const goalLabels = {
    cleanse: "a cleansing-first routine",
    hydrate: "deeper hydration",
    glow: "a brighter glow-focused routine",
    treat: "more targeted treatment support",
    simple: "a simple everyday routine"
  };

  return `${skinTypeLabel} skin with ${concernLabels[concern]} usually benefits from formulas that support ${goalLabels[goal]}. These DE GLEE picks are the closest matches in your current catalog.`;
}

function scoreProduct(product, answers) {
  let score = 0;
  const searchText = `${product.name} ${product.description} ${product.categoryLabel}`.toLowerCase();

  ["skinType", "concern", "goal"].forEach((key) => {
    const profile = recommendationProfiles[key][answers[key]];
    if (!profile) {
      return;
    }

    score += profile.categoryWeights[product.category] || 0;
    profile.keywords.forEach((keyword) => {
      if (searchText.includes(keyword)) {
        score += 1;
      }
    });
  });

  if (answers.goal === "simple" && product.name.toLowerCase().includes("simple")) {
    score += 2;
  }

  if (answers.concern === "aging" && product.badge === "Premium") {
    score += 1;
  }

  return score;
}

function getRecommendations(answers) {
  return [...getProducts()]
    .map((product) => ({
      product,
      score: scoreProduct(product, answers)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.product.price - b.product.price;
    })
    .slice(0, 3)
    .map((entry) => entry.product);
}

function renderRecommendations(products, answers) {
  if (!recommendationResult || !recommendationTitle || !recommendationSummary || !recommendationGrid) {
    return;
  }

  recommendationTitle.textContent = "Your DE GLEE Skincare Edit";
  recommendationSummary.textContent = buildRecommendationSummary(
    answers.skinType,
    answers.concern,
    answers.goal
  );

  recommendationGrid.innerHTML = products
    .map(
      (product) => `
        <article class="recommendation-item">
          <img src="${encodeURI(product.image)}" alt="${product.name}" loading="lazy">
          <div class="recommendation-item-copy">
            <div class="recommendation-item-meta">
              <span>${product.categoryLabel}</span>
              <strong>${formatPrice(product.price)}</strong>
            </div>
            <strong>${product.name}</strong>
            <p>${product.description}</p>
            <div class="product-card-actions">
              <button class="button button-secondary button-small" type="button" data-open-product="${product.id}">
                Details
              </button>
              <button class="button button-primary button-small" type="button" data-add-to-cart="${product.id}">
                Add to cart
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  recommendationResult.hidden = false;
}

function renderCart() {
  const count = getCartCount();
  const subtotal = getCartSubtotal();
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;

  if (cartBadge) {
    cartBadge.textContent = String(count);
    cartBadge.hidden = count === 0;
  }

  if (cartSubtotal) {
    cartSubtotal.textContent = formatPrice(subtotal);
  }

  if (cartShipping) {
    cartShipping.textContent = shipping === 0 ? "Free" : formatPrice(shipping);
  }

  if (cartTotal) {
    cartTotal.textContent = formatPrice(total);
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = count === 0;
  }

  if (!cartItems || !cartEmpty) {
    return;
  }

  if (!count) {
    cartItems.innerHTML = "";
    cartEmpty.hidden = false;
    return;
  }

  cartEmpty.hidden = true;
  cartItems.innerHTML = cartState.items
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) {
        return "";
      }

      return `
        <article class="cart-line">
          <img src="${encodeURI(product.image)}" alt="${product.name}">
          <div class="cart-line-copy">
            <strong>${product.name}</strong>
            <span>${formatPrice(product.price)}</span>
            <div class="qty-control" aria-label="Quantity for ${product.name}">
              <button type="button" data-qty-change="${product.id}" data-qty-delta="-1" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-qty-change="${product.id}" data-qty-delta="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="cart-line-remove" type="button" data-remove-item="${product.id}" aria-label="Remove ${product.name}">
            Remove
          </button>
        </article>
      `;
    })
    .join("");
}

function renderCheckoutSummary() {
  if (!checkoutSummary) {
    return;
  }

  const subtotal = getCartSubtotal();
  const shipping = getShipping(subtotal);

  checkoutSummary.innerHTML = `
    ${cartState.items
      .map((item) => {
        const product = getProductById(item.id);
        if (!product) {
          return "";
        }

        return `
          <div class="checkout-line">
            <span>${product.name} × ${item.quantity}</span>
            <strong>${formatPrice(toNairaAmount(product.price) * item.quantity)}</strong>
          </div>
        `;
      })
      .join("")}
    <div class="checkout-totals">
      <div><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
      <div><span>Shipping</span><strong>${shipping === 0 ? "Free" : formatPrice(shipping)}</strong></div>
      <div class="checkout-total-row"><span>Total</span><strong>${formatPrice(subtotal + shipping)}</strong></div>
    </div>
  `;
}

function openProductModal(productId) {
  const product = getProductById(productId);
  if (!product || !productModal || !productModalBody) {
    return;
  }

  productModalBody.innerHTML = `
    <div class="product-modal-grid">
      <figure class="product-modal-media">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <img src="${encodeURI(product.image)}" alt="${product.name}">
      </figure>
      <div class="product-modal-copy">
        <p class="eyebrow">${product.categoryLabel}</p>
        <h2>${product.name}</h2>
        <p class="product-modal-price">${formatPrice(product.price)}</p>
        <p>${product.description}</p>
        <ul class="product-modal-points">
          <li>Curated by de glee for everyday glow</li>
          <li>Free shipping on orders over ₦50,000</li>
          <li>Gentle, elevated beauty presentation</li>
        </ul>
        <button class="button button-primary" type="button" data-add-to-cart="${product.id}">
          Add to cart — ${formatPrice(product.price)}
        </button>
      </div>
    </div>
  `;

  productModal.hidden = false;
  productModalOverlay.hidden = false;
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  if (!productModal || !productModalOverlay) {
    return;
  }

  productModal.hidden = true;
  productModalOverlay.hidden = true;

  if (!checkoutModal || checkoutModal.hidden) {
    document.body.classList.remove("modal-open");
  }
}

function openCart() {
  cartDrawer?.classList.add("is-open");
  if (cartOverlay) {
    cartOverlay.hidden = false;
    cartOverlay.classList.add("is-open");
  }
  document.body.classList.add("cart-open");
  cartToggle?.setAttribute("aria-expanded", "true");
}

function closeCart() {
  cartDrawer?.classList.remove("is-open");
  if (cartOverlay) {
    cartOverlay.classList.remove("is-open");
    cartOverlay.hidden = true;
  }
  document.body.classList.remove("cart-open");
  cartToggle?.setAttribute("aria-expanded", "false");
}

function openCheckout() {
  if (!getCartCount()) {
    return;
  }

  closeCart();
  renderCheckoutSummary();
  checkoutForm?.reset();
  setCheckoutMessage("You will be redirected to PalmPay or OPay to complete payment after placing your order.");
  checkoutModal.hidden = false;
  checkoutModalOverlay.hidden = false;
  document.body.classList.add("modal-open");
}

function closeCheckout() {
  checkoutModal.hidden = true;
  checkoutModalOverlay.hidden = true;
  document.body.classList.remove("modal-open");
}

function openOrderSuccess() {
  orderSuccess.hidden = false;
  orderSuccessOverlay.hidden = false;
  document.body.classList.add("modal-open");
}

function closeOrderSuccess() {
  orderSuccess.hidden = true;
  orderSuccessOverlay.hidden = true;
  document.body.classList.remove("modal-open");
}

function setCheckoutMessage(message, isError = false) {
  if (!checkoutDisclaimer) {
    return;
  }

  checkoutDisclaimer.textContent = message;
  checkoutDisclaimer.style.color = isError ? "#b42318" : "";
}

function setPaymentProofMessage(message, isError = false) {
  if (!paymentProofStatus) {
    return;
  }

  paymentProofStatus.textContent = message;
  paymentProofStatus.style.color = isError ? "#b42318" : "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the payment proof file."));
    reader.readAsDataURL(file);
  });
}

function updateOrderSuccess(order) {
  activeOrder = order;

  if (orderSuccessTitle) {
    orderSuccessTitle.textContent = "Order received";
  }

  if (orderSuccessMessage) {
    orderSuccessMessage.textContent = "Your delivery request has been saved. Make your transfer, then send proof of payment on WhatsApp so DE GLEE can confirm and process delivery.";
  }

  if (orderSuccessAccount) {
    orderSuccessAccount.textContent = `Payment account number: ${order.accountNumber}`;
  }

  if (orderSuccessReference) {
    orderSuccessReference.textContent = `Reference: ${order.reference}`;
  }

  if (orderSuccessWhatsApp && order.whatsAppUrl) {
    orderSuccessWhatsApp.href = order.whatsAppUrl;
  }

  if (orderSuccessEmail && order.emailAlertUrl) {
    orderSuccessEmail.href = order.emailAlertUrl;
  }

  if (paymentProofForm) {
    paymentProofForm.reset();
  }

  setPaymentProofMessage(
    order.proofOfPayment
      ? "Payment proof uploaded. DE GLEE will review it shortly."
      : "Upload your receipt here so DE GLEE can confirm payment faster."
  );
}

function getCheckoutPayload(form) {
  const formData = new FormData(form);
  const subtotal = getCartSubtotal();
  const shipping = getShipping(subtotal);

  return {
    customer: {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      city: String(formData.get("city") || "").trim()
    },
    payment: String(formData.get("payment") || "").trim().toLowerCase(),
    items: cartState.items.map((item) => {
      const product = getProductById(item.id);
      return {
        id: item.id,
        name: product?.name || item.id,
        quantity: item.quantity,
        unitPrice: toNairaAmount(product?.price || 0)
      };
    }),
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

function createFallbackOrder(payload) {
  const reference = `DGL-LOCAL-${Date.now()}`;
  const paymentProvider = payload.payment === "palmpay" ? "PalmPay" : "OPay";
  const fallbackOrder = {
    id: reference,
    reference,
    createdAt: new Date().toISOString(),
    status: "awaiting_payment_confirmation",
    paymentProvider,
    accountNumber: "8061632975",
    customer: payload.customer,
    items: payload.items,
    subtotal: payload.subtotal,
    shipping: payload.shipping,
    total: payload.total,
    proofOfPayment: null,
    whatsAppUrl: `https://wa.me/2348061632975?text=${encodeURIComponent(`Hello DE GLEE, I have made payment for order ${reference}. My name is ${payload.customer.name}. Please confirm my delivery.`)}`,
    emailAlertUrl: "mailto:degleebeautyandcosmetics@gmail.com",
    source: "local_fallback"
  };

  try {
    const savedOrders = JSON.parse(localStorage.getItem("deglee-local-orders") || "[]");
    savedOrders.unshift(fallbackOrder);
    localStorage.setItem("deglee-local-orders", JSON.stringify(savedOrders));
  } catch {
    // Ignore local fallback persistence errors and still return the order.
  }

  return fallbackOrder;
}

function getLocalFallbackOrders() {
  try {
    return JSON.parse(localStorage.getItem("deglee-local-orders") || "[]");
  } catch {
    return [];
  }
}

function saveLocalFallbackOrders(orders) {
  localStorage.setItem("deglee-local-orders", JSON.stringify(orders));
}

function persistLocalProofOfPayment(orderId, proofOfPayment) {
  const orders = getLocalFallbackOrders();
  const nextOrders = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          proofOfPayment
        }
      : order
  );

  saveLocalFallbackOrders(nextOrders);
}

async function submitCheckout(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent || "Place order";
  const payload = getCheckoutPayload(form);

  submitButton?.setAttribute("disabled", "disabled");
  if (submitButton) {
    submitButton.textContent = "Saving order...";
  }
  setCheckoutMessage("Saving your order and preparing payment instructions...");

  try {
    if (window.location.protocol === "file:") {
      const localOrder = createFallbackOrder(payload);
      updateOrderSuccess(localOrder);
      setCheckoutMessage("Server not connected. The order was saved on this device only. Start the Node server to sync orders into the admin dashboard.");
      clearCart();
      closeCheckout();
      openOrderSuccess();
      return;
    }

    const response = await fetch("/api/checkout/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();
    let result = {};

    if (contentType.includes("application/json")) {
      result = rawBody ? JSON.parse(rawBody) : {};
    } else if (!response.ok) {
      throw new Error("Checkout API is unavailable.");
    }

    if (!response.ok) {
      throw new Error(result.error || "Unable to start checkout.");
    }

    updateOrderSuccess(result.order);
    clearCart();
    closeCheckout();
    openOrderSuccess();
  } catch (error) {
    const localOrder = createFallbackOrder(payload);
    updateOrderSuccess(localOrder);
    setCheckoutMessage(`${error.message} A local fallback order has been saved on this device, but it will not appear in the admin dashboard until the server is running.`, true);
    clearCart();
    closeCheckout();
    openOrderSuccess();
  } finally {
    submitButton?.removeAttribute("disabled");
    if (submitButton) {
      submitButton.textContent = originalLabel;
    }
  }
}

async function uploadPaymentProof() {
  if (!activeOrder?.id) {
    throw new Error("Place your order first before uploading proof of payment.");
  }

  const file = paymentProofFile?.files?.[0];
  if (!file) {
    throw new Error("Choose your payment proof image first.");
  }

  const dataUrl = await readFileAsDataUrl(file);

  if (activeOrder.source === "local_fallback" || window.location.protocol === "file:") {
    const proofOfPayment = {
      imagePath: dataUrl,
      note: paymentProofNote?.value || "",
      uploadedAt: new Date().toISOString()
    };

    activeOrder = {
      ...activeOrder,
      proofOfPayment
    };
    persistLocalProofOfPayment(activeOrder.id, proofOfPayment);
    setPaymentProofMessage("Payment proof saved on this device. Start the server if you want the owner dashboard to receive it too.");
    return;
  }

  const response = await fetch(`/api/orders/${encodeURIComponent(activeOrder.id)}/proof`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filename: file.name,
      note: paymentProofNote?.value || "",
      dataUrl
    })
  });

  const result = await response.json();
  if (!response.ok) {
    if (response.status === 404) {
      const proofOfPayment = {
        imagePath: dataUrl,
        note: paymentProofNote?.value || "",
        uploadedAt: new Date().toISOString()
      };

      activeOrder = {
        ...activeOrder,
        proofOfPayment,
        source: "local_fallback"
      };
      persistLocalProofOfPayment(activeOrder.id, proofOfPayment);
      setPaymentProofMessage("This order is only saved locally right now, so the proof was stored on this device instead.");
      return;
    }

    throw new Error(result.error || "Unable to upload payment proof.");
  }

  activeOrder = result.order;
  setPaymentProofMessage("Payment proof uploaded successfully. DE GLEE can now confirm your payment.");
}

function toggleMenu() {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function closeMenu() {
  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

categoryFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  categoryFilters.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === activeCategory);
  });
  renderShop();
});

shopSearch?.addEventListener("input", (event) => {
  activeSearch = event.target.value;
  renderShop();
});

shopSort?.addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderShop();
});

shopGrid?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addToCart);
    openCart();
    return;
  }

  const openButton = event.target.closest("[data-open-product]");
  if (openButton) {
    openProductModal(openButton.dataset.openProduct);
  }
});

recommendationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(recommendationForm);
  const answers = {
    skinType: formData.get("skinType"),
    concern: formData.get("concern"),
    goal: formData.get("goal")
  };
  const recommendations = getRecommendations(answers);

  renderRecommendations(recommendations, answers);
});

recommendationGrid?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addToCart);
    openCart();
    return;
  }

  const openButton = event.target.closest("[data-open-product]");
  if (openButton) {
    openProductModal(openButton.dataset.openProduct);
  }
});

recommendationReset?.addEventListener("click", () => {
  recommendationForm?.reset();
  if (recommendationResult) {
    recommendationResult.hidden = true;
  }
  if (recommendationGrid) {
    recommendationGrid.innerHTML = "";
  }
});

productModalBody?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (!addButton) {
    return;
  }

  addToCart(addButton.dataset.addToCart);
  closeProductModal();
  openCart();
});

cartItems?.addEventListener("click", (event) => {
  const qtyButton = event.target.closest("[data-qty-change]");
  if (qtyButton) {
    const productId = qtyButton.dataset.qtyChange;
    const delta = Number(qtyButton.dataset.qtyDelta);
    const item = cartState.items.find((entry) => entry.id === productId);
    if (item) {
      updateCartQuantity(productId, item.quantity + delta);
    }
    return;
  }

  const removeButton = event.target.closest("[data-remove-item]");
  if (removeButton) {
    removeFromCart(removeButton.dataset.removeItem);
  }
});

cartToggle?.addEventListener("click", () => {
  if (cartDrawer?.classList.contains("is-open")) {
    closeCart();
  } else {
    openCart();
  }
});

cartClose?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);
productModalClose?.addEventListener("click", closeProductModal);
productModalOverlay?.addEventListener("click", closeProductModal);
checkoutBtn?.addEventListener("click", openCheckout);
checkoutModalClose?.addEventListener("click", closeCheckout);
checkoutModalOverlay?.addEventListener("click", closeCheckout);
orderSuccessClose?.addEventListener("click", closeOrderSuccess);
orderSuccessOverlay?.addEventListener("click", closeOrderSuccess);
paymentProofFile?.addEventListener("change", () => {
  uploadPaymentProof().catch((error) => {
    setPaymentProofMessage(error.message, true);
  });
});

checkoutForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitCheckout(event.currentTarget);
});

menuToggle?.addEventListener("click", toggleMenu);

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeMenu();
  closeCart();
  closeProductModal();
  closeCheckout();
  closeOrderSuccess();
});

window.addEventListener("deglee:cart-updated", () => {
  renderCart();
  if (checkoutModal && !checkoutModal.hidden) {
    renderCheckoutSummary();
  }
});

if (year) {
  year.textContent = new Date().getFullYear();
}

async function initializeStorefront() {
  await window.degleeCatalogReady;
  renderCategoryFilters();
  renderShop();
  renderCart();
}

initializeStorefront();

window.addEventListener("deglee:products-updated", () => {
  renderCategoryFilters();
  renderShop();
  renderCart();
});


