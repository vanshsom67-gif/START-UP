const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USERS_FILE = path.join(__dirname, "../users.json");
const PRODUCTS_FILE = path.join(__dirname, "../products.json");
const ORDERS_FILE = path.join(__dirname, "../orders.json");

// Helper to safely read JSON file
const readJSON = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data || "[]");
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return fallback;
};

// Helper to safely write JSON file
const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
};

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ─── Initial Data Setup ────────────────────────────────────────────────
const initializeDataStore = () => {
  // Ensure users.json exists with default admin
  let users = readJSON(USERS_FILE, []);
  const adminExists = users.some(u => u.email === "admin@zorexa.com");
  if (!adminExists) {
    users.unshift({
      _id: "admin_zorexa_001",
      id: "admin_zorexa_001",
      name: "Zorexa Admin",
      email: "admin@zorexa.com",
      phone: "8791910659",
      password: "admin123", // plaintext or bcrypt match supported
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    writeJSON(USERS_FILE, users);
  }

  // Ensure orders.json exists
  if (!fs.existsSync(ORDERS_FILE)) {
    writeJSON(ORDERS_FILE, []);
  }
};

initializeDataStore();

// ─── USER OPERATIONS ──────────────────────────────────────────────────
const findUserByEmail = async (email) => {
  const users = readJSON(USERS_FILE, []);
  return users.find(u => (u.email || "").toLowerCase().trim() === (email || "").toLowerCase().trim()) || null;
};

const findUserById = async (id) => {
  const users = readJSON(USERS_FILE, []);
  return users.find(u => (u._id || u.id) === id || u.email === id) || null;
};

const getAllUsers = async () => {
  const users = readJSON(USERS_FILE, []);
  return users.map(({ password, ...u }) => ({
    _id: u._id || u.id,
    ...u,
  }));
};

const createUser = async ({ name, email, phone, password, role = "user" }) => {
  const users = readJSON(USERS_FILE, []);
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    id: `user_${Date.now()}`,
    name: name || "Zorexa Member",
    email: email.toLowerCase().trim(),
    phone: phone || "",
    password: hashedPassword,
    role: role || (users.length === 0 ? "admin" : "user"),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  
  const { password: _, ...sanitized } = newUser;
  return sanitized;
};

const updateUserRole = async (id, role) => {
  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => (u._id || u.id) === id);
  if (!user) return null;
  user.role = role;
  writeJSON(USERS_FILE, users);
  const { password: _, ...sanitized } = user;
  return sanitized;
};

const updateUserStatus = async (id, isActive) => {
  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => (u._id || u.id) === id);
  if (!user) return null;
  user.isActive = isActive;
  writeJSON(USERS_FILE, users);
  const { password: _, ...sanitized } = user;
  return sanitized;
};

const verifyPassword = async (plainPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    return bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
};

// ─── PRODUCT OPERATIONS ───────────────────────────────────────────────
const getAllProducts = async (filters = {}) => {
  let products = readJSON(PRODUCTS_FILE, []);
  const { category, search, sort } = filters;

  products = products.filter(p => p.isActive !== false);

  if (category && category !== "All") {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => (p.name || "").toLowerCase().includes(s) || (p.category || "").toLowerCase().includes(s));
  }

  if (sort === "price_asc") products.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") products.sort((a, b) => b.price - a.price);
  else if (sort === "rating") products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return products.map(p => ({
    _id: p._id || `prod_${p.id}`,
    ...p,
  }));
};

const getProductById = async (id) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const prod = products.find(p => (p._id || `prod_${p.id}`) === id || String(p.id) === String(id));
  return prod ? { _id: prod._id || `prod_${prod.id}`, ...prod } : null;
};

