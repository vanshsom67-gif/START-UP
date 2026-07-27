import React from "react";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Zap } from "lucide-react";
import { API_BASE } from "../config/api";

export default function WishlistPage({
  wishlist,
  products,
  onBack,
  onRemoveFromWishlist,
  onAddToCart,
  onBuyNow,
  onProductClick,
}) {
  // Get full product objects from wishlist IDs
  const wishlistProducts = products.filter((p) =>
    wishlist.includes(p._id || p.id)
  );

  const handleMoveToCart = (product) => {
    onAddToCart(product);
    onRemoveFromWishlist(product._id || product.id);
  };

  if (wishlistProducts.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-header">
          <button className="pd-back-btn" onClick={onBack}>
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
          <h1 className="wishlist-title">My Wishlist</h1>
        </div>

        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <Heart size={64} style={{ color: "#e2e8f0" }} />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Save your favourite items to wishlist and shop them later!</p>
          <button onClick={onBack} style={{ marginTop: "1.5rem" }}>
            <ShoppingCart size={16} />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <button className="pd-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <h1 className="wishlist-title">
          My Wishlist
          <span className="wishlist-count">{wishlistProducts.length} items</span>
        </h1>
      </div>

      <div className="wishlist-grid">
        {wishlistProducts.map((product) => {
          const imageUrl = product.image?.startsWith("http")
            ? product.image
            : `${API_BASE}${product.image}`;
          const originalPrice = product.originalPrice || Math.round(product.price * 1.8);
          const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
          const rating = product.rating || 4.2;

          return (
            <div key={product._id || product.id} className="wishlist-card">
              {/* Remove button */}
              <button
                className="wishlist-remove-btn"
                onClick={() => onRemoveFromWishlist(product._id || product.id)}
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>

              {/* Discount badge */}
              {discount > 0 && (
                <div className="wishlist-disc-badge">{discount}% OFF</div>
              )}

              {/* Image */}
              <div
                className="wishlist-img-wrap"
                onClick={() => onProductClick(product)}
              >
                <img src={imageUrl} alt={product.name} />
              </div>

              {/* Info */}
              <div className="wishlist-info">
                <p
                  className="wishlist-name"
                  onClick={() => onProductClick(product)}
                >
                  {product.name}
                </p>

                <div className="wishlist-rating">
                  <span style={{ color: "#f59e0b" }}>★</span>
                  <span>{rating.toFixed(1)}</span>
                </div>

                <div className="wishlist-price-row">
                  <span className="wishlist-price">₹{product.price.toLocaleString()}</span>
                  <span className="wishlist-original">₹{originalPrice.toLocaleString()}</span>
                </div>

                {/* Stock */}
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="wishlist-low-stock">Only {product.stock} left!</p>
                )}

                {/* Actions */}
                <div className="wishlist-actions">
                  <button
                    className="wishlist-cart-btn"
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={14} />
                    Move to Cart
                  </button>
                  <button
                    className="wishlist-buy-btn"
                    onClick={() => onBuyNow(product)}
                    disabled={product.stock === 0}
                  >
                    <Zap size={14} />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
