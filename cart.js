const CART_STORAGE_KEY = "deglee-cart-v1";
const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 5000;

const cartState = {
  items: []
};

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    cartState.items = saved ? JSON.parse(saved) : [];
  } catch {
    cartState.items = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState.items));
}

function getProductById(id) {
  return findProductById(id);
}

function toNairaAmount(amount) {
  const numericAmount = Number(amount || 0);
  return numericAmount >= 1000 ? numericAmount : numericAmount * 1000;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);
}

function getCartCount() {
  return cartState.items.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
  return cartState.items.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product ? toNairaAmount(product.price) * item.quantity : 0);
  }, 0);
}

function getShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
}

function getCartTotal() {
  const subtotal = getCartSubtotal();
  return subtotal + getShipping(subtotal);
}

function addToCart(productId, quantity = 1) {
  const existing = cartState.items.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartState.items.push({ id: productId, quantity });
  }

  saveCart();
  dispatchCartUpdate();
}

function updateCartQuantity(productId, quantity) {
  const item = cartState.items.find((entry) => entry.id === productId);
  if (!item) {
    return;
  }

  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = quantity;
  saveCart();
  dispatchCartUpdate();
}

function removeFromCart(productId) {
  cartState.items = cartState.items.filter((item) => item.id !== productId);
  saveCart();
  dispatchCartUpdate();
}

function clearCart() {
  cartState.items = [];
  saveCart();
  dispatchCartUpdate();
}

function dispatchCartUpdate() {
  window.dispatchEvent(new CustomEvent("deglee:cart-updated"));
}

loadCart();
