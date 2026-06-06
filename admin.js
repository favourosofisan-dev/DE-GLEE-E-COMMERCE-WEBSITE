const adminProductList = document.getElementById("adminProductList");
const adminSearch = document.getElementById("adminSearch");
const productCount = document.getElementById("productCount");
const productForm = document.getElementById("productForm");
const editorTitle = document.getElementById("editorTitle");
const newProductBtn = document.getElementById("newProductBtn");
const deleteProductBtn = document.getElementById("deleteProductBtn");
const resetCatalogBtn = document.getElementById("resetCatalogBtn");
const adminStatus = document.getElementById("adminStatus");
const imageUpload = document.getElementById("imageUpload");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("imagePreview");
const adminOrderList = document.getElementById("adminOrderList");
const orderCount = document.getElementById("orderCount");
const adminConfigBanner = document.getElementById("adminConfigBanner");

let adminSearchTerm = "";
let selectedProductId = null;
let adminOrders = [];
let notificationsConfig = null;

function getFormField(name) {
  return productForm?.elements.namedItem(name);
}

function setAdminStatus(message) {
  if (adminStatus) {
    adminStatus.textContent = message;
  }
}

function setNewProductButtonActive(isActive) {
  newProductBtn?.classList.toggle("is-active", isActive);
}

function renderNotificationsConfig() {
  if (!adminConfigBanner || !notificationsConfig) {
    return;
  }

  if (notificationsConfig.smtpConfigured) {
    adminConfigBanner.hidden = false;
    adminConfigBanner.textContent = `Email alerts are configured through ${notificationsConfig.smtpHost}:${notificationsConfig.smtpPort}. New order alerts will be sent to ${notificationsConfig.orderAlertEmail}.`;
    adminConfigBanner.style.background = "rgba(234, 247, 237, 0.92)";
    adminConfigBanner.style.borderColor = "rgba(57, 135, 91, 0.22)";
    adminConfigBanner.style.color = "#245a38";
    return;
  }

  adminConfigBanner.hidden = false;
  adminConfigBanner.textContent = `SMTP is not configured yet. Orders will still save, but automatic email alerts are currently skipped. Add SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, and SMTP_FROM on the server to enable live email delivery.`;
  adminConfigBanner.style.background = "rgba(255, 248, 229, 0.9)";
  adminConfigBanner.style.borderColor = "rgba(192, 142, 39, 0.28)";
  adminConfigBanner.style.color = "#6b4f12";
}

function formatAdminDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

function buildProductId() {
  return `p-${Date.now()}`;
}

function getFilteredAdminProducts() {
  const query = adminSearchTerm.trim().toLowerCase();
  const products = getProducts();

  if (!query) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.categoryLabel, product.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query))
  );
}

function setPreviewImage(src) {
  if (!imagePreviewWrap || !imagePreview) {
    return;
  }

  imagePreviewWrap.hidden = !src;
  imagePreview.src = src || "";
}

function fillForm(product) {
  if (!productForm) {
    return;
  }

  getFormField("name").value = product.name || "";
  getFormField("price").value = product.price ?? "";
  getFormField("category").value = product.category || "";
  getFormField("categoryLabel").value = product.categoryLabel || "";
  getFormField("badge").value = product.badge || "";
  getFormField("image").value = product.image || "";
  getFormField("description").value = product.description || "";
  setPreviewImage(product.image || "");
  editorTitle.textContent = product.name || "Product details";
}

function createEmptyProduct() {
  return {
    id: "",
    name: "",
    category: "",
    categoryLabel: "",
    price: 0,
    description: "",
    image: "",
    badge: ""
  };
}

function selectProduct(productId) {
  setNewProductButtonActive(false);
  selectedProductId = productId;
  const product = findProductById(productId) || createEmptyProduct();
  fillForm(product);
  renderAdminProductList();
}

function renderAdminProductList() {
  if (!adminProductList) {
    return;
  }

  const products = getFilteredAdminProducts();

  if (productCount) {
    productCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
  }

  if (!products.length) {
    adminProductList.innerHTML = '<div class="admin-empty">No products match your search.</div>';
    return;
  }

  adminProductList.innerHTML = products
    .map(
      (product) => `
        <article
          class="admin-product-card${product.id === selectedProductId ? " is-active" : ""}"
        >
          <button class="admin-product-select" type="button" data-product-id="${product.id}">
            <img src="${encodeURI(product.image || "")}" alt="${product.name}">
            <span class="admin-product-copy">
              <strong>${product.name}</strong>
              <span class="admin-product-meta">
                <span>${product.categoryLabel}</span>
                <span>${formatPrice(product.price)}</span>
              </span>
            </span>
          </button>
          <button class="admin-product-delete" type="button" data-delete-product-id="${product.id}" aria-label="Delete ${product.name}">
            Delete
          </button>
        </article>
      `
    )
    .join("");
}

