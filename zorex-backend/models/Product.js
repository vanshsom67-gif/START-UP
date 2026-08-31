const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: [true, "Size is required for variant"],
  },
  color: {
    type: String,
    default: "",
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
});

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      default: null, // null toh auto-calculate hoga frontend pe
    },
    image: {
      type: String,
      default: "/images/placeholder.jpg",
    },
    images: {
      type: [String],
      default: [], // Multiple product images
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Men's Clothing", "Women's Clothing", "Accessories", "Footwear", "Gym & Supplements"],
    },
    description: {
      type: String,
      default: "No description provided.",
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 120,
    },
    variants: [VariantSchema],
    reviews: [ReviewSchema], // Reviews list
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
