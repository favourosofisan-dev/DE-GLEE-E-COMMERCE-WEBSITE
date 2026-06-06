const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const net = require("net");
const path = require("path");
const crypto = require("crypto");
const tls = require("tls");
const vm = require("vm");
const { URL } = require("url");
const express = require("express");

loadEnvFile(path.join(__dirname, ".env"));

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "degleebeautyandcosmetics@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORd || "ChangeMe123!";
const PAYMENT_ACCOUNT_NUMBER = String(process.env.PAYMENT_ACCOUNT_NUMBER || "8061632975").trim();
const ORDER_ALERT_EMAIL = String(process.env.ORDER_ALERT_EMAIL || "degleebeautyandcosmetics@gmail.com").trim();
const WHATSAPP_PHONE = String(process.env.WHATSAPP_PHONE || "2348061632975").replace(/\D/g, "");
const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true").trim().toLowerCase() !== "false";
const SMTP_USER = String(process.env.SMTP_USER || "").trim();
const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
const SMTP_FROM = String(process.env.SMTP_FROM || ORDER_ALERT_EMAIL).trim();
const ADMIN_SESSION_COOKIE = "deglee-admin-session";
const CUSTOMER_SESSION_COOKIE = "deglee-customer-session";

const ROOT_DIR = __dirname;
const STORAGE_ROOT = path.resolve(process.env.DATA_ROOT || ROOT_DIR);
const DATA_DIR = path.join(STORAGE_ROOT, "data");
const UPLOADS_DIR = path.join(STORAGE_ROOT, "uploads");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const adminSessions = new Map();
const customerSessions = new Map();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const entries = fs.readFileSync(filePath, "utf8").split(/\r?\n/u);
  entries.forEach((entry) => {
    const line = entry.trim();
    if (!line || line.startsWith("#")) {
      return;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/u, "$2");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

async function ensureDataFiles() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });

  try {
    await fsp.access(PRODUCTS_FILE);
  } catch {
    const seed = loadProductSeed();
    await fsp.writeFile(PRODUCTS_FILE, JSON.stringify(seed, null, 2), "utf8");
  }

  try {
    await fsp.access(ORDERS_FILE);
  } catch {
    await fsp.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), "utf8");
  }

  try {
    await fsp.access(USERS_FILE);
  } catch {
    await fsp.writeFile(USERS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function loadProductSeed() {
  const productsSource = fs.readFileSync(path.join(ROOT_DIR, "products.js"), "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${productsSource}\nthis.__seed = { products: DEGLEE_PRODUCTS };`, sandbox);
  return sandbox.__seed.products;
}

async function readProducts() {
  const raw = await fsp.readFile(PRODUCTS_FILE, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeProducts(products) {
  await fsp.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
}

async function readOrders() {
  const raw = await fsp.readFile(ORDERS_FILE, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeOrders(orders) {
  await fsp.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

async function readUsers() {
  const raw = await fsp.readFile(USERS_FILE, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeUsers(users) {
  await fsp.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

async function updateOrderById(orderId, updater) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index < 0) {
    return null;
  }

  const nextOrder = updater(orders[index]);
  orders[index] = nextOrder;
  await writeOrders(orders);
  return nextOrder;
}

function createSession(store, payload) {
  const token = crypto.randomBytes(24).toString("hex");
  store.set(token, {
    ...payload,
    createdAt: Date.now()
  });
  return token;
}

function getCookies(request) {
  const header = request.headers.cookie || "";
  return header.split(";").reduce((cookies, entry) => {
    const [name, ...valueParts] = entry.trim().split("=");
    if (!name) {
      return cookies;
    }
    cookies[name] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});
}

function getAdminSession(request) {
  const cookies = getCookies(request);
  const token = cookies[ADMIN_SESSION_COOKIE];
  if (!token) {
    return null;
  }

  return adminSessions.get(token) || null;
}

function getCustomerSession(request) {
  const cookies = getCookies(request);
  const token = cookies[CUSTOMER_SESSION_COOKIE];
  if (!token) {
    return null;
  }

  return customerSessions.get(token) || null;
}

function isAdminAuthenticated(request) {
  return Boolean(getAdminSession(request));
}

function isCustomerAuthenticated(request) {
  return Boolean(getCustomerSession(request));
}

function buildCookie(name, value, overrides = {}) {
  const options = {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    ...overrides
  };

  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join("; ");
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function redirect(response, location) {
  response.writeHead(302, {
    Location: location
  });
  response.end();
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash || "").split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const derivedHash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derivedHash, "hex"), Buffer.from(expectedHash, "hex"));
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider || "email"
  };
}

function createOrderReference() {
  return `DGL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function buildWhatsAppUrl(message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
}

function buildEmailAlertUrl(subject, body) {
  return `mailto:${encodeURIComponent(ORDER_ALERT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function escapeSmtpText(value) {
  return String(value || "")
    .replace(/\r?\n/g, "\r\n")
    .replace(/^\./gm, "..");
}

function toSmtpAddress(value) {
  return `<${String(value || "").trim()}>`;
}

async function sendSmtpMail({ to, subject, text }) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return { sent: false, skipped: true, reason: "SMTP is not configured." };
  }

  const socket = SMTP_SECURE
    ? tls.connect(SMTP_PORT, SMTP_HOST, { servername: SMTP_HOST })
    : net.connect(SMTP_PORT, SMTP_HOST);

  socket.setEncoding("utf8");

  await new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    socket.once("error", onError);
    socket.once("secureConnect", () => {
      socket.off("error", onError);
      resolve();
    });
    socket.once("connect", () => {
      if (SMTP_SECURE) {
        return;
      }
      socket.off("error", onError);
      resolve();
    });
  });

  let buffer = "";

  const readResponse = () =>
    new Promise((resolve, reject) => {
      const onData = (chunk) => {
        buffer += chunk;
        const lines = buffer.split("\r\n");
        buffer = lines.pop();
        const completeLines = lines.filter(Boolean);
        if (!completeLines.length) {
          return;
        }

        const lastLine = completeLines[completeLines.length - 1];
        if (/^\d{3} /.test(lastLine)) {
          socket.off("data", onData);
          const code = Number(lastLine.slice(0, 3));
          if (code >= 400) {
            reject(new Error(completeLines.join(" ")));
            return;
          }

          resolve({ code, lines: completeLines });
        }
      };

      socket.on("data", onData);
      socket.once("error", reject);
    });

  const writeCommand = async (command) => {
    socket.write(`${command}\r\n`);
    return readResponse();
  };

  await readResponse();
  await writeCommand(`EHLO ${HOST}`);
  await writeCommand("AUTH LOGIN");
  await writeCommand(Buffer.from(SMTP_USER, "utf8").toString("base64"));
  await writeCommand(Buffer.from(SMTP_PASS, "utf8").toString("base64"));
  await writeCommand(`MAIL FROM:${toSmtpAddress(SMTP_FROM)}`);
  await writeCommand(`RCPT TO:${toSmtpAddress(to)}`);
  await writeCommand("DATA");

  const message = [
    `From: DE GLEE <${SMTP_FROM}>`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    escapeSmtpText(text),
    "."
  ].join("\r\n");

  socket.write(`${message}\r\n`);
  await readResponse();
  await writeCommand("QUIT");
  socket.end();

  return { sent: true };
}

function normalizeCheckoutPayload(payload) {
  const customer = payload && typeof payload.customer === "object" ? payload.customer : {};
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return {
    customer: {
      name: String(customer.name || "").trim(),
      email: String(customer.email || "").trim(),
      phone: String(customer.phone || "").trim(),
      address: String(customer.address || "").trim(),
      city: String(customer.city || "").trim()
    },
    payment: String(payload?.payment || "").trim().toLowerCase(),
    items: items
      .map((item) => ({
        id: String(item.id || "").trim(),
        name: String(item.name || "").trim(),
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0)
      }))
      .filter((item) => item.id && item.quantity > 0),
    subtotal: Number(payload?.subtotal || 0),
    shipping: Number(payload?.shipping || 0),
    total: Number(payload?.total || 0)
  };
}

function normalizeOrderStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  return ["awaiting_payment_confirmation", "paid", "processing", "shipped", "delivered", "cancelled"].includes(value)
    ? value
    : "";
}

function formatOrderLines(items) {
  return items.map((item) => `${item.name} x${item.quantity}`).join(", ");
}

function buildOrderAlertMessage(order) {
  return [
    `New DE GLEE order: ${order.reference}`,
    `Customer: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}, ${order.customer.city}`,
    `Payment method: ${order.paymentProvider}`,
    `Items: ${formatOrderLines(order.items)}`,
    `Total: ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(order.total)}`,
    `Account number used: ${order.accountNumber}`
  ].join("\n");
}

function buildCustomerStatusMessage(order) {
  return [
    `Hello ${order.customer.name},`,
    "",
    `Your DE GLEE order ${order.reference} is now marked as ${order.status.replaceAll("_", " ")}.`,
    `Payment method: ${order.paymentProvider}`,
    `Delivery address: ${order.customer.address}, ${order.customer.city}`,
    "",
    "Thank you for shopping with DE GLEE."
  ].join("\n");
}

function getNotificationsConfig() {
  return {
    smtpConfigured: Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM),
    smtpHost: SMTP_HOST || "",
    smtpPort: SMTP_PORT,
    smtpSecure: SMTP_SECURE,
    smtpFrom: SMTP_FROM || "",
    orderAlertEmail: ORDER_ALERT_EMAIL
  };
}

async function sendOwnerOrderAlert(order) {
  const ownerMessage = buildOrderAlertMessage(order);
  const emailResult = await sendSmtpMail({
    to: ORDER_ALERT_EMAIL,
    subject: `New DE GLEE order ${order.reference}`,
    text: ownerMessage
  }).catch((error) => ({
    sent: false,
    skipped: false,
    reason: error.message
  }));

  const savedOrder = await updateOrderById(order.id, (currentOrder) => ({
    ...currentOrder,
    emailAlertStatus: emailResult.sent ? "sent" : emailResult.skipped ? "skipped" : "failed",
    emailAlertError: emailResult.reason || "",
    ownerAlertLastAttemptAt: new Date().toISOString()
  }));

  return {
    order: savedOrder || order,
    emailResult,
    emailAlertUrl: buildEmailAlertUrl(`New DE GLEE order ${order.reference}`, ownerMessage)
  };
}

function sanitizeFilename(filename) {
  const ext = path.extname(filename || "").toLowerCase();
  const safeBase = path
    .basename(filename || "upload", ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "upload";

  return `${Date.now()}-${safeBase}${ext || ".png"}`;
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/u.exec(dataUrl || "");
  if (!match) {
    throw new Error("Invalid image payload.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function isAllowedImageMimeType(mimeType) {
  return ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(mimeType);
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/products") {
    const products = await readProducts();
    return sendJson(response, 200, { products });
  }

  if (request.method === "GET" && url.pathname === "/api/auth/session") {
    const session = getCustomerSession(request);
    if (!session) {
      return sendJson(response, 401, { error: "Unauthorized." });
    }

    const users = await readUsers();
    const user = users.find((entry) => entry.id === session.userId);
    if (!user) {
      return sendJson(response, 401, { error: "Unauthorized." });
    }

    return sendJson(response, 200, {
      authenticated: true,
      user: publicUser(user)
    });
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJsonBody(request);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return sendJson(response, 400, { error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return sendJson(response, 400, { error: "Password must be at least 6 characters." });
    }

    const users = await readUsers();
    if (users.some((user) => user.email === email)) {
      return sendJson(response, 409, { error: "An account with this email already exists." });
    }

    const user = {
      id: `u-${Date.now()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      provider: "email",
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeUsers(users);

    const token = createSession(customerSessions, {
      userId: user.id,
      email: user.email
    });

    return sendJson(
      response,
      201,
      {
        success: true,
        user: publicUser(user)
      },
      {
        "Set-Cookie": buildCookie(CUSTOMER_SESSION_COOKIE, token)
      }
    );
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const users = await readUsers();
    const user = users.find((entry) => entry.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendJson(response, 401, { error: "Incorrect email or password." });
    }

    const token = createSession(customerSessions, {
      userId: user.id,
      email: user.email
    });

    return sendJson(
      response,
      200,
      {
        success: true,
        user: publicUser(user)
      },
      {
        "Set-Cookie": buildCookie(CUSTOMER_SESSION_COOKIE, token)
      }
    );
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    const cookies = getCookies(request);
    const token = cookies[CUSTOMER_SESSION_COOKIE];
    if (token) {
      customerSessions.delete(token);
    }

    return sendJson(
      response,
      200,
      { success: true },
      {
        "Set-Cookie": buildCookie(CUSTOMER_SESSION_COOKIE, "", { maxAge: 0 })
      }
    );
  }

  if (request.method === "POST" && url.pathname === "/api/checkout/initiate") {
    const payload = normalizeCheckoutPayload(await readJsonBody(request));

    if (!["palmpay", "opay"].includes(payload.payment)) {
      return sendJson(response, 400, { error: "Choose PalmPay or OPay to continue." });
    }

    if (!payload.customer.name || !payload.customer.email || !payload.customer.phone || !payload.customer.address || !payload.customer.city) {
      return sendJson(response, 400, { error: "Complete all checkout fields before paying." });
    }

    if (!payload.items.length || payload.total <= 0) {
      return sendJson(response, 400, { error: "Your cart is empty." });
    }

    const reference = createOrderReference();
    const paymentProvider = payload.payment === "palmpay" ? "PalmPay" : "OPay";
    const order = {
      id: reference,
      reference,
      createdAt: new Date().toISOString(),
      status: "awaiting_payment_confirmation",
      paymentProvider,
      accountNumber: PAYMENT_ACCOUNT_NUMBER,
      customer: payload.customer,
      items: payload.items,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      total: payload.total,
      ownerAlertEmail: ORDER_ALERT_EMAIL,
      emailAlertStatus: "pending",
      emailAlertError: "",
      proofOfPayment: null,
      whatsAppUrl: buildWhatsAppUrl(`Hello DE GLEE, I have made payment for order ${reference}. My name is ${payload.customer.name}. Please confirm my delivery.`)
    };

    const orders = await readOrders();
    orders.unshift(order);
    await writeOrders(orders);

    const alertResult = await sendOwnerOrderAlert(order);

    return sendJson(response, 200, {
      success: true,
      order: {
        ...alertResult.order,
        emailAlertUrl: alertResult.emailAlertUrl
      }
    });
  }

  if (request.method === "POST" && /^\/api\/orders\/[^/]+\/proof$/u.test(url.pathname)) {
    const orderId = decodeURIComponent(url.pathname.split("/")[3] || "");
    const body = await readJsonBody(request);
    const { mimeType, buffer } = parseDataUrl(String(body.dataUrl || ""));

    if (!isAllowedImageMimeType(mimeType)) {
      return sendJson(response, 400, { error: "Only JPG, PNG, and WEBP proofs are allowed." });
    }

    const filename = sanitizeFilename(String(body.filename || `${orderId}-payment-proof`));
    await fsp.writeFile(path.join(UPLOADS_DIR, filename), buffer);

    const proofOfPayment = {
      imagePath: `/uploads/${filename}`,
      note: String(body.note || "").trim(),
      uploadedAt: new Date().toISOString()
    };

    const order = await updateOrderById(orderId, (currentOrder) => ({
      ...currentOrder,
      proofOfPayment
    }));

    if (!order) {
      return sendJson(response, 404, { error: "Order not found." });
    }

    return sendJson(response, 200, { success: true, order });
  }

  if (request.method === "GET" && url.pathname === "/api/admin/session") {
    const session = getAdminSession(request);
    if (!session) {
      return sendJson(response, 401, { error: "Unauthorized." });
    }

    return sendJson(response, 200, {
      authenticated: true,
      user: {
        email: session.email,
        role: "admin"
      }
    });
  }

  if (request.method === "POST" && url.pathname === "/api/admin/login") {
    const body = await readJsonBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return sendJson(response, 401, { error: "Incorrect owner email or password." });
    }

    const token = createSession(adminSessions, { email });
    return sendJson(
      response,
      200,
      {
        success: true,
        user: {
          email,
          role: "admin"
        }
      },
      {
        "Set-Cookie": buildCookie(ADMIN_SESSION_COOKIE, token)
      }
    );
  }

  if (request.method === "POST" && url.pathname === "/api/admin/logout") {
    const cookies = getCookies(request);
    const token = cookies[ADMIN_SESSION_COOKIE];
    if (token) {
      adminSessions.delete(token);
    }

    return sendJson(
      response,
      200,
      { success: true },
      {
        "Set-Cookie": buildCookie(ADMIN_SESSION_COOKIE, "", { maxAge: 0 })
      }
    );
  }

  if (!isAdminAuthenticated(request)) {
    return sendJson(response, 401, { error: "Admin login required." });
  }

  if (request.method === "GET" && url.pathname === "/api/admin/config") {
    return sendJson(response, 200, {
      notifications: getNotificationsConfig()
    });
  }

  if (request.method === "GET" && url.pathname === "/api/admin/orders") {
    const orders = await readOrders();
    return sendJson(response, 200, { orders });
  }

  if (request.method === "POST" && /^\/api\/admin\/orders\/[^/]+\/resend-alert$/u.test(url.pathname)) {
    const orderId = decodeURIComponent(url.pathname.split("/")[4] || "");
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);

    if (!order) {
      return sendJson(response, 404, { error: "Order not found." });
    }

    const alertResult = await sendOwnerOrderAlert(order);
    return sendJson(response, 200, {
      success: true,
      order: alertResult.order
    });
  }

  if (request.method === "PUT" && /^\/api\/admin\/orders\/[^/]+\/status$/u.test(url.pathname)) {
    const orderId = decodeURIComponent(url.pathname.split("/")[4] || "");
    const body = await readJsonBody(request);
    const status = normalizeOrderStatus(body.status);

    if (!status) {
      return sendJson(response, 400, { error: "Choose a valid order status." });
    }

    const order = await updateOrderById(orderId, (currentOrder) => ({
      ...currentOrder,
      status,
      updatedAt: new Date().toISOString()
    }));

    if (!order) {
      return sendJson(response, 404, { error: "Order not found." });
    }

    const emailResult = await sendSmtpMail({
      to: order.customer.email,
      subject: `DE GLEE order update ${order.reference}`,
      text: buildCustomerStatusMessage(order)
    }).catch((error) => ({
      sent: false,
      skipped: false,
      reason: error.message
    }));

    const savedOrder = await updateOrderById(orderId, (currentOrder) => ({
      ...currentOrder,
      customerUpdateEmailStatus: emailResult.sent ? "sent" : emailResult.skipped ? "skipped" : "failed",
      customerUpdateEmailError: emailResult.reason || ""
    }));

    return sendJson(response, 200, { success: true, order: savedOrder || order });
  }

  if (request.method === "POST" && url.pathname === "/api/products/reset") {
    const seed = loadProductSeed();
    await writeProducts(seed);
    return sendJson(response, 200, { success: true, products: seed });
  }

  if (request.method === "POST" && url.pathname === "/api/products") {
    const body = await readJsonBody(request);
    const products = await readProducts();
    const product = normalizeProduct({
      ...body,
      id: `p-${Date.now()}`
    });

    products.unshift(product);
    await writeProducts(products);
    return sendJson(response, 201, { product });
  }

  if (request.method === "PUT" && url.pathname.startsWith("/api/products/")) {
    const productId = decodeURIComponent(url.pathname.replace("/api/products/", ""));
    const body = await readJsonBody(request);
    const products = await readProducts();
    const index = products.findIndex((product) => product.id === productId);

    if (index < 0) {
      return sendJson(response, 404, { error: "Product not found." });
    }

    const product = normalizeProduct({
      ...body,
      id: productId
    });
    products[index] = product;
    await writeProducts(products);
    return sendJson(response, 200, { product });
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/products/")) {
    const productId = decodeURIComponent(url.pathname.replace("/api/products/", ""));
    const products = await readProducts();
    const nextProducts = products.filter((product) => product.id !== productId);

    if (nextProducts.length === products.length) {
      return sendJson(response, 404, { error: "Product not found." });
    }

    await writeProducts(nextProducts);
    return sendJson(response, 200, { success: true });
  }

  if (request.method === "POST" && url.pathname === "/api/upload") {
    const body = await readJsonBody(request);
    const { mimeType, buffer } = parseDataUrl(String(body.dataUrl || ""));

    if (!isAllowedImageMimeType(mimeType)) {
      return sendJson(response, 400, { error: "Only JPG, PNG, and WEBP uploads are allowed." });
    }

    const filename = sanitizeFilename(String(body.filename || "upload"));
    await fsp.writeFile(path.join(UPLOADS_DIR, filename), buffer);
    return sendJson(response, 201, {
      success: true,
      imagePath: `/uploads/${filename}`
    });
  }

  return sendJson(response, 404, { error: "Not found." });
}

function normalizeProduct(product) {
  return {
    id: String(product.id || "").trim(),
    name: String(product.name || "").trim(),
    category: String(product.category || "").trim().toLowerCase(),
    categoryLabel: String(product.categoryLabel || "").trim(),
    price: Number(product.price || 0),
    description: String(product.description || "").trim(),
    image: String(product.image || "").trim(),
    badge: String(product.badge || "").trim()
  };
}

function resolveStaticPath(urlPath) {
  if (urlPath === "/favicon.ico") {
    return path.join(ROOT_DIR, "favicon.svg");
  }

  if (urlPath === "/" || urlPath === "/index") {
    return path.join(ROOT_DIR, "index.html");
  }

  if (urlPath === "/shop") {
    return path.join(ROOT_DIR, "shop.html");
  }

  if (urlPath === "/admin-login") {
    return path.join(ROOT_DIR, "admin-login.html");
  }

  if (urlPath === "/admin") {
    return path.join(ROOT_DIR, "admin.html");
  }

  const cleanPath = path.normalize(urlPath.replace(/^\/+/, ""));
  return path.join(ROOT_DIR, cleanPath);
}

function isPathInsideRoot(targetPath) {
  const relativePath = path.relative(ROOT_DIR, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

async function serveStatic(request, response, url) {
  if ((url.pathname === "/admin" || url.pathname === "/admin.html") && !isAdminAuthenticated(request)) {
    return redirect(response, "/admin-login");
  }

  let filePath = resolveStaticPath(url.pathname);

  if (!isPathInsideRoot(filePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const stats = await fsp.stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const contents = await fsp.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentType
    });
    response.end(contents);
  } catch {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Not found");
  }
}

// Convert the existing server logic into a request handler that can be exported
// for serverless platforms (Vercel) while still allowing local `listen()`.
const requestHandler = async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, {
      error: "Server error.",
      details: error.message
    });
  }
};

const app = express();

app.use((request, response, next) => {
  if ((request.path === "/admin" || request.path === "/admin.html") && !isAdminAuthenticated(request)) {
    response.redirect(302, "/admin-login");
    return;
  }

  next();
});

app.use(express.static(ROOT_DIR));
app.use(requestHandler);

ensureDataFiles().catch((error) => {
  console.error("Unable to ensure data files:", error);
  if (require.main === module && process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});

if (require.main === module && process.env.NODE_ENV !== "production") {
  http.createServer(app).listen(PORT, HOST, () => {
    console.log(`DE GLEE server running at http://${HOST}:${PORT}`);
    console.log(`Admin email: ${ADMIN_EMAIL}`);
    console.log(
      ADMIN_PASSWORD === "ChangeMe123!"
        ? "Admin password is using the default value. Set ADMIN_PASSWORD before sharing this."
        : "Admin password loaded from environment."
    );
  });
} else if (process.env.NODE_ENV === "production") {
  console.log("DE GLEE ready for serverless hosting (production). Files ensured and handler exported.");
}

module.exports = app;

