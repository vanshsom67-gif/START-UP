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
  {
    name: "Zorexa 100% Gold Whey Isolate Protein (2kg / 4.4 lbs)",
    price: 4499,
    originalPrice: 6999,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Gym & Supplements",
    description: "Ultra-pure Whey Protein Isolate providing 25g fast-absorbing protein, 5.5g BCAAs per scoop. Zero added sugar, fast digestion for maximum muscle recovery & lean muscle gain.",
    stock: 50,
    rating: 4.8,
    ratingCount: 14,
    reviews: [
      { userName: "Varun Sharma", rating: 5, comment: "Best protein powder! Rich Chocolate flavor mixes ultra smooth without lumps." },
      { userName: "Sahil Khan", rating: 5, comment: "Great muscle recovery after heavy leg workouts. Authentic lab-tested quality." }
    ]
  },
  {
    name: "Explosive Pre-Workout Energy Matrix (300g)",
    price: 1299,
    originalPrice: 2199,
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Gym & Supplements",
    description: "High performance pre-workout formula with 200mg Caffeine, 3g Beta-Alanine, and L-Citrulline for extreme muscle pump, endurance and intense gym workouts.",
    stock: 45,
    rating: 4.6,
    ratingCount: 9,
    reviews: [
      { userName: "Arjun Rampal", rating: 5, comment: "Insane pump and energy! Keeps me going throughout 2 hours of heavy lifting." }
    ]
  },
  {
    name: "Micronized Creatine Monohydrate (250g Unflavored)",
    price: 699,
    originalPrice: 1199,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Gym & Supplements",
    description: "100% Pure Unadulterated Micronized Creatine Monohydrate (3g Creapure per serving). Boosts muscle strength, power output, and intracellular hydration.",
    stock: 60,
    rating: 4.9,
    ratingCount: 22,
    reviews: [
      { userName: "Vikram Malhotra", rating: 5, comment: "Noticed strength gains in bench press within 10 days of taking 3g daily." }
    ]
  },
  {
    name: "Night Recovery Micellar Casein Protein (1kg)",
    price: 2799,
    originalPrice: 3999,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Gym & Supplements",
    description: "Slow-digesting 24g slow-release casein protein per serving. Sustains muscle recovery overnight for 8 continuous hours during sleep to prevent muscle breakdown.",
    stock: 30,
    rating: 4.7,
    ratingCount: 8,
    reviews: [
      { userName: "Karan Mehta", rating: 5, comment: "Tastes great with cold milk before bed. No morning muscle soreness!" }
    ]
  }
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
