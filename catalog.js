const PRODUCT_STORAGE_KEY = "deglee-products-v1";

const catalogState = {
  products: cloneProducts(DEGLEE_PRODUCTS),
  loaded: false,
  source: "seed"
};

function cloneProducts(products) {
  return products.map((product) => ({ ...product }));
}

function getDefaultProducts() {
  return cloneProducts(DEGLEE_PRODUCTS);
}

function getDefaultCategories() {
  return [{ id: "all", label: "All products" }].concat(
    DEGLEE_CATEGORIES.filter((category) => category.id !== "all").map((category) => ({ ...category }))
  );
}

function getProducts() {
  return cloneProducts(catalogState.products);
}

function setCatalogProducts(products, source = "local") {
  catalogState.products = cloneProducts(products);
  catalogState.loaded = true;
  catalogState.source = source;
  window.dispatchEvent(new CustomEvent("deglee:products-updated"));
}

function loadProductsFromLocalStorage() {
  try {
    const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!raw) {
      return getDefaultProducts();
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultProducts();
  } catch {
    return getDefaultProducts();
  }
}

function saveProductsToLocalStorage(products) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  setCatalogProducts(products, "local");
}

function resetProducts() {
  localStorage.removeItem(PRODUCT_STORAGE_KEY);
  setCatalogProducts(getDefaultProducts(), "seed");
}

function getCatalogCategories() {
  const categoryMap = new Map(
    getDefaultCategories().map((category) => [category.id, { ...category }])
  );

  getProducts().forEach((product) => {
    if (!product.category || !product.categoryLabel) {
      return;
    }

    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, {
        id: product.category,
        label: product.categoryLabel
      });
    }
  });

  return [{ id: "all", label: "All products" }].concat(
    [...categoryMap.values()].filter((category) => category.id !== "all")
  );
}

function findProductById(id) {
  return getProducts().find((product) => product.id === id);
}

function supportsApiCatalog() {
  return window.location.protocol !== "file:";
}

async function loadProducts() {
  if (supportsApiCatalog()) {
    try {
      const response = await fetch("/api/products", {
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Catalog request failed.");
      }

      const payload = await response.json();
      const products = Array.isArray(payload.products) ? payload.products : getDefaultProducts();
      setCatalogProducts(products, "api");
      return getProducts();
    } catch {
      const localProducts = loadProductsFromLocalStorage();
      setCatalogProducts(localProducts, "local");
      return getProducts();
    }
  }

  const localProducts = loadProductsFromLocalStorage();
  setCatalogProducts(localProducts, "local");
  return getProducts();
}

async function saveProductRecord(product) {
  if (supportsApiCatalog()) {
    const method = product.id ? "PUT" : "POST";
    const endpoint = product.id ? `/api/products/${encodeURIComponent(product.id)}` : "/api/products";

    const response = await fetch(endpoint, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      const error = await safeJson(response);
      throw new Error(error?.error || "Unable to save product.");
    }

    const payload = await response.json();
    await loadProducts();
    return payload.product;
  }

  const products = getProducts();
  const payload = {
    ...product,
    id: product.id || `p-${Date.now()}`
  };
  const existingIndex = products.findIndex((entry) => entry.id === payload.id);

  if (existingIndex >= 0) {
    products[existingIndex] = payload;
  } else {
    products.unshift(payload);
  }

  saveProductsToLocalStorage(products);
  return payload;
}

async function deleteProductRecord(productId) {
  if (supportsApiCatalog()) {
    const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const error = await safeJson(response);
      throw new Error(error?.error || "Unable to delete product.");
    }

    await loadProducts();
    return;
  }

  const products = getProducts().filter((product) => product.id !== productId);
  saveProductsToLocalStorage(products);
}

async function resetCatalog() {
  if (supportsApiCatalog()) {
    const response = await fetch("/api/products/reset", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const error = await safeJson(response);
      throw new Error(error?.error || "Unable to reset catalog.");
    }

    await loadProducts();
    return;
  }

  resetProducts();
}

async function uploadProductImage(file) {
  const dataUrl = await readFileAsDataUrl(file);

  if (supportsApiCatalog()) {
    const response = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        dataUrl
      })
    });

    if (!response.ok) {
      const error = await safeJson(response);
      throw new Error(error?.error || "Unable to upload image.");
    }

    const payload = await response.json();
    return payload.imagePath;
  }

  return dataUrl;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

window.degleeCatalogReady = loadProducts();
