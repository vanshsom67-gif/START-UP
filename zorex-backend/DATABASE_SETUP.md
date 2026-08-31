# 🗄️ Zorexa Fashion — Database Architecture & Setup

This repository branch contains the complete database schema definitions, Mongoose models, indexes, connection setup, and dataset seed scripts for the Zorexa E-Commerce platform.

---

## 📊 Database Collections & Schemas

### 1. `users` Collection
- **Schema File:** `models/User.js`
- **Fields:**
  - `name` (String, required)
  - `email` (String, required, unique, lowercase)
  - `phone` (String, default: "")
  - `password` (String, required, select: false) — Hashed with `bcryptjs`
  - `role` (String, enum: `["user", "admin", "delivery"]`, default: `"user"`)
  - `createdAt` (Date, default: `Date.now`)

### 2. `products` Collection
- **Schema File:** `models/Product.js`
- **Fields:**
  - `name` (String, required, trim)
  - `price` (Number, required, min: 0)
  - `originalPrice` (Number, default: null)
  - `image` (String, default: placeholder)
  - `images` (Array of Strings) — Secondary product images
  - `category` (String, required, enum: `["Men's Clothing", "Women's Clothing", "Accessories", "Footwear", "Gym & Supplements"]`)
  - `description` (String)
  - `stock` (Number, default: 100)
  - `rating` (Number, default: 4.2)
  - `ratingCount` (Number, default: 120)
  - `variants` (Array of Variant objects: `{ size, color, stock }`)
  - `reviews` (Array of Review objects: `{ userId, userName, rating, comment, createdAt }`)
  - `isActive` (Boolean, default: true)

### 3. `orders` Collection
- **Schema File:** `models/Order.js`
- **Fields:**
  - `user` (ObjectId ref User, required)
  - `items` (Array of order item objects: `{ productId, name, price, image, quantity, size, color }`)
  - `subtotal` (Number, required)
  - `discount` (Number, default: 0)
  - `couponCode` (String, default: "")
  - `total` (Number, required)
  - `paymentMethod` (String, enum: `["COD", "Online", "WhatsApp", "UPI"]`)
  - `isPaid` (Boolean, default: false)
  - `paidAt` (Date)
  - `razorpayOrderId` / `razorpayPaymentId` / `razorpaySignature` (String)
  - `status` (String, enum: `["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"]`)
  - `shippingAddress` (String)
  - `deliveryNotes` (Array of `{ note, updatedBy, createdAt }`)

---

## ⚡ Initializing & Seeding Database

To populate MongoDB Atlas with initial Admin user (`admin@zorexa.com` / `admin123`) and complete product catalog (including Gym & Supplements items):

```bash
node seed.js
```
