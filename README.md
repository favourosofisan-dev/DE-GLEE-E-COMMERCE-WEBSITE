# DE GLEE — Beauty Ecommerce

A mobile first ecommerce webapp for **DE GLEE**, a beauty and cosmetics brand. Built with plain HTML, CSS, and JavaScript — no build step required.

## Features

- **Product catalog** — curated products from your `images/` folder with prices and categories
- **Shop** — search, category filters, and sort (featured, price, name)
- **Shopping cart** — add to cart, adjust quantities, persistent cart via `localStorage`
- **Account** — email sign up / sign in, Continue with Google or Apple (demo), then enter the shop
- **Checkout** — demo order form (contact, delivery, payment method)
- **Product details** — quick-view modal for each item
- **Brand experience** — hero, story, and “Why DE GLEE” sections with your existing luxury aesthetic

## Files

| File | Purpose |
|------|---------|
| `index.html` | Sign in / sign up landing page |
| `shop.html` | Store page, shop, cart drawer, modals |
| `auth.js` / `auth.css` / `session.js` | Demo authentication (localStorage) |
| `styles.css` | Visual system and responsive layout |
| `products.js` | Product catalog and categories |
| `cart.js` | Cart state, pricing, localStorage |
| `app.js` | UI rendering and interactions |
| `images/` | Product photos and logo |

## Run locally

For the protected owner dashboard and backend APIs, run the local Node server:

```bash
npm start
```

Then open `http://127.0.0.1:3000`.

Owner dashboard login:

- Email: `degleebeautyandcosmetics@gmail.com`
- Password: `ChangeMe123!`

Change those credentials with environment variables before sharing or deploying:

```bash
set ADMIN_EMAIL=you@example.com
set ADMIN_PASSWORD=your-strong-password
npm start
```

## Going live

This project now includes a lightweight Node backend for:

- Protected owner login
- Product CRUD via `/api/products`
- Image uploads saved to `/uploads`
- Product persistence in `data/products.json`

To accept real orders you will still need:

1. A backend or service (e.g. Shopify, Stripe Checkout, Paystack) for payments
2. Replace the demo checkout submit handler in `app.js` with your API call
3. Optional: connect inventory and admin for product management

## Shipping

Free shipping is applied automatically when the cart subtotal is **₦50,000** or more; otherwise a flat **₦5,000** shipping fee is shown.

## PalmPay and OPay setup

The checkout form now saves each order to the backend, shows the account number for transfer, and lets the customer send payment proof on WhatsApp.

Set your payment and contact details before starting the server:

```bash
set PAYMENT_ACCOUNT_NUMBER=8061632975
set ORDER_ALERT_EMAIL=degleebeautyandcosmetics@gmail.com
set WHATSAPP_PHONE=2348061632975
set SMTP_HOST=smtp.example.com
set SMTP_PORT=465
set SMTP_SECURE=true
set SMTP_USER=your-smtp-username
set SMTP_PASS=your-smtp-password
set SMTP_FROM=degleebeautyandcosmetics@gmail.com
npm start
```

Orders are stored in `data/orders.json` and are available in the owner dashboard at `/admin`.
If SMTP is configured, the server also sends automatic owner alerts for new orders and customer email updates when the order status changes.
