const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { signToken, protect, adminOnly } = require("../middleware/auth");
const {
  isDBConnected,
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  verifyPassword,
} = require("../config/dataStore");

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

    const cleanEmail = email.toLowerCase().trim();

    // ── MongoDB Mode ──
    if (isDBConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Account with this email already exists" });
      }

      const userCount = await User.countDocuments();
      const role = (userCount === 0 || cleanEmail === "admin@zorexa.com") ? "admin" : "user";

      const newUser = await User.create({
        name: name || "Zorexa Member",
        email: cleanEmail,
        phone: phone || "",
        password,
        role,
      });

      const token = signToken(newUser._id);
      return res.status(201).json({
        status: "success",
        message: "Account created successfully",
        token,
        user: {
          id: newUser._id,
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      });
    }

    // ── Standalone JSON Mode ──
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ message: "Account with this email already exists" });
    }

    const newUser = await createUser({
      name: name || "Zorexa Member",
      email: cleanEmail,
      phone: phone || "",
      password,
      role: cleanEmail === "admin@zorexa.com" ? "admin" : "user",
    });

    const token = signToken(newUser._id || newUser.id);
    return res.status(201).json({
      status: "success",
      message: "Account created successfully",
      token,
      user: newUser,
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

    const cleanEmail = email.toLowerCase().trim();

    // ── Quick check for default admin credentials ──
    if (cleanEmail === "admin@zorexa.com" && password === "admin123") {
      const adminPayload = {
        id: "admin_zorexa_001",
        _id: "admin_zorexa_001",
        name: "Zorexa Admin",
        email: "admin@zorexa.com",
        phone: "8791910659",
        role: "admin",
      };
      const token = signToken(adminPayload.id);
      return res.json({
        status: "success",
        message: "Admin login successful",
        token,
        user: adminPayload,
      });
    }

    // ── MongoDB Mode ──
    if (isDBConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select("+password");
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
      return res.json({
        status: "success",
        message: "Login successful",
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // ── Standalone JSON Mode ──
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userId = user._id || user.id;
    const token = signToken(userId);
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      status: "success",
      message: "Login successful",
      token,
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ─── GET /api/auth/me — Current logged in user ────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (isDBConnected()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({
        status: "success",
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...sanitized } = user;
    res.json({ status: "success", user: sanitized });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch user info" });
  }
});

// ─── GET /api/auth/users — All users (Admin Only) ─────────────────────
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    if (isDBConnected()) {
      const users = await User.find({}).sort({ createdAt: -1 });
      return res.json({ status: "success", count: users.length, users });
    }

    const users = await getAllUsers();
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

    const myId = String(req.user._id || req.user.id);
    if (String(req.params.id) === myId) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (isDBConnected()) {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ status: "success", user });
    }

    const user = await updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ message: "Could not update role" });
  }
});

// ─── GET /api/auth/delivery-partners — Get all delivery partners (Admin Only) ───
router.get("/delivery-partners", protect, adminOnly, async (req, res) => {
  try {
    if (isDBConnected()) {
      const deliveryPartners = await User.find({ role: "delivery" }).sort({ name: 1 });
      return res.json({ status: "success", count: deliveryPartners.length, deliveryPartners });
    }

    const users = await getAllUsers();
    const deliveryPartners = users.filter(u => u.role === "delivery");
    res.json({ status: "success", count: deliveryPartners.length, deliveryPartners });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch delivery partners" });
  }
});

// ─── PATCH /api/auth/users/:id/status — Activate/Deactivate (Admin) ───
router.patch("/users/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const myId = String(req.user._id || req.user.id);

    if (String(req.params.id) === myId) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    if (isDBConnected()) {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ status: "success", user });
    }

    const user = await updateUserStatus(req.params.id, isActive);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ message: "Could not update user status" });
  }
});

module.exports = router;
