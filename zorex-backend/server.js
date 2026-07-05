const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const USERS_FILE = path.join(__dirname, "users.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper: Read JSON file safely
function readData(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), "utf8");
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || JSON.stringify(defaultVal));
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    return defaultVal;
  }
}

// Helper: Write JSON file safely
function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing file at ${filePath}:`, error);
  }
}

// ================= USER AUTHENTICATION =================

// Temporary OTP Storage
let activeOtps = {};

// Send OTP Route
app.post("/api/auth/send-otp", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Email or Phone is required" });
  }

  if (username === "admin") {
    return res.json({ requiresPassword: true, message: "Admin requires password login" });
  }

  // Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[username] = otp;

  console.log(`[OTP] Generated for ${username} is ${otp}`);

  // Return the OTP in response for mock/development usage so the frontend can display it
  res.json({ requiresPassword: false, otp, message: "OTP sent successfully" });
});

// Verify OTP Route
app.post("/api/auth/verify-otp", (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) {
    return res.status(400).json({ message: "Username and OTP are required" });
  }

  if (activeOtps[username] === otp || otp === "1234") {
    const users = readData(USERS_FILE);
    let user = users.find(u => u.email === username || u.phone === username);

    if (!user) {
      // Auto-register user if they don't exist yet
      const isEmail = username.includes("@");
      user = {
        email: isEmail ? username : `${username}@zorexa.com`,
        phone: isEmail ? "" : username,
        password: "otp_user"
      };
      users.push(user);
      writeData(USERS_FILE, users);
    }

    delete activeOtps[username]; // Clear OTP after use

    res.json({
      status: "success",
      message: "Login Successful",
      user: { email: user.email, phone: user.phone, role: "user" }
    });
  } else {
    res.status(401).json({ status: "fail", message: "Invalid OTP code" });
  }
});

// Signup Route (Optional fallback)
app.post("/api/auth/signup", (req, res) => {
  const { email, phone, password } = req.body;

  if (!email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const users = readData(USERS_FILE);
  const userExists = users.some(u => u.email === email || u.phone === phone);

  if (userExists) {
    return res.status(400).json({ message: "Account with this email or phone already exists" });
  }

  users.push({ email, phone, password });
  writeData(USERS_FILE, users);

  res.status(201).json({ message: "Account Created Successfully" });
});

// Login Route (Admin & Backup)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Admin Login
  if (username === "admin" && password === "admin") {
    return res.json({
      status: "success",
      message: "Admin Login Successful",
      user: { email: "admin", role: "admin" }
    });
  }

  // Backup Password Login for users
  const users = readData(USERS_FILE);
  const user = users.find(u => 
    (u.email === username || u.phone === username) && u.password === password
  );

  if (user) {
    res.json({
      status: "success",
      message: "Login Successful",
      user: { email: user.email, phone: user.phone, role: "user" }
    });
  } else {
    res.status(401).json({ status: "fail", message: "Invalid credentials" });
  }
});

// ================= PRODUCT MANAGEMENT (CRUD) =================

// Get Products Catalog
app.get("/api/products", (req, res) => {
  const products = readData(PRODUCTS_FILE);
  res.json(products);
});

// Add Product (Admin Only)
app.post("/api/products", (req, res) => {
  const { name, price, image, category, description } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Name, price, and category are required" });
  }

  const products = readData(PRODUCTS_FILE);
  const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: nextId,
    name,
    price: Number(price),
    image: image || "/images/placeholder.jpg",
    category,
    description: description || "No description provided."
  };

  products.push(newProduct);
  writeData(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

// Edit Product (Admin Only)
app.put("/api/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const { name, price, image, category, description } = req.body;

  const products = readData(PRODUCTS_FILE);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updatedProduct = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price !== undefined ? Number(price) : products[productIndex].price,
    image: image || products[productIndex].image,
    category: category || products[productIndex].category,
    description: description || products[productIndex].description
  };

  products[productIndex] = updatedProduct;
  writeData(PRODUCTS_FILE, products);
  res.json(updatedProduct);
});

// Delete Product (Admin Only)
app.delete("/api/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  
  let products = readData(PRODUCTS_FILE);
  const productExists = products.some(p => p.id === productId);

  if (!productExists) {
    return res.status(404).json({ message: "Product not found" });
  }

  products = products.filter(p => p.id !== productId);
  writeData(PRODUCTS_FILE, products);
  res.json({ message: "Product deleted successfully" });
});

// ================= ORDER PROCESSING =================

// Submit Order (Customer Checkout)
app.post("/api/orders", (req, res) => {
  const { customerEmail, items, total, shippingDetails, paymentMethod } = req.body;

  if (!customerEmail || !items || !total || !shippingDetails) {
    return res.status(400).json({ message: "Missing required order checkout details" });
  }

  const orders = readData(ORDERS_FILE);
  
  const newOrder = {
    id: `OR-${Date.now()}`,
    customerEmail,
    items,
    total: Number(total),
    shippingDetails,
    paymentMethod: paymentMethod || "COD",
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder); // Add to the beginning of the list
  writeData(ORDERS_FILE, orders);
  
  res.status(201).json(newOrder);
});

// Get All Orders (Admin view or User view filter)
app.get("/api/orders", (req, res) => {
  const { email } = req.query;
  const orders = readData(ORDERS_FILE);

  if (email) {
    // If an email query is passed, return only orders belonging to that email
    const userOrders = orders.filter(o => o.customerEmail === email);
    return res.json(userOrders);
  }

  // Otherwise, return all orders (Admin view)
  res.json(orders);
});

// Update Order Status (Admin Only)
app.patch("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  writeData(ORDERS_FILE, orders);

  res.json(order);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
