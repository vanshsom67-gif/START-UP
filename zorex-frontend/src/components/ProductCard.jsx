import React from "react";
import { ShoppingCart, Zap, Heart, Star, ShieldCheck } from "lucide-react";
import { getImageUrl } from "../config/api";

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onCardClick,
  isWishlisted,
  onToggleWishlist,
}) {
  const productId = product._id || product.id;

  const [isHovered, setIsHovered] = React.useState(false);

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];

  const primaryImage = getImageUrl(imagesList[0], product.category);
  const secondaryImage = imagesList[1]
    ? getImageUrl(imagesList[1], product.category)
    : primaryImage;

  const currentDisplayImg = (isHovered && imagesList.length > 1) ? secondaryImage : primaryImage;

  const originalPrice = product.originalPrice || Math.round(product.price * 1.8);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const rating = product.rating || 4.5;
  const ratingCount = product.ratingCount || 128;

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(productId);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    onBuyNow(product);
  };

  return (
    <div
      className="product-card"
      onClick={() => onCardClick && onCardClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wishlist heart */}
      {onToggleWishlist && (
        <button
          className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={handleWishlistClick}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "#f43f5e" : "none"} color={isWishlisted ? "#f43f5e" : "#94a3b8"} />
        </button>
      )}

      {/* Discount badge */}
      {discount > 0 && (
        <div className="product-discount-badge">{discount}% OFF</div>
      )}

      {/* Image */}
      <div className="product-image-container">
        <img
          src={currentDisplayImg}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = product.category?.includes("Gym") || product.category?.includes("Supplement")
              ? "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80";
          }}
        />
      </div>

      {/* Info */}
      <div className="product-info">
        <div className="product-category-tag">{product.category || "FASHION"}</div>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating-row">
          <span className="rating-badge">
            {rating.toFixed(1)} <Star size={10} fill="#f59e0b" color="#f59e0b" />
          </span>
          <span className="rating-count">({ratingCount})</span>
        </div>

        <div className="product-price-row">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          {originalPrice > product.price && (
            <span className="product-original-price">₹{originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* ZOREXA Verified */}
        <div className="z-assured-badge">
          <ShieldCheck size={12} color="#8b5cf6" />
          <span>ZOREXA VERIFIED</span>
        </div>

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="low-stock-warning">
            Limited Stock: Only {product.stock} left
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button
          className="secondary"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={14} />
          <span>{product.stock === 0 ? "Sold Out" : "Add to Cart"}</span>
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
        >
          <Zap size={14} />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
