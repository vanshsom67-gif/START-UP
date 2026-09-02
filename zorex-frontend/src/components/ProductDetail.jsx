import React, { useState } from "react";
import {
  ArrowLeft, Heart, ShoppingCart, Zap, Star,
  Truck, Shield, RotateCcw, Share2, ChevronRight, MapPin
} from "lucide-react";
import { API_BASE, authFetch, getImageUrl } from "../config/api";

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  relatedProducts = [],
  onRelatedClick,
}) {
  const [localProduct, setLocalProduct] = useState(product);

  React.useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  const hasVariants = localProduct.variants && localProduct.variants.length > 0;
  const uniqueSizes = hasVariants
    ? [...new Set(localProduct.variants.map((v) => v.size))]
    : ["XS", "S", "M", "L", "XL", "XXL"]; // Fallback static sizes
  const uniqueColors = hasVariants
    ? [...new Set(localProduct.variants.map((v) => v.color).filter(Boolean))]
    : [];

  const [selectedSize, setSelectedSize] = useState(() => {
    if (hasVariants && uniqueSizes.length > 0) return uniqueSizes[0];
    return "M";
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    if (hasVariants && uniqueColors.length > 0) return uniqueColors[0];
    return "";
  });

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);

  // Gallery images list
  const productImages = localProduct.images && localProduct.images.length > 0
    ? localProduct.images
    : [localProduct.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Pincode state
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const activeImageUrl = getImageUrl(productImages[activeImageIndex], localProduct.category);

  // Find matching variant to check stock
  const matchingVariant = hasVariants
    ? localProduct.variants.find(
        (v) =>
          v.size === selectedSize &&
          (v.color || "").toLowerCase() === selectedColor.toLowerCase()
      )
    : null;

  const currentStock = hasVariants
    ? (matchingVariant ? matchingVariant.stock : 0)
    : (localProduct.stock || 0);

  const originalPrice = localProduct.originalPrice || Math.round(localProduct.price * 1.8);
  const discount = Math.round(((originalPrice - localProduct.price) / originalPrice) * 100);
  const rating = localProduct.rating || 4.2;
  const ratingCount = localProduct.ratingCount || 120;
  const isClothing = ["Men's Clothing", "Women's Clothing"].includes(localProduct.category);

  // Reset quantity when variant changes
  React.useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  const handleAddToCart = () => {
    onAddToCart({
      ...localProduct,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    onBuyNow({
      ...localProduct,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity,
    });
  };

  const handleShare = () => {
    const text = `Check out ${localProduct.name} on Zorexa Fashion! Only ₹${localProduct.price.toLocaleString()} 🔥`;
    if (navigator.share) {
      navigator.share({ title: localProduct.name, text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handleCheckPincode = () => {
    if (pincode.length !== 6) {
      setPincodeResult({ isDeliverable: false, message: "Please enter a valid 6-digit pincode." });
      return;
    }
    const startsWith = pincode.charAt(0);
    if (startsWith === "9") {
      setPincodeResult({
        isDeliverable: false,
        message: "Sorry, we do not deliver to this location currently."
      });
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const deliveryDays = ["1", "2", "4", "7"].includes(startsWith) ? 2 : 5;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
      const formattedDate = `${days[deliveryDate.getDay()]}, ${deliveryDate.getDate()} ${months[deliveryDate.getMonth()]}`;
      setPincodeResult({
        isDeliverable: true,
        message: "Delivery is available at this pincode!",
        deliveryDate: formattedDate
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError("Please write a review comment.");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    const currentUser = JSON.parse(localStorage.getItem("zorex_user") || "{}");
    const optimisticReview = {
      userName: currentUser?.name || "Verified Customer",
      rating: Number(reviewRating),
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await authFetch(`${API_BASE}/api/products/${localProduct._id || localProduct.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }
      setReviewSuccess("✓ Review submitted successfully! Thank you for your feedback.");
      setReviewComment("");

      if (data.product) {
        setLocalProduct(data.product);
      } else {
        const updatedReviews = [optimisticReview, ...(localProduct.reviews || [])];
        const newAvg = (updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length);
        setLocalProduct((prev) => ({
          ...prev,
          reviews: updatedReviews,
          rating: Math.round(newAvg * 10) / 10,
          ratingCount: (prev.ratingCount || 0) + 1,
        }));
      }
    } catch (err) {
      console.error(err);
      setReviewError(err.message || "Something went wrong. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Generate star rating display
  const renderStars = (r) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(r) ? "#f59e0b" : "#e2e8f0", fontSize: "16px" }}>★</span>
    ));
  };

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <button className="pd-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <div className="pd-breadcrumb-trail">
          <span onClick={onBack} style={{ cursor: "pointer", color: "#6366f1" }}>Home</span>
          <ChevronRight size={14} />
          <span style={{ cursor: "pointer", color: "#6366f1" }}>{localProduct.category}</span>
          <ChevronRight size={14} />
          <span style={{ color: "#64748b" }}>{localProduct.name}</span>
        </div>
      </div>

      <div className="pd-container">
        {/* LEFT: Product Image Gallery */}
        <div className="pd-image-section">
          <div className="pd-gallery-container" style={{ display: "flex", gap: "12px", width: "100%", flexDirection: window.innerWidth < 768 ? "column-reverse" : "row" }}>
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="pd-thumbnails-strip" style={{ display: "flex", flexDirection: window.innerWidth < 768 ? "row" : "column", gap: "8px", flexShrink: 0, justifyContent: "center" }}>
                {productImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`pd-thumbnail-wrapper ${activeImageIndex === idx ? "active" : ""}`}
                    style={{
                      width: "60px",
                      height: "75px",
                      border: activeImageIndex === idx ? "2px solid #6366f1" : "1px solid #e2e8f0",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: "2px",
                      background: "white",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img
                      src={getImageUrl(img, localProduct.category)}
                      alt={`${localProduct.name} view ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = localProduct.category?.includes("Gym") || localProduct.category?.includes("Supplement")
                          ? "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80"
                          : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="pd-image-wrapper" style={{ flexGrow: 1, position: "relative" }}>
              {discount > 0 && (
                <div className="pd-discount-badge">{discount}% OFF</div>
              )}
              <button
                className={`pd-wishlist-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => onToggleWishlist(localProduct._id || localProduct.id)}
              >
                <Heart size={20} fill={isWishlisted ? "#ec4899" : "none"} />
              </button>
              <img
                src={activeImageUrl}
                alt={localProduct.name}
                className="pd-main-image"
                style={{ objectFit: "contain", maxHeight: "450px" }}
                onError={(e) => {
                  e.target.src = localProduct.category?.includes("Gym") || localProduct.category?.includes("Supplement")
                    ? "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80"
                    : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          </div>

          {/* Trust badges */}
          <div className="pd-trust-badges">
            <div className="pd-trust-item">
              <Truck size={16} />
              <span>Free Delivery</span>
            </div>
            <div className="pd-trust-item">
              <Shield size={16} />
              <span>Genuine Product</span>
            </div>
            <div className="pd-trust-item">
              <RotateCcw size={16} />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="pd-info-section">
          {/* Category tag */}
          <div className="pd-category-tag">{localProduct.category}</div>

          {/* Name */}
          <h1 className="pd-product-name">{localProduct.name}</h1>

          {/* Rating */}
          <div className="pd-rating-row">
            <div className="pd-rating-badge">
              <span>{rating.toFixed(1)}</span>
              <Star size={12} fill="white" />
            </div>
            <div className="pd-stars">{renderStars(rating)}</div>
            <span className="pd-rating-count">({ratingCount.toLocaleString()} ratings)</span>
            <button className="pd-share-btn" onClick={handleShare}>
              <Share2 size={16} />
            </button>
          </div>

          {/* Price */}
          <div className="pd-price-section">
            <div className="pd-current-price">₹{localProduct.price.toLocaleString()}</div>
            <div className="pd-original-price">₹{originalPrice.toLocaleString()}</div>
            {discount > 0 && (
              <div className="pd-discount-text">{discount}% off</div>
            )}
          </div>

          <div className="pd-emi-text">
            EMI from <strong>₹{Math.round(localProduct.price / 6).toLocaleString()}/month</strong> • No cost EMI available
          </div>

          {/* Stock Status */}
          <div className={`pd-stock-status ${currentStock > 10 ? "in-stock" : currentStock > 0 ? "low-stock" : "out-of-stock"}`}>
            {currentStock > 10
              ? "✓ In Stock"
              : currentStock > 0
              ? `⚠ Only ${currentStock} left!`
              : "✕ Out of Stock"}
          </div>

          {/* Size Selector */}
          {(isClothing || hasVariants) && uniqueSizes.length > 0 && (
            <div className="pd-size-section" style={{ marginBottom: "16px" }}>
              <div className="pd-size-header">
                <span className="pd-section-label">Select Size</span>
                <button className="pd-size-guide-btn">Size Guide →</button>
              </div>
              <div className="pd-size-grid">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`pd-size-btn ${selectedSize === size ? "selected" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {uniqueColors.length > 0 && (
            <div className="pd-color-section" style={{ marginBottom: "16px" }}>
              <div className="pd-size-header">
                <span className="pd-section-label">Select Color</span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{
                      padding: "8px 16px",
                      border: selectedColor === color ? "2px solid #6366f1" : "1px solid #e2e8f0",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: selectedColor === color ? "#eef2ff" : "white",
                      color: selectedColor === color ? "#6366f1" : "#475569",
                      cursor: "pointer",
                      outline: "none"
                    }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pd-quantity-section" style={{ marginBottom: "16px" }}>
            <span className="pd-section-label">Quantity</span>
            <div className="pd-qty-control">
              <button
                type="button"
                className="pd-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || currentStock === 0}
              >−</button>
              <span className="pd-qty-value">{currentStock === 0 ? 0 : quantity}</span>
              <button
                type="button"
                className="pd-qty-btn"
                onClick={() => setQuantity((q) => Math.min(currentStock || 10, q + 1))}
                disabled={quantity >= (currentStock || 10) || currentStock === 0}
              >+</button>
            </div>
          </div>

          {/* Pincode Checker */}
          <div className="pd-pincode-checker" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "20px", background: "#f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
              <MapPin size={16} style={{ color: "#6366f1" }} />
              <span>Delivery Details</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setPincodeResult(null);
                }}
                style={{
                  flexGrow: 1,
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={handleCheckPincode}
                style={{
                  background: "#6366f1",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Check
              </button>
            </div>
            {pincodeResult && (
              <div style={{ marginTop: "12px", fontSize: "13px", color: pincodeResult.isDeliverable ? "#0f766e" : "#e11d48", display: "flex", gap: "8px", alignItems: "center" }}>
                <span>{pincodeResult.isDeliverable ? "🚚" : "❌"}</span>
                <div>
                  <strong>{pincodeResult.message}</strong>
                  {pincodeResult.isDeliverable && (
                    <p style={{ color: "#64748b", margin: "2px 0 0 0", fontSize: "12px" }}>
                      Expected Delivery by <strong>{pincodeResult.deliveryDate}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pd-actions">
            <button
              type="button"
              className={`pd-add-cart-btn ${addedToCart ? "added" : ""}`}
              onClick={handleAddToCart}
              disabled={currentStock === 0}
            >
              <ShoppingCart size={18} />
              {addedToCart ? "Added to Cart! ✓" : "Add to Cart"}
            </button>
            <button
              type="button"
              className="pd-buy-btn"
              onClick={handleBuyNow}
              disabled={currentStock === 0}
            >
              <Zap size={18} />
              Buy Now
            </button>
          </div>

          {/* Z-Assured */}
          <div className="pd-assured-row">
            <span className="z-assured-badge" style={{ fontSize: "13px", padding: "4px 8px" }}>
              Z-Assured<span>Assured</span>
            </span>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Guaranteed quality, easy returns & fast delivery
            </span>
          </div>

          {/* Description Tabs */}
          <div className="pd-tabs">
            <div className="pd-tab-headers">
              {["description", "details", "delivery"].map((tab) => (
                <button
                  key={tab}
                  className={`pd-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="pd-tab-content">
              {activeTab === "description" && (
                <p style={{ color: "#64748b", lineHeight: 1.8, fontSize: "14px" }}>
                  {localProduct.description || "Premium quality product from Zorexa Fashion. Crafted with care for comfort and style."}
                </p>
              )}
              {activeTab === "details" && (
                <div className="pd-details-grid">
                  <div className="pd-detail-row"><span>Category</span><span>{localProduct.category}</span></div>
                  {isClothing && <div className="pd-detail-row"><span>Selected Size</span><span>{selectedSize}</span></div>}
                  <div className="pd-detail-row"><span>Rating</span><span>⭐ {rating.toFixed(1)} / 5</span></div>
                  <div className="pd-detail-row"><span>Stock</span><span>{localProduct.stock || "Available"} units</span></div>
                  <div className="pd-detail-row"><span>Brand</span><span>Zorexa Fashion</span></div>
                  <div className="pd-detail-row"><span>SKU</span><span>ZF-{(localProduct._id || localProduct.id || "").toString().slice(-6).toUpperCase()}</span></div>
                </div>
              )}
              {activeTab === "delivery" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <Truck size={18} style={{ color: "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>Free Delivery</strong>
                      <p style={{ color: "#64748b", marginTop: "2px" }}>Delivered in 2–5 business days via Z-Assured</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <RotateCcw size={18} style={{ color: "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>7-Day Easy Return</strong>
                      <p style={{ color: "#64748b", marginTop: "2px" }}>Return within 7 days for any reason</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <Shield size={18} style={{ color: "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>Z-Assured Quality</strong>
                      <p style={{ color: "#64748b", marginTop: "2px" }}>100% genuine products, quality guaranteed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section (Flipkart style) */}
      <div className="pd-reviews-section" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "32px", color: "#1e293b" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#0f172a" }}>Ratings & Reviews</h2>
        
        {/* Rating Overview & Breakdown */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginBottom: "32px", borderBottom: "1px solid #f1f5f9", paddingBottom: "24px" }}>
          {/* Average Rating Block */}
          <div style={{ textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "#1e293b", lineHeight: "1" }}>
              {rating.toFixed(1)} <span style={{ fontSize: "24px", color: "#f59e0b" }}>★</span>
            </div>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>{ratingCount} ratings</p>
          </div>

          {/* Star Progress Bars */}
          <div style={{ flexGrow: 1, maxWidth: "400px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              // Calculate specific star counts
              const reviewsList = localProduct.reviews || [];
              const starsCount = reviewsList.filter(r => Math.round(r.rating) === stars).length;
              const percent = reviewsList.length > 0 ? Math.round((starsCount / reviewsList.length) * 100) : 0;
              
              return (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px" }}>
                  <span style={{ width: "24px", fontWeight: "600", color: "#475569" }}>{stars}★</span>
                  <div style={{ flexGrow: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: stars >= 4 ? "#10b981" : stars === 3 ? "#f59e0b" : "#ef4444", borderRadius: "3px" }} />
                  </div>
                  <span style={{ width: "32px", color: "#64748b", textAlign: "right" }}>{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write a Review Form */}
        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Rate this product</h3>
          <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Stars selection */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#475569" }}>Rating:</span>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", fontSize: "20px", outline: "none" }}
                  >
                    <span style={{ color: star <= reviewRating ? "#f59e0b" : "#cbd5e1" }}>★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <textarea
                placeholder="Write your review here... How is the fabric, fit, and color?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Messages */}
            {reviewError && <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>{reviewError}</p>}
            {reviewSuccess && <p style={{ color: "#10b981", fontSize: "13px", margin: 0 }}>{reviewSuccess}</p>}

            {/* Submit btn */}
            <button
              type="submit"
              disabled={reviewSubmitting}
              style={{
                alignSelf: "flex-start",
                background: "#0f172a",
                color: "white",
                padding: "8px 20px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
                cursor: reviewSubmitting ? "not-allowed" : "pointer",
                opacity: reviewSubmitting ? 0.7 : 1
              }}
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Customer Reviews ({localProduct.reviews?.length || 0})</h3>
          
          {(!localProduct.reviews || localProduct.reviews.length === 0) ? (
            <p style={{ color: "#64748b", fontSize: "14px", fontStyle: "italic" }}>No reviews yet. Be the first to review this product!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {localProduct.reviews.map((r, i) => (
                <div key={r._id || i} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    {/* Rating badge */}
                    <div style={{
                      background: r.rating >= 4 ? "#10b981" : r.rating === 3 ? "#f59e0b" : "#ef4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px"
                    }}>
                      <span>{r.rating}</span>
                      <span>★</span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>{r.userName}</strong>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5", margin: 0 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pd-related-section">
          <h2 className="section-title">Similar Products</h2>
          <div className="pd-related-grid">
            {relatedProducts.slice(0, 4).map((p) => {
              const img = getImageUrl(p.image, p.category);
              const op = p.originalPrice || Math.round(p.price * 1.8);
              const disc = Math.round(((op - p.price) / op) * 100);
              return (
                <div
                  key={p._id || p.id}
                  className="pd-related-card"
                  onClick={() => onRelatedClick(p)}
                >
                  <div className="pd-related-img-wrap">
                    <img
                      src={img}
                      alt={p.name}
                      onError={(e) => {
                        e.target.src = p.category?.includes("Gym") || p.category?.includes("Supplement")
                          ? "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80"
                          : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    {disc > 0 && <span className="pd-related-disc">{disc}% off</span>}
                  </div>
                  <p className="pd-related-name">{p.name}</p>
                  <p className="pd-related-price">
                    ₹{p.price.toLocaleString()}
                    <span>₹{op.toLocaleString()}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
