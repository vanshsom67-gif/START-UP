const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { signToken, protect } = require("../middleware/auth");

// ─── POST /api/auth/signup ─────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Account with this email already exists" });
    }

    // Pehla user automatically admin banta hai (ya admin@zorexa.com)
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const newUser = await User.create({
      name: name || "Zorexa User",
      email: email.toLowerCase().trim(),
      phone: phone || "",
      password,
      role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Password explicitly select karo (schema mein select: false hai)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ─── GET /api/auth/me — Current logged in user ────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      status: "success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch user info" });
  }
});

// ─── GET /api/auth/users — All users (Admin Only) ─────────────────────
const { adminOnly } = require("../middleware/auth");

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ status: "success", count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch users" });
  }
});

// ─── PATCH /api/auth/users/:id/role — Toggle user role (Admin Only) ───
router.patch("/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin", "delivery"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user', 'admin' or 'delivery'" });
    }

    // Apna role khud change nahi kar sakte
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ message: "Could not update role" });
  }
});

// ─── GET /api/auth/delivery-partners — Get all delivery partners (Admin Only) ───
router.get("/delivery-partners", protect, adminOnly, async (req, res) => {
  try {
    const deliveryPartners = await User.find({ role: "delivery" }).sort({ name: 1 });
    res.json({ status: "success", count: deliveryPartners.length, deliveryPartners });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch delivery partners" });
  }
});

// ─── PATCH /api/auth/users/:id/status — Activate/Deactivate (Admin) ───
router.patch("/users/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ message: "Could not update user status" });
  }
});

module.exports = router;
