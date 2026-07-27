const mongoose = require("mongoose");
const dns = require("dns");

// Fix for ISPs that block SRV DNS queries — use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 6+ mein ye options default hain, explicitly likhna zaroori nahi
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // App band karo agar DB nahi mili
  }
};

module.exports = connectDB;
