# 🚀 Zorexa Fashion — Production Deployment & Custom Domain Guide

This guide walks you step-by-step through taking **Zorexa Fashion** live on the internet with your own custom domain (e.g., `www.zorexafashion.com` or `www.zorexa.in`).

---

## 🌟 Option 1: Render.com (Recommended — 100% Free / Easiest)

Render can host the full-stack unified app (Frontend + Backend API + Static Assets) on a single web service.

### Step 1: Push Code to GitHub
1. Create a repository on GitHub (e.g. `zorexa-fashion`).
2. In your terminal (`c:\Users\HP\OneDrive\Desktop\START-UP`):
   ```bash
   git init
   git add .
   git commit -m "Initial production release of Zorexa Fashion"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/zorexa-fashion.git
   git push -u origin main
   ```

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com) and log in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your `zorexa-fashion` repository.
4. Configure the settings:
   - **Name**: `zorexa-fashion`
   - **Root Directory**: `zorex-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `zorexa_production_super_secret_jwt_key_2026`
   - `MONGO_URI` = *(Optional: paste your MongoDB Atlas connection string if you want cloud MongoDB, otherwise standalone mode runs automatically)*
6. Click **Create Web Service**. Your website will be live in 2 minutes at `https://zorexa-fashion.onrender.com`.

### Step 3: Connect Custom Domain (e.g. GoDaddy / Namecheap / Hostinger)
1. On Render, go to your service → **Settings** → **Custom Domains**.
2. Click **Add Custom Domain** and enter `www.yourdomain.com` (and `yourdomain.com`).
3. Render will give you DNS records to add at your domain registrar:
   - **Type**: `CNAME` | **Name**: `www` | **Value**: `zorexa-fashion.onrender.com`
   - **Type**: `A` | **Name**: `@` | **Value**: *(Render's provided IP address)*
4. Render will automatically issue a **free SSL certificate (HTTPS 🔒)** within 10–15 minutes!

---

## ⚡ Option 2: Vercel (Frontend) + Render/Railway (Backend)

If you prefer deploying the frontend on Vercel's global Edge CDN:

1. **Deploy Backend**:
   - Deploy `zorex-backend` to Render or Railway.
   - You will get a backend URL: `https://zorexa-api.onrender.com`.
2. **Deploy Frontend**:
   - In Vercel, import the repo and select the `zorex-frontend` directory.
   - Add Environment Variable:
     - `VITE_API_URL` = `https://zorexa-api.onrender.com`
   - Deploy!
3. **Connect Custom Domain**:
   - In Vercel, go to **Settings** → **Domains** → add `www.yourdomain.com`.

---

## 🔒 Production Checklist Before Going Live

- [x] **Product Catalog & Images**: 100% bundled and verified.
- [x] **Authentication Engine**: JWT tokens, password hashing, admin auto-provisioning.
- [x] **Checkout & WhatsApp Orders**: Direct WhatsApp order routing to `+91 8791910659`.
- [x] **Lucky Spin & Win Modal**: Active discount coupons.
- [x] **Slide-Over Cart Drawer**: Live quantity controls & MRP savings calculator.
- [x] **Saved Address Manager**: 1-click address fill at checkout.
- [x] **Printable Invoices**: Branded invoices for customer order records.
- [x] **Single-Port Unified Server**: Express serves frontend build from `/dist` automatically.
