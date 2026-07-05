const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

// Enable CORS for development/local file access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve all static files (HTML, images, etc.) from root directory
app.use(express.static(__dirname));

// ===== JSON FILE-BASED STORAGE =====
const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading data:", e);
  }
  return { users: [], orders: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize data file if not exists
if (!fs.existsSync(DATA_FILE)) {
  saveData({ users: [], orders: [] });
  console.log("✅ data.json created");
}

// Memory storage for active verification OTPs
let activeOtps = {};

// Helper: Send email via Brevo API
const https = require("https");

function sendOtpViaBrevo(email, otp) {
  const apiKey = process.env.BREVO_API_KEY || "YOUR_BREVO_API_KEY";
  if (apiKey === "YOUR_BREVO_API_KEY" || !apiKey) {
    console.log(`[Brevo Mock] API Key is not set. OTP for ${email} is: ${otp}`);
    return Promise.resolve(true); // Treat as sent in mock environment
  }

  const payload = JSON.stringify({
    sender: { name: "Zorexa Fashion", email: "otp@zorexa.com" },
    to: [{ email: email }],
    subject: "Zorexa Fashion - Signup Verification OTP",
    htmlContent: `
      <div style="font-family: 'Inter', sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 500px; margin: 0 auto; background: #faf5ff;">
        <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px; font-style: italic;">Zorexa Fashion</h2>
        <p style="font-size: 15px; color: #333;">Namaste,</p>
        <p style="font-size: 15px; color: #333;">Zorexa Fashion par account create karne ke liye aapka verification OTP code niche diya gaya hai:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 28px; font-weight: 800; color: #ec4899; letter-spacing: 4px; background: white; padding: 10px 25px; border-radius: 8px; border: 1px solid #f0f0f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #666; text-align: center;">Yeh OTP agle 10 minutes tak valid hai. Kripya ise kisi ke sath share na karein.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #878787; text-align: center;">Agar aapne yeh request nahi ki hai, toh kripya is email ko ignore karein.</p>
      </div>
    `
  });

  const options = {
    hostname: "api.brevo.com",
    port: 443,
    path: "/v3/smtp/email",
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": payload.length
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Brevo] OTP email sent successfully to ${email}`);
          resolve(true);
        } else {
          console.error(`[Brevo Error] HTTP ${res.statusCode}:`, body);
          resolve(false);
        }
      });
    });

    req.on("error", (e) => {
      console.error("[Brevo SMTP Error]:", e);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

// ===== SEND OTP API =====
app.post("/api/send-otp", async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return res.json({ status: "fail", message: "Email and Phone fields are required" });
  }

  let data = loadData();
  let existing = data.users.find(u => u.email === email || u.phone === phone);
  if (existing) {
    return res.json({ status: "fail", message: "Yeh email ya phone pehle se registered hai" });
  }

  // Generate 4 digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[email] = otp;

  console.log(`🔑 [OTP] Generated for ${email} is ${otp}`);

  const sent = await sendOtpViaBrevo(email, otp);
  if (sent) {
    res.json({ status: "success", message: "Verification OTP code sent to your email!" });
  } else {
    res.json({ status: "fail", message: "OTP email send karne me error aaya. Mock OTP console par logged hai." });
  }
});

// ===== SIGNUP API (WITH OTP) =====
app.post("/api/signup", (req, res) => {
  const { email, phone, password, otp } = req.body;

  if (!email || !phone || !password || !otp) {
    return res.json({ status: "fail", message: "Sabhi fields fill karein including OTP" });
  }

  // Validate OTP
  if (activeOtps[email] !== otp) {
    return res.json({ status: "fail", message: "Galat OTP enter kiya hai" });
  }

  let data = loadData();

  // Double check existence
  let existing = data.users.find(u => u.email === email || u.phone === phone);
  if (existing) {
    return res.json({ status: "fail", message: "Yeh email ya phone pehle se registered hai" });
  }

  data.users.push({ email, phone, password, createdAt: new Date().toISOString() });
  saveData(data);

  // Clear OTP from memory
  delete activeOtps[email];

  console.log("👤 New user registered:", email);
  res.json({ status: "success", message: "Account Created Successfully" });
});

// ===== LOGIN API =====
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Admin check
  if (username === "admin" && password === "admin") {
    console.log("🔑 Admin login successful");
    return res.json({ status: "success", user: { email: "admin", phone: "8791910659" } });
  }

  let data = loadData();
  let user = data.users.find(u =>
    (u.email === username || u.phone === username) && u.password === password
  );

  if (user) {
    console.log("🔑 User login successful:", user.email);
    res.json({ status: "success", user: { email: user.email, phone: user.phone } });
  } else {
    res.json({ status: "fail", message: "Galat login credentials" });
  }
});

// ===== SAVE ORDER API =====
app.post("/api/orders", (req, res) => {
  const { userEmail, order } = req.body;

  if (!order) {
    return res.json({ status: "fail", message: "Order data missing" });
  }

  let data = loadData();
  data.orders.push({ ...order, userEmail: userEmail || "guest", savedAt: new Date().toISOString() });
  saveData(data);

  console.log("📦 Order saved:", order.id, "by", userEmail);
  res.json({ status: "success", message: "Order saved to server" });
});

// ===== GET ORDERS API =====
app.get("/api/orders/:email", (req, res) => {
  let data = loadData();
  let userOrders = data.orders
    .filter(o => o.userEmail === req.params.email)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)); // Latest first

  console.log("📋 Orders fetched for:", req.params.email, "| Count:", userOrders.length);
  res.json({ status: "success", orders: userOrders });
});

// ===== GET ALL USERS (Admin Only) =====
app.get("/api/admin/users", (req, res) => {
  let data = loadData();
  let safeUsers = data.users.map(u => ({ email: u.email, phone: u.phone, createdAt: u.createdAt }));
  res.json({ status: "success", users: safeUsers, count: safeUsers.length });
});

// ===== GET ALL ORDERS (Admin Only) =====
app.get("/api/admin/orders", (req, res) => {
  let data = loadData();
  res.json({ status: "success", orders: data.orders, count: data.orders.length });
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 ZOREXA FASHION Server is LIVE!");
  console.log(`🌐 Open: http://localhost:${PORT}/ZOREXA%20FASHION.html`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});