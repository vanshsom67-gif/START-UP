const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Middleware: Verify JWT Token ─────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Token Authorization header se lo: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Access denied. Please login first.",
      });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User DB mein exist karta hai kya?
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "User no longer exists.",
      });
    }

    if (!currentUser.isActive) {
      return res.status(403).json({
        status: "fail",
        message: "Your account has been deactivated.",
      });
    }

    // req.user mein user daalo taaki agle middleware use kar sake
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ status: "fail", message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: "fail", message: "Token expired. Please login again." });
    }
    return res.status(500).json({ status: "error", message: "Authentication error." });
  }
};

// ─── Middleware: Admin Only ────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// ─── Middleware: Delivery Partner Only ──────────────────────────────────
const deliveryOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "delivery") {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Delivery partner privileges required.",
    });
  }
  next();
};

// ─── Helper: Sign JWT Token ───────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { protect, adminOnly, deliveryOnly, signToken };
