import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { getImageUrl } from "../config/api";

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onRemoveFromCart,
  onUpdateQuantity,
  onGoToCheckout,
  onClearCart,
  onOpenSpinWheel,
}) {
  if (!isOpen) return null;

  const totalOriginal = cart.reduce(
    (sum, item) => sum + (item.originalPrice || Math.round(item.price * 1.8)) * item.quantity,
    0
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = totalOriginal - total;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-badge">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3>Shopping Bag</h3>
              <span className="drawer-item-count">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close cart drawer">
            <X size={20} />
          </button>
        </div>

        {/* Coupon Teaser */}
        {cart.length > 0 && onOpenSpinWheel && (
          <div className="drawer-promo-banner" onClick={onOpenSpinWheel}>
            <Sparkles size={15} color="#c026d3" />
            <span>Spin & Win up to 20% OFF your bag!</span>
            <span className="drawer-promo-btn">Spin 🎰</span>
          </div>
        )}

        {/* Content Body */}
        {cart.length === 0 ? (
          <div className="drawer-empty-state">
            <div className="drawer-empty-icon">
              <ShoppingBag size={48} />
            </div>
            <h4>Your Bag is Empty</h4>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button
              className="drawer-browse-btn"
              onClick={() => {
                onClose();
                document.getElementById("products-catalog")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items-list">
              {cart.map((item) => {
                const img = getImageUrl(item.image, item.category);
                const originalPrice = item.originalPrice || Math.round(item.price * 1.8);
                const discount = Math.round(((originalPrice - item.price) / originalPrice) * 100);

                return (
                  <div key={item.cartItemId || item._id || item.id} className="drawer-item">
                    <img
                      src={img}
                      alt={item.name}
                      className="drawer-item-img"
                      onError={(e) => {
                        e.target.src = item.category?.includes("Gym") || item.category?.includes("Supplement")
                          ? "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=200&q=80"
                          : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80";
                      }}
                    />

                    <div className="drawer-item-info">
                      <div className="drawer-item-top">
                        <h5 className="drawer-item-name">{item.name}</h5>
                        <button
                          className="drawer-remove-btn"
                          onClick={() => onRemoveFromCart(item.cartItemId || item._id || item.id)}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.selectedSize && (
                        <div className="drawer-item-variant">Size: {item.selectedSize}</div>
                      )}

                      <div className="drawer-price-row">
                        <span className="drawer-item-price">₹{item.price.toLocaleString()}</span>
                        {originalPrice > item.price && (
                          <span className="drawer-item-orig">₹{originalPrice.toLocaleString()}</span>
                        )}
                        {discount > 0 && (
                          <span className="drawer-item-discount">{discount}% off</span>
                        )}
                      </div>

                      <div className="drawer-qty-row">
                        <div className="drawer-qty-stepper">
                          <button
                            onClick={() => onUpdateQuantity(item.cartItemId || item._id || item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.cartItemId || item._id || item.id, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="drawer-item-subtotal">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div className="drawer-footer">
              <div className="drawer-summary-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="drawer-summary-row savings">
                <span>Total Savings</span>
                <span>-₹{totalDiscount.toLocaleString()}</span>
              </div>
              <div className="drawer-summary-row">
                <span>Delivery</span>
                <span style={{ color: "#10b981", fontWeight: "700" }}>FREE</span>
              </div>
              <div className="drawer-grand-total">
                <span>Grand Total</span>
                <span className="grand-val">₹{total.toLocaleString()}</span>
              </div>

              <button
                className="drawer-checkout-btn"
                onClick={() => {
                  onClose();
                  onGoToCheckout();
                }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="drawer-assured-badge">
                <ShieldCheck size={14} color="#8b5cf6" />
                <span>ZOREXA 100% Authentic Guarantee</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
