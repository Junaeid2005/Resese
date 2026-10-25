# Savory Bite — Restaurant Management & Online Ordering System

A full-stack, modern restaurant ordering web application with customer and administrator portals, built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Firebase** (Firestore and Authentication).

---

## 🍽️ Key Features

### 👤 Customer Portal
- **Culinary Showcase & Menu Catalog**:
  - Live dishes categorized by **Burgers**, **Pizza**, **Pasta**, **Sides**, and **Drinks**.
  - Real-time search by dish title and ingredients, sorting by price or popularity, and stock availability toggles.
  - Initial sample dishes: Classic Burger (€8.50), Margherita Pizza (€9.00), Creamy Pasta (€10.50), French Fries (€3.50), Chicken Wrap (€7.50), Fresh Lemonade (€2.50).
- **Persistent Shopping Cart**:
  - Stored in Cloud Firestore under user-isolated documents (`/carts/{userId}`).
  - Retains items across browser refreshes, restarts, and different devices.
  - Safe hydration prevents empty cart overwrites on page load.
  - Safe guest cart merging upon sign-in.
- **Delivery Checkout**:
  - Customer contact details, delivery address, notes, and order breakdown.
  - **Cash on Delivery (COD)** payment support (clearly labelled practice version).
  - Authoritative re-verification of prices directly against database catalog items to prevent client tampering.
  - **Email verification requirement**: users must verify their email before order placement.
- **Customer Dashboard**:
  - Real-time order tracking: `Pending` → `Confirmed` → `Preparing` → `Ready` → `Out for Delivery` → `Delivered` / `Cancelled`.
  - Immutable historical order item snapshots.
  - Saved delivery address preferences and customer profile updates.

---

### 🛡️ Administrator Portal (Protected)
- **Role-Based Access Control**:
  - Ordinary users cannot access administrative views or mutate sensitive data.
  - Primary root administrator bootstrapped to `junaeidshohan@gmail.com` in Firestore security rules.
  - Support for secondary administrators via the `/admins/{userId}` Firestore collection.
- **Analytics & Financial Intelligence**:
  - Real-time KPI summary cards: Total Orders, Pending Orders, Completed Orders, Gross Sales, Operating Expenses, Food Costs, and Estimated Operating Profit.
  - Date range filters: `Today`, `Last 7 Days`, `Last 30 Days`, `All Time`.
  - Interactive SVG sales volume trend charts.
  - Clear accounting formula: `Gross Sales - Food Raw Costs - Operating Expenses = Estimated Operating Profit`.
- **Menu Catalog Management**:
  - Add new dishes, edit descriptions, adjust retail selling prices and private raw cost prices.
  - One-click stock availability toggling (In Stock / Sold Out).
  - Delete dishes with confirmation dialog (retaining historical order snapshots intact).
- **Order Dispatch & Fulfillment**:
  - Live orders stream with status filters and customer search.
  - Detail drawer with frozen pricing snapshots and driver contact details.
  - Order status transitions and Cash on Delivery payment collection logging.
  - Inspection of customer past order history.
- **Operating Expense Ledger**:
  - Record business expenses (Ingredients, Utilities, Salaries, Rent, Marketing, Packaging, Equipment, Delivery, Other).
  - Automatic calculation of total operating expenses factored into net profit.
- **Restaurant Profile & Settings**:
  - Edit restaurant name, logo URL, bio, phone, email, physical address, opening hours, delivery fee, and promotional banner text.

---

## 🔒 Security Architecture & Firestore Rules

1. **Cart Isolation**:
   ```javascript
   match /carts/{userId} {
     allow read, write: if isSignedIn() && request.auth.uid == userId;
   }
   ```
2. **Order Integrity & Verification**:
   ```javascript
   match /orders/{orderId} {
     allow get, list: if isSignedIn() && (resource.data.customerId == request.auth.uid || isAdmin());
     allow create: if isSignedIn() && isEmailVerified() && request.resource.data.customerId == request.auth.uid;
     allow update, delete: if isAdmin();
   }
   ```
3. **Admin Confidentiality**:
   Operating expenses (`/expenses/{expenseId}`) and administrative settings can only be accessed by verified administrators.

---

## 🚀 Netlify Deployment Guide

### 1. Build Configuration
The project is configured via `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **SPA Rewrites**: Redirects `/*` to `/index.html` with status `200` to support client-side routing.

### 2. Deploy via Netlify CLI or Git
```bash
# Push to GitHub
git add .
git commit -m "feat: complete Savory Bite restaurant application"
git push origin main
```
In the Netlify dashboard:
1. Select **Add new site** → **Import an existing project** → select your Git repository.
2. Confirm the build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Click **Deploy site**.

### 3. Firebase Console Configuration
1. Go to [Firebase Console](https://console.firebase.google.com).
2. Select your provisioned project (`festive-edition-2c70r`).
3. Under **Authentication** → **Settings** → **Authorized domains**:
   - Add your Netlify domain (e.g., `your-restaurant-app.netlify.app`).
   - This ensures Google Sign-In popups and email verification links work smoothly.
4. Under **Authentication** → **Sign-in method**:
   - Ensure **Google** and **Email/Password** providers are enabled.

---

## 🧪 Testing Checklist
- [x] Customer registration with password confirmation
- [x] Email verification flow and order gate
- [x] Google 1-click Sign-In
- [x] Persistent shopping cart across page reloads
- [x] Cash on Delivery order placement with authoritative price recalculation
- [x] Real-time order status tracking in Customer Dashboard
- [x] Admin portal access control (blocks unauthorized customer accounts)
- [x] Admin menu creation, price editing, and stock toggling
- [x] Admin order status transitions and Cash collection logging
- [x] Financial analytics: Gross Sales, Food Costs, Expenses, and Estimated Profit
