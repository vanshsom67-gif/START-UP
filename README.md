<div align="center">

# 🛍️ ZOREXA Fashion

**A modern full-stack e-commerce platform for fashion.**

![ZOREXA Banner](./zorex-backend/public/images/zorexa_coming.png)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)

</div>

---

## 📌 About

ZOREXA is a full-stack fashion e-commerce web application featuring a React frontend and a Node.js/Express backend. Users can browse products, manage their cart, register/login, and place orders.

---

## 🗂️ Project Structure

```
ZOREXA/
├── zorex-backend/          # Node.js + Express REST API
│   ├── public/
│   │   └── images/         # Product & brand images
│   ├── server.js           # Main server entry point
│   ├── products.json       # Products data
│   ├── orders.json         # Orders data
│   ├── users.json          # Users data
│   └── package.json
│
└── zorex-frontend/         # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx     # Login / Register
    │   │   ├── Cart.jsx     # Shopping cart
    │   │   ├── Hero.jsx     # Landing hero section
    │   │   ├── Navbar.jsx   # Navigation bar
    │   │   └── ProductCard.jsx
    │   ├── App.jsx          # Root component
    │   ├── index.css        # Global styles
    │   └── main.jsx         # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- npm v9+

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vanshsom67-gif/ZOREXA.git
cd ZOREXA
```

### 2️⃣ Start the Backend

```bash
cd zorex-backend
npm install
node server.js
```

> Backend will run on **http://localhost:5000**

### 3️⃣ Start the Frontend

```bash
cd zorex-frontend
npm install
npm run dev
```

> Frontend will run on **http://localhost:5173**

---

## 🛠️ Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18 + Vite 5   |
| Styling   | Custom CSS          |
| Backend   | Node.js + Express   |
| Database  | JSON files (v1)     |

---

## ✨ Features

- 🛍️ Product listing with filters
- 🛒 Shopping cart (add/remove/update)
- 🔐 User authentication (register/login)
- 📦 Order placement
- 📱 Responsive design

---

## 🗺️ Roadmap

- [x] Phase 1 — Project Cleanup & Professional Structure
- [ ] Phase 2 — UI/UX Polish & Component Improvements
- [ ] Phase 3 — Backend API Enhancement
- [ ] Phase 4 — Database Integration (MongoDB)
- [ ] Phase 5 — Deployment (Frontend: Vercel, Backend: Render)

---

## 👥 Team

| Name | Role |
|------|------|
| Vansh | CEO & Lead Developer |
| Utsav | Co-founder |

---

## 📄 License

This project is for educational and startup purposes.

---

<div align="center">
Made with ❤️ by the ZOREXA Team
</div>
