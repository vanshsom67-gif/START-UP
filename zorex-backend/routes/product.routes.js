const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const {
  isDBConnected,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} = require("../config/dataStore");

// ─── GET /api/products — Get all active products (Public) ─────────────
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    if (isDBConnected()) {
      let query = { isActive: true };

      // Category filter
      if (category && category !== "All") {
        query.category = category;
      }

      // Search filter
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      // Sort options
      let sortOption = { createdAt: -1 };
      if (sort === "price_asc") sortOption = { price: 1 };
      if (sort === "price_desc") sortOption = { price: -1 };
      if (sort === "rating") sortOption = { rating: -1 };

      const products = await Product.find(query).sort(sortOption);
      return res.json(products);
    }

    // Standalone JSON Mode
    const products = await getAllProducts({ category, search, sort });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Could not fetch products" });
  }
});

// ─── GET /api/products/:id — Single product (Public) ──────────────────
router.get("/:id", async (req, res) => {
  try {
    if (isDBConnected()) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.json(product);
    }

    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch product" });
  }
});

// ─── POST /api/products — Add product (Admin Only) ────────────────────
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, price, originalPrice, image, images, category, description, stock, rating, ratingCount, variants } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    if (isDBConnected()) {
      const product = await Product.create({
        name: name.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        image: image || "/images/placeholder.jpg",
        images: images || [image || "/images/placeholder.jpg"],
        category,
        description: description || "No description provided.",
        stock: stock ? Number(stock) : 100,
        rating: rating ? Number(rating) : 4.5,
        ratingCount: ratingCount ? Number(ratingCount) : 1,
        variants: variants || [],
      });

      return res.status(201).json({ status: "success", product });
    }

    const product = await createProduct({
      name,
      price,
      originalPrice,
      image,
      images,
      category,
      description,
      stock,
      rating,
      ratingCount,
      variants,
    });

    res.status(201).json({ status: "success", product });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "Could not add product" });
  }
});

// ─── PUT /api/products/:id — Edit product (Admin Only) ────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const allowed = ["name", "price", "originalPrice", "image", "images", "category", "description", "stock", "rating", "ratingCount", "isActive", "variants"];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (isDBConnected()) {
      const product = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.json({ status: "success", product });
    }

    const product = await updateProduct(req.params.id, updates);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ status: "success", product });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Could not update product" });
  }
});

// ─── DELETE /api/products/:id — Delete product (Admin Only) ───────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (isDBConnected()) {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.json({ status: "success", message: "Product deleted successfully" });
    }

    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete product" });
  }
});

// ─── POST /api/products/:id/reviews — Submit review (Protected) ───────────
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating between 1 and 5 is required" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Zorexa Customer";

    if (isDBConnected()) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.userId && r.userId.toString() === userId.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }

      const review = {
        userId,
        userName,
        rating: Number(rating),
        comment: comment.trim(),
      };

      product.reviews.push(review);
      product.ratingCount = product.reviews.length;
      
      const totalRatingSum = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.rating = Number((totalRatingSum / product.reviews.length).toFixed(1));

      await product.save();
      return res.status(201).json({ status: "success", message: "Review added successfully", product });
    }

    const product = await addProductReview(req.params.id, {
      userId,
      userName,
      rating,
      comment,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(201).json({ status: "success", message: "Review added successfully", product });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Could not add review" });
  }
});

module.exports = router;