const createProduct = async (productData) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const newProduct = {
    _id: `prod_${Date.now()}`,
    id: Date.now(),
    name: productData.name.trim(),
    price: Number(productData.price),
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    image: productData.image || "/images/placeholder.jpg",
    images: productData.images || [productData.image || "/images/placeholder.jpg"],
    category: productData.category,
    description: productData.description || "No description provided.",
    stock: productData.stock ? Number(productData.stock) : 100,
    rating: productData.rating ? Number(productData.rating) : 4.5,
    ratingCount: productData.ratingCount ? Number(productData.ratingCount) : 1,
    variants: productData.variants || [],
    reviews: productData.reviews || [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  products.unshift(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  return newProduct;
};

const updateProduct = async (id, updates) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const index = products.findIndex(p => (p._id || `prod_${p.id}`) === id || String(p.id) === String(id));
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  writeJSON(PRODUCTS_FILE, products);
  return products[index];
};

const deleteProduct = async (id) => {
  let products = readJSON(PRODUCTS_FILE, []);
  const exists = products.some(p => (p._id || `prod_${p.id}`) === id || String(p.id) === String(id));
  if (!exists) return false;
  products = products.filter(p => (p._id || `prod_${p.id}`) !== id && String(p.id) !== String(id));
  writeJSON(PRODUCTS_FILE, products);
  return true;
};

const addProductReview = async (productId, reviewData) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const product = products.find(p => (p._id || `prod_${p.id}`) === productId || String(p.id) === String(productId));
  if (!product) return null;
  
  if (!product.reviews) product.reviews = [];
  const review = {
    userId: reviewData.userId,
    userName: reviewData.userName || "Zorexa Customer",
    rating: Number(reviewData.rating),
    comment: reviewData.comment.trim(),
    createdAt: new Date().toISOString(),
  };
  product.reviews.push(review);
  product.ratingCount = product.reviews.length;
  const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
  product.rating = Number((totalRating / product.reviews.length).toFixed(1));
  
  writeJSON(PRODUCTS_FILE, products);
  return product;
};

// ─── ORDER OPERATIONS ─────────────────────────────────────────────────
const createOrder = async (orderData) => {
  const orders = readJSON(ORDERS_FILE, []);
  const newOrder = {
    _id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...orderData,
    status: orderData.status || "Placed",
    isPaid: orderData.isPaid || false,
    trackingLogs: [
      {
        status: "Placed",
        message: "Order placed successfully.",
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  writeJSON(ORDERS_FILE, orders);
  return newOrder;
};

const getUserOrders = async (userId) => {
  const orders = readJSON(ORDERS_FILE, []);
  return orders.filter(o => o.user === userId || o.user?._id === userId || o.user?.id === userId || o.customerEmail === userId);
};

const getAllOrders = async (query = {}) => {
  let orders = readJSON(ORDERS_FILE, []);
  if (query.status) {
    orders = orders.filter(o => o.status === query.status);
  }
  return orders;
};

const getOrderById = async (id) => {
  const orders = readJSON(ORDERS_FILE, []);
  return orders.find(o => o._id === id) || null;
};

const updateOrderStatus = async (id, status, message) => {
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o._id === id);
  if (!order) return null;
  order.status = status;
  if (!order.trackingLogs) order.trackingLogs = [];
  order.trackingLogs.push({
    status,
    message: message || `Order status updated to ${status}.`,
    timestamp: new Date().toISOString(),
  });
  order.updatedAt = new Date().toISOString();
  writeJSON(ORDERS_FILE, orders);
  return order;
};

const assignDelivery = async (id, { deliveryPartner, courierName, trackingId, estimatedDeliveryDate }) => {
  const orders = readJSON(ORDERS_FILE, []);
  const order = orders.find(o => o._id === id);
  if (!order) return null;
  order.deliveryPartner = deliveryPartner || null;
  order.courierName = courierName || "";
  order.trackingId = trackingId || "";
  order.estimatedDeliveryDate = estimatedDeliveryDate || null;
  if (order.status === "Placed") order.status = "Confirmed";
  if (!order.trackingLogs) order.trackingLogs = [];
  order.trackingLogs.push({
    status: order.status,
    message: `Delivery assigned. Courier: ${courierName || "Local Partner"}, Tracking: ${trackingId || "Local-ZX"}.`,
    timestamp: new Date().toISOString(),
  });
  order.updatedAt = new Date().toISOString();
  writeJSON(ORDERS_FILE, orders);
  return order;
};

const getAssignedOrders = async (deliveryPartnerId) => {
  const orders = readJSON(ORDERS_FILE, []);
  return orders.filter(o => o.deliveryPartner === deliveryPartnerId || o.deliveryPartner?._id === deliveryPartnerId);
};

const getOrderStats = async () => {
  const orders = readJSON(ORDERS_FILE, []);
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "Placed").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
  };
};

module.exports = {
  isDBConnected,
  findUserByEmail,
  findUserById,
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  verifyPassword,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignDelivery,
  getAssignedOrders,
  getOrderStats,
};