function persistProduct(formData) {
  const payload = {
    id: selectedProductId || "",
    name: String(formData.get("name") || "").trim(),
    price: Number(formData.get("price") || 0),
    category: String(formData.get("category") || "").trim().toLowerCase(),
    categoryLabel: String(formData.get("categoryLabel") || "").trim(),
    badge: String(formData.get("badge") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image: String(formData.get("image") || "").trim()
  };

  return saveProductRecord(payload).then((savedProduct) => {
    setNewProductButtonActive(false);
    selectedProductId = savedProduct.id;
    fillForm(savedProduct);
    renderAdminProductList();
    setAdminStatus(`Saved "${savedProduct.name}".`);
  });
}

function deleteSelectedProduct() {
  if (!selectedProductId) {
    return;
  }

  return deleteProductById(selectedProductId);
}

function deleteProductById(productId) {
  const product = findProductById(productId);
  if (!productId || !product || !window.confirm(`Delete "${product.name}" from the catalog?`)) {
    return Promise.resolve();
  }

  return deleteProductRecord(productId).then(() => {
    const products = getProducts();

    if (products.length) {
      selectedProductId = products[0].id;
      fillForm(products[0]);
    } else {
      selectedProductId = null;
      productForm.reset();
      setPreviewImage("");
      editorTitle.textContent = "Product details";
    }

    renderAdminProductList();
    setAdminStatus(`Deleted "${product.name}".`);
  });
}

function startNewProduct() {
  setNewProductButtonActive(true);
  const product = createEmptyProduct();
  selectedProductId = "";
  fillForm(product);
  renderAdminProductList();
  setAdminStatus("New product draft ready.");
}

function renderAdminOrders() {
  if (!adminOrderList) {
    return;
  }

  if (orderCount) {
    orderCount.textContent = `${adminOrders.length} order${adminOrders.length === 1 ? "" : "s"}`;
  }

  if (!adminOrders.length) {
    adminOrderList.innerHTML = '<div class="admin-empty">No delivery orders yet.</div>';
    return;
  }

  adminOrderList.innerHTML = adminOrders
    .map((order) => `
      <article class="admin-order-card">
        <div class="admin-order-meta">
          <strong>${order.reference}</strong>
          <span>${order.status.replaceAll("_", " ")}</span>
          <span>${formatAdminDate(order.createdAt)}</span>
          <span>${order.paymentProvider}</span>
        </div>
        <div class="admin-order-meta">
          <span><b>Customer:</b> ${order.customer.name}</span>
          <span><b>Phone:</b> ${order.customer.phone}</span>
          <span><b>Email:</b> ${order.customer.email}</span>
        </div>
        <div class="admin-order-meta">
          <span><b>Delivery:</b> ${order.customer.address}, ${order.customer.city}</span>
          <span><b>Account:</b> ${order.accountNumber}</span>
          <span><b>Total:</b> ${formatPrice(order.total)}</span>
        </div>
        <div class="admin-order-meta">
          <span><b>Owner email alert:</b> ${order.emailAlertStatus || "pending"}</span>
          <span><b>Customer update:</b> ${order.customerUpdateEmailStatus || "pending"}</span>
        </div>
        ${order.emailAlertError ? `<div class="admin-order-meta"><span><b>Owner alert error:</b> ${order.emailAlertError}</span></div>` : ""}
        ${order.customerUpdateEmailError ? `<div class="admin-order-meta"><span><b>Customer update error:</b> ${order.customerUpdateEmailError}</span></div>` : ""}
        <div class="admin-order-items">
          ${order.items.map((item) => `<span>${item.name} x${item.quantity}</span>`).join("")}
        </div>
        ${order.proofOfPayment ? `
          <div class="admin-order-meta">
            <span><b>Proof uploaded:</b> ${formatAdminDate(order.proofOfPayment.uploadedAt)}</span>
            <span><b>Note:</b> ${order.proofOfPayment.note || "No note added"}</span>
            <a class="button button-secondary button-small" href="${order.proofOfPayment.imagePath}" target="_blank" rel="noreferrer">View proof</a>
          </div>
        ` : '<div class="admin-order-meta"><span><b>Proof:</b> Not uploaded yet</span></div>'}
        <div class="admin-order-actions">
          <select class="admin-order-status-select" data-order-status="${order.id}">
            <option value="awaiting_payment_confirmation"${order.status === "awaiting_payment_confirmation" ? " selected" : ""}>Awaiting payment</option>
            <option value="paid"${order.status === "paid" ? " selected" : ""}>Paid</option>
            <option value="processing"${order.status === "processing" ? " selected" : ""}>Processing</option>
            <option value="shipped"${order.status === "shipped" ? " selected" : ""}>Shipped</option>
            <option value="delivered"${order.status === "delivered" ? " selected" : ""}>Delivered</option>
            <option value="cancelled"${order.status === "cancelled" ? " selected" : ""}>Cancelled</option>
          </select>
          <button class="button button-primary button-small" type="button" data-save-order-status="${order.id}">Save status</button>
          <button class="button button-secondary button-small" type="button" data-resend-owner-alert="${order.id}">Resend owner alert</button>
          <a class="button button-secondary button-small" href="mailto:${encodeURIComponent(order.customer.email)}">Email customer</a>
          <a class="button button-secondary button-small" href="${order.whatsAppUrl}" target="_blank" rel="noreferrer">WhatsApp confirmation</a>
        </div>
      </article>
    `)
    .join("");
}

async function loadAdminOrders() {
  const response = await fetch("/api/admin/orders", {
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load orders.");
  }

  const data = await response.json();
  adminOrders = Array.isArray(data.orders) ? data.orders : [];
  renderAdminOrders();
}

async function loadNotificationsConfig() {
  const response = await fetch("/api/admin/config", {
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load notification settings.");
  }

  const data = await response.json();
  notificationsConfig = data.notifications || null;
  renderNotificationsConfig();
}

async function updateOrderStatus(orderId, status) {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ status })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Unable to update order status.");
  }

  adminOrders = adminOrders.map((order) => (order.id === orderId ? result.order : order));
  renderAdminOrders();
  setAdminStatus(`Updated order ${result.order.reference} to ${result.order.status.replaceAll("_", " ")}.`);
}

