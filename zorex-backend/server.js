const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./models/User");

// ─── Auto-ensure Admin User on Startup ────────────────────────────────
const ensureAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@zorexa.com" });
    if (!adminExists) {
      await User.create({
        name: "Zorexa Admin",
        email: "admin@zorexa.com",
        phone: "8791910659",
        password: "admin123",
        role: "admin",
      });
      console.log("👑 Default Admin user auto-created: admin@zorexa.com / admin123");
    }
  } catch (err) {
    console.error("Auto Admin check error:", err.message);
  }
};

// ─── Middleware ────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files (product images)
app.use(express.static(path.join(__dirname, "public")));

// ─── API Routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ─── Health Check ──────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Zorexa Fashion API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ─── Static Frontend Files (dist) ──────────────────────────────────────
const distPath = path.join(__dirname, "../zorex-frontend/dist");
app.use(express.static(distPath));

// ─── SPA Fallback / 404 Handler ────────────────────────────────────────
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  const indexPath = path.join(distPath, "index.html");
  if (require("fs").existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ status: "fail", message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// ─── Start Server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Zorexa Backend running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);

  // Connect MongoDB in background
  connectDB()
    .then(() => ensureAdminUser())
    .catch((err) => {
      console.error("MongoDB background connect error:", err.message);
    });
});
