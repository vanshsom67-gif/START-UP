import React from "react";
import { ShoppingCart, Zap } from "lucide-react";

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const BACKEND_URL = "http://localhost:5000";
  const imageUrl = product.image.startsWith("http") 
    ? product.image 
    : `${BACKEND_URL}${product.image}`;

  // Robust calculations for original price, discount, and ratings if not provided
  const originalPrice = product.originalPrice || Math.round(product.price * 1.8);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const rating = product.rating || (4.0 + (product.id % 10) * 0.1);
  const ratingCount = product.ratingCount || (45 + (product.id * 17) % 500);

  return (
    <div className="product-card" onClick={() => onBuyNow(product)}>
      <div className="image-container">
        <img src={imageUrl} alt={product.name} loading="lazy" />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div className="rating-badge">
            <span>{rating.toFixed(1)}</span>
            <span style={{ fontSize: "9px" }}>★</span>
          </div>
          <span className="rating-count-text">({ratingCount.toLocaleString()})</span>
        </div>

        <p className="price" style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <span>₹{product.price.toLocaleString()}</span>
          <span className="original-price-text">₹{originalPrice.toLocaleString()}</span>
          <span className="discount-text">{discount}% off</span>
        </p>

        <div className="z-assured-badge">
          Z-Assured<span>Assured</span>
        </div>
        
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className="secondary" 
            onClick={() => onAddToCart(product)}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <ShoppingCart size={14} />
            <span>Add</span>
          </button>
          
          <button 
            onClick={() => onBuyNow(product)}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Zap size={14} />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
