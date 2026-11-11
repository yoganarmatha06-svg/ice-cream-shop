# 🍦 Scoop Dreams — Premium Artisanal Ice Cream E-Commerce

> *"Happiness Comes in Every Scoop!"* — A luxury, full-stack artisanal ice cream e-commerce platform built with **React (Vite)**, **Framer Motion**, **GSAP**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)** with embedded zero-config auto-fallback.

---

## ✨ Features Overview

### 🍨 Customer Experience
- **Luxury Aesthetic**: Soft pastel tones (strawberry pink, cream white, peach, mint, rich chocolate brown), rounded cards, glassmorphic floating badges, and elegant typography (*Playfair Display*, *Dancing Script*, and *Plus Jakarta Sans*).
- **Hero Section**: Parallax floating layers, award badges, and responsive call-to-actions inspired by the brand reference aesthetic.
- **Flavour Categories**: Dedicated collections for *Strawberry*, *Mango*, *Vanilla*, *Pistachio & Nuts*, *Chocolate*, *Butterscotch*, and *Fruit Flavours*.
- **Interactive Product Catalog**:
  - Live filtering by category, flavour profile, and price range slider.
  - Sorting by popularity, highest rated, price (asc/desc), and alphabetical order.
  - Quick View modal with instant portion selection (Regular Cone, Double Scoop, Family Tub, Party Tub).
  - High-res product cards with hover animations, rating stars, and one-click wishlist toggling.
- **Product Details Page**:
  - Serving size selection (120ml, 240ml, 500ml, 1000ml) with dynamic subtotal recalculation.
  - Customer review submissions with interactive star ratings.
  - Related flavours recommendations.
- **Artisanal Shopping Bag & Cart**:
  - Instant quantity steppers and portion size indicators.
  - Dynamic discount coupon application (`SCOOP20`, `SWEET10`, `WELCOME5`).
  - Free cryo-insulated delivery calculation.
- **Checkout & Express Delivery**:
  - Multi-step checkout with delivery address and phone validation.
  - Flexible payment options: **Cash on Delivery (COD)**, **Credit/Debit Card**, and **UPI / NetBanking**.
  - Confetti celebration upon order placement.
- **Live Order Tracking**:
  - Real-time status progress: `Confirmed` ➔ `Preparing Scoops` ➔ `Out for Delivery` ➔ `Delivered`.
  - Sub-zero insulated arrival countdown.
- **User Account & Wishlist**:
  - Profile management, avatar updates, saved addresses, and persistent local/cloud wishlist.

---

### 👑 Artisan Admin Portal (`/admin`)
- **Protected Role-Based Routing**: Requires an administrator account.
- **Executive Dashboard**:
  - Total Revenue, Total Orders, Active Recipes, and Registered Connoisseurs.
  - Monthly gross revenue visual chart and categories distribution bars.
  - Recent orders stream.
- **Product Management**:
  - Create, update, or delete ice cream flavours.
  - Multer image file upload or external URL link.
  - Portion pricing, stock tracking, and homepage featured toggle.
- **Category Management**:
  - Create, edit, and safely delete categories with associated recipe counts.
- **Order Management & Dispatch**:
  - Update status (`Preparing Scoops`, `Out for Delivery`, `Delivered`).
  - View full order break-down, address, customer phone, and payment channel.
- **User Management**:
  - Promote or demote users between customer and admin roles.
- **Sales Analytics & Promo Coupons**:
  - Channel distribution (COD, Cards, UPI).
  - Create, activate, or delete promo discount codes.
  - Moderate customer reviews.

---

## 🗂️ Project Structure

```
icecreamshop/
├── public/
│   └── hero-banner.jpg
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── HeroSection.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── CartItem.jsx
│   │   ├── ScrollToTop.jsx
│   │   └── Loader.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── UserProfile.jsx
│   │   ├── MyOrders.jsx
│   │   └── NotFound.jsx
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ManageProducts.jsx
│   │   ├── ManageCategories.jsx
│   │   ├── ManageOrders.jsx
│   │   ├── ManageUsers.jsx
│   │   └── SalesReports.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── hooks/
│   │   └── useScrollAnimation.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── navbar.css
│   │   ├── home.css
│   │   ├── shop.css
│   │   ├── product.css
│   │   ├── cart.css
│   │   ├── auth.css
│   │   └── admin.css
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Address.js
│   │   ├── Review.js
│   │   └── Coupon.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── seedData.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v24.21.0)
- **npm** v9+

> **Zero Database Setup Needed**: The server automatically attempts to connect to MongoDB at `mongodb://127.0.0.1:27017/scoop_dreams`. If a local MongoDB instance is not detected, it spins up an embedded in-memory MongoDB engine instantly and seeds all default categories, flavours, coupons, and demo accounts!

---

### 2. Running Both Frontend and Backend Concurrently (Recommended)

From the project root directory:

```bash
# Run both Backend API (Port 5000) and Frontend (Port 5173) simultaneously:
npm run dev:all
```

---

### 3. Or Running in Separate Terminals

#### Terminal 1 — Backend Server:
```bash
cd server
npm run dev
# Server listens at http://localhost:5000
```

#### Terminal 2 — Frontend App:
```bash
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔑 Demo Login Accounts

Pre-configured accounts ready for testing (also available with **1-Click Demo Fill buttons** on the `/login` page):

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@scoopdreams.com` | `admin123` | Complete store + `/admin` portal |
| **Customer** | `user@scoopdreams.com` | `user123` | Storefront, cart, reviews, order tracking |

---

## 🏷️ Pre-seeded Active Coupons

Test these coupons directly in the shopping cart:
- `SCOOP20` — 20% discount on orders over $15
- `SWEET10` — 10% discount on orders over $10
- `WELCOME5` — $5 flat discount on orders over $20

---

## 🧪 REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login user & issue JWT | Public |
| `GET` | `/api/auth/profile` | Get current user profile | Private |
| `GET` | `/api/products` | Fetch filtered & sorted flavours | Public |
| `GET` | `/api/products/:id` | Get flavour details & reviews | Public |
| `POST` | `/api/products` | Create new ice cream flavour | Admin |
| `PUT` | `/api/products/:id` | Update flavour details | Admin |
| `DELETE`| `/api/products/:id` | Delete flavour | Admin |
| `POST` | `/api/products/:id/reviews` | Submit a customer review | Private |
| `GET` | `/api/categories` | List all categories + recipe count | Public |
| `GET` | `/api/cart` | Get authenticated user cart | Private |
| `POST` | `/api/cart` | Add flavour to cart | Private |
| `POST` | `/api/cart/coupon/apply` | Validate & apply coupon | Private |
| `POST` | `/api/orders` | Place new order & create payment | Private |
| `GET` | `/api/orders/my-orders` | Fetch customer order history | Private |
| `GET` | `/api/admin/dashboard` | Executive KPIs & revenue charts | Admin |
| `GET` | `/api/admin/reports` | Sales breakdown & channels | Admin |
| `POST` | `/api/admin/upload` | Multer image upload | Admin |

---

## 🍧 Built With Love for Ice Cream Connoisseurs
Enjoy exploring the sweetest artisanal scoops!