async function resendOwnerAlert(orderId) {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/resend-alert`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Unable to resend owner alert.");
  }

  adminOrders = adminOrders.map((order) => (order.id === orderId ? result.order : order));
  renderAdminOrders();
  setAdminStatus(`Resent owner alert for order ${result.order.reference}.`);
}

adminProductList?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-product-id]");
  if (deleteButton) {
    deleteProductById(deleteButton.dataset.deleteProductId).catch((error) => {
      setAdminStatus(error.message);
    });
    return;
  }

  const card = event.target.closest("[data-product-id]");
  if (!card) {
    return;
  }

  selectProduct(card.dataset.productId);
});

adminOrderList?.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save-order-status]");
  if (saveButton) {
    const orderId = saveButton.dataset.saveOrderStatus;
    const select = adminOrderList.querySelector(`[data-order-status="${orderId}"]`);
    updateOrderStatus(orderId, select?.value || "").catch((error) => {
      setAdminStatus(error.message);
    });
    return;
  }

  const resendButton = event.target.closest("[data-resend-owner-alert]");
  if (!resendButton) {
    return;
  }

  resendOwnerAlert(resendButton.dataset.resendOwnerAlert).catch((error) => {
    setAdminStatus(error.message);
  });
});

adminSearch?.addEventListener("input", (event) => {
  adminSearchTerm = event.target.value;
  renderAdminProductList();
});

productForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  persistProduct(new FormData(productForm)).catch((error) => {
    setAdminStatus(error.message);
  });
});

newProductBtn?.addEventListener("click", startNewProduct);
deleteProductBtn?.addEventListener("click", () => {
  deleteSelectedProduct().catch((error) => {
    setAdminStatus(error.message);
  });
});

resetCatalogBtn?.addEventListener("click", () => {
  resetCatalog()
    .then(() => {
      const products = getProducts();
      selectedProductId = products[0]?.id || null;
      if (selectedProductId) {
        fillForm(products[0]);
      }
      renderAdminProductList();
      setAdminStatus("Catalog reset to the original demo products.");
    })
    .catch((error) => {
      setAdminStatus(error.message);
    });
});

imageUpload?.addEventListener("change", async () => {
  const file = imageUpload.files?.[0];
  if (!file) {
    return;
  }

  try {
    const uploadedImagePath = await uploadProductImage(file);
    getFormField("image").value = uploadedImagePath;
    setPreviewImage(uploadedImagePath);
    setAdminStatus(`Loaded image "${file.name}" for the current product draft.`);
  } catch (error) {
    setAdminStatus(error.message);
  }
});

window.addEventListener("deglee:products-updated", renderAdminProductList);

async function requireAdminAccess() {
  if (window.location.protocol === "file:") {
    window.location.href = "admin-login.html";
    return false;
  }

  const response = await fetch("/api/admin/session", {
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    window.location.href = "admin-login.html";
    return false;
  }

  return true;
}

async function initializeAdmin() {
  const allowed = await requireAdminAccess();
  if (!allowed) {
    return;
  }

  await window.degleeCatalogReady;
  await loadNotificationsConfig();
  await loadAdminOrders();
  const initialProducts = getProducts();
  selectedProductId = initialProducts[0]?.id || null;

  if (selectedProductId) {
    fillForm(initialProducts[0]);
  }

  renderAdminProductList();
}

initializeAdmin();
