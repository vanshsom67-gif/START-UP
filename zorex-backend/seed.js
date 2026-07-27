/**
 * SEED SCRIPT — Run once to populate MongoDB with:
 * 1. Admin user: admin@zorexa.com / admin123
 * 2. All products from products.json
 *
 * Usage: node seed.js
 */

require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");

const productsData = [
  {
    name: "Short Kurti For Women",
    price: 499,
    image: "/images/kurti.jpg",
    images: ["/images/kurti.jpg", "/images/kurti.jpg", "/images/kurti.jpg"],
    category: "Women's Clothing",
    description: "Beautiful and comfortable short kurti in traditional vibrant patterns. Soft cotton fabric, ideal for daily casual wear.",
    stock: 50,
    rating: 4.3,
    ratingCount: 3,
    reviews: [
      { userName: "Ritu Sharma", rating: 5, comment: "Amazing fit! The fabric is super soft cotton, perfect for summer." },
      { userName: "Neha Verma", rating: 4, comment: "Colors are very vibrant and look just like the picture. Highly recommend!" },
      { userName: "Aman Gupta", rating: 4, comment: "Bought it for my sister. She loved the traditional print. Good purchase." }
    ]
  },
  {
    name: "Hoodie",
    price: 999,
    image: "/images/hoodie.jpg",
    images: ["/images/hoodie.jpg", "/images/hoodie.jpg"],
    category: "Men's Clothing",
    description: "Premium cotton-fleece blend hoodie. Cozy interior brush-fleece, durable stitching, perfect for streetwear aesthetics.",
    stock: 30,
    rating: 4.5,
    ratingCount: 2,
    reviews: [
      { userName: "Kabir Singh", rating: 5, comment: "Absolutely premium quality hoodie. Best purchase under 1000!" },
      { userName: "Rohit Sen", rating: 4, comment: "Very comfortable and thick. Perfect for winters." }
    ]
  },
  {
    name: "Bell Bottom For Men",
    price: 799,
    image: "/images/bellbottom.jpeg",
    images: ["/images/bellbottom.jpeg", "/images/bellbottom.jpeg"],
    category: "Men's Clothing",
    description: "Retro bellbottom denim pants. Classic flared fit with robust cotton weave, matching the 70s look in a modern cut.",
    stock: 25,
    rating: 4.0,
    ratingCount: 2,
    reviews: [
      { userName: "Vicky Kaushal", rating: 4, comment: "Great retro vibes. The flare is just perfect." },
      { userName: "Aditya Roy", rating: 4, comment: "Good quality denim. Feels sturdy and comfortable." }
    ]
  },
  {
    name: "Formal Shirt For Men",
    price: 799,
    image: "/images/shirt for men.jpg",
    images: ["/images/shirt for men.jpg", "/images/shirt for men.jpg"],
    category: "Men's Clothing",
    description: "Polished formal shirt. High quality breathable cotton fabric tailored for office meetings and formal celebrations.",
    stock: 40,
    rating: 4.5,
    ratingCount: 2,
    reviews: [
      { userName: "Sameer Mehta", rating: 5, comment: "Premium fit and look. Best formal shirt at this price range." },
      { userName: "Deepak Joshi", rating: 4, comment: "Very neat stitching and breathable cotton fabric." }
    ]
  },
  {
    name: "Long Kurti For Women",
    price: 699,
    image: "/images/long kurti.jpg",
    images: ["/images/long kurti.jpg", "/images/long kurti.jpg", "/images/long kurti.jpg"],
    category: "Women's Clothing",
    description: "Full length elegant traditional kurti. Delicate embroidery patterns, suitable for weddings and festive family gatherings.",
    stock: 35,
    rating: 4.7,
    ratingCount: 3,
    reviews: [
      { userName: "Pooja Patel", rating: 5, comment: "The embroidery is absolutely stunning! Looks very royal." },
      { userName: "Kriti Sanon", rating: 5, comment: "Beautiful design, fabric feels very luxurious. Fitting is perfect." },
      { userName: "Shraddha Kapoor", rating: 4, comment: "Great for festive occasions. Color is exactly as shown." }
    ]
  },
];

const seed = async () => {
  await connectDB();
  console.log("🌱 Starting seed...");

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  console.log("🗑️  Old data cleared");

  // Create Admin User
  const admin = await User.create({
    name: "Zorexa Admin",
    email: "admin@zorexa.com",
    phone: "8791910659",
    password: "admin123",
    role: "admin",
  });
  console.log(`... Admin created: ${admin.email} / password: admin123`);

  // Assign admin ID to all seed reviews
  const updatedProductsData = productsData.map(product => {
    if (product.reviews) {
      product.reviews = product.reviews.map(r => ({
        ...r,
        userId: admin._id
      }));
    }
    return product;
  });

  // Seed Products
  const products = await Product.insertMany(updatedProductsData);
  console.log(`... ${products.length} products inserted`);

  console.log("\n🎉 Seed complete! You can now run: node server.js");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
