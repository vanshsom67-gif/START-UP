import React, { useState, useEffect } from "react";
import { Trash2, ShoppingBag, Plus, Minus, Sparkles, ArrowRight } from "lucide-react";
import { API_BASE, getImageUrl } from "../config/api";

export default function Cart({ cart, onRemoveFromCart, onClearCart, onCheckout, onUpdateQuantity, onGoToCheckout }) {
  const totalOriginal = cart.reduce((sum, item) => sum + (item.originalPrice || Math.round(item.price * 1.8)) * item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = totalOriginal - total;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponMsgColor, setCouponMsgColor] = useState("");

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "ZOREXA10") {
      setAppliedCoupon(cleanCode);
      setCouponMsg("Coupon ZOREXA10 Applied (10% Discount)");
      setCouponMsgColor("#10b981");
    } else if (cleanCode === "ZOREXA15") {
      setAppliedCoupon(cleanCode);
      setCouponMsg("Coupon ZOREXA15 Applied (15% Discount)");
      setCouponMsgColor("#10b981");
    } else if (cleanCode === "ZOREXA20") {
      setAppliedCoupon(cleanCode);
      setCouponMsg("Coupon ZOREXA20 Applied (20% Discount)");
      setCouponMsgColor("#10b981");
    } else if (cleanCode === "FREESHIP") {
      setAppliedCoupon(cleanCode);
      setCouponMsg("Coupon FREESHIP Applied (Extra ₹50 Off)");
      setCouponMsgColor("#10b981");
    } else if (cleanCode === "ZOREXAGIFT") {
      setAppliedCoupon(cleanCode);
      setCouponMsg("Coupon ZOREXAGIFT Applied (Flat ₹100 Off)");
      setCouponMsgColor("#10b981");
    } else if (cleanCode === "") {
      setAppliedCoupon(null);
      setCouponMsg("");
      setCouponDiscount(0);
    } else {
      setAppliedCoupon(null);
      setCouponMsg("Invalid Coupon Code");
      setCouponMsgColor("#ef4444");
      setCouponDiscount(0);
    }
  };

  const handleApplyCoupon = () => {
    applyCoupon(couponInput);
  };

  useEffect(() => {
    const won = localStorage.getItem("won_coupon");
    if (won) {
      setCouponInput(won);
      applyCoupon(won);
    }
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      let disc = 0;
      if (appliedCoupon === "ZOREXA10") disc = Math.round(total * 0.1);
      else if (appliedCoupon === "ZOREXA15") disc = Math.round(total * 0.15);
      else if (appliedCoupon === "ZOREXA20") disc = Math.round(total * 0.20);
      else if (appliedCoupon === "FREESHIP") disc = 50;
      else if (appliedCoupon === "ZOREXAGIFT") disc = 100;

      setCouponDiscount(Math.min(disc, total));
    } else {
      setCouponDiscount(0);
    }
  }, [total, appliedCoupon]);

  const handleOrder = () => {
    if (cart.length === 0) {
      return;
    }
    onCheckout(cart, total, couponDiscount, appliedCoupon);
  };

  if (cart.length === 0) {
    return (
      <div
        className="cart-section empty-cart-card"
        id="cart"
        style={{
          margin: "3rem auto",
          padding: "3.5rem 2rem",
          background: "rgba(18, 18, 24, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "700px",
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            color: "#a855f7",
          }}
        >
          <ShoppingBag size={38} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#f8fafc", marginBottom: "0.5rem" }}>
          Your Bag is Empty
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: "420px", margin: "0 auto 1.75rem auto", lineHeight: "1.5" }}>
          Explore our signature streetwear, couture essentials & supplements collection and add your favorite items.
        </p>
        <button
          onClick={() => {
            document.getElementById("products-catalog")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 20px rgba(168, 85, 247, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <Sparkles size={16} />
          <span>Explore Catalog</span>
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="cart-section"
      id="cart"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "24px",
        maxWidth: "1200px",
        margin: "3rem auto",
        padding: "0 1rem",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        textAlign: "left",
        flexWrap: "wrap"
      }}
    >
      <div className="cart-left" style={{ flex: "2 1 600px", background: "rgba(18, 18, 24, 0.85)", padding: "24px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", paddingBottom: "15px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc" }}>
          My Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h2>

        <div className="cart-items-list" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.25rem" }}>
          {cart.map((item) => {
            const imageUrl = getImageUrl(item.image, item.category);
            const originalPrice = item.originalPrice || Math.round(item.price * 1.8);
            const discount = Math.round(((originalPrice - item.price) / originalPrice) * 100);

            return (
              <div
                key={item.cartItemId || item._id || item.id}
                className="cart-item"
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  alignItems: "center"
                }}
              >
                <img
                  src={imageUrl}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";
                  }}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", flexShrink: 0, border: "1px solid rgba(255, 255, 255, 0.1)" }}
                />

                <div className="cart-item-info" style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "4px" }}>
                    {item.name}
                  </h4>
                  {item.selectedSize && (
                    <span style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                      Size: <strong style={{ color: "#e2e8f0" }}>{item.selectedSize}</strong>
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>₹{item.price.toLocaleString()}</span>
                    <span style={{ fontSize: "13px", textDecoration: "line-through", color: "#64748b" }}>₹{originalPrice.toLocaleString()}</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>{discount}% Off</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>Qty:</span>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "6px", overflow: "hidden", background: "rgba(0,0,0,0.3)" }}>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId || item._id || item.id, item.quantity - 1)}
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          color: item.quantity <= 1 ? "#475569" : "#a855f7",
                          border: "none",
                          cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: "4px 12px", fontWeight: "700", fontSize: "13px", borderLeft: "1px solid rgba(255, 255, 255, 0.1)", borderRight: "1px solid rgba(255, 255, 255, 0.1)", color: "#f8fafc" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId || item._id || item.id, item.quantity + 1)}
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          color: "#a855f7",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Total: <strong style={{ color: "#f8fafc" }}>₹{(item.price * item.quantity).toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                <button
                  className="danger"
                  onClick={() => onRemoveFromCart(item.cartItemId || item._id || item.id)}
                  style={{ padding: "8px 10px", borderRadius: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer", flexShrink: 0 }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className="secondary" onClick={onClearCart} style={{ textTransform: "uppercase", padding: "8px 18px", fontSize: "12px" }}>
            Clear Cart
          </button>
        </div>
      </div>

      <div className="cart-right" style={{ flex: "1 1 320px", background: "rgba(18, 18, 24, 0.85)", padding: "24px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)", height: "fit-content" }}>
        <div className="price-details-title" style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", marginBottom: "15px" }}>
          Price Summary
        </div>

        <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px", color: "#cbd5e1" }}>
          <span>Total MRP ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
          <span>₹{totalOriginal.toLocaleString()}</span>
        </div>

        <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
          <span style={{ color: "#cbd5e1" }}>Discount</span>
          <span style={{ color: "#10b981", fontWeight: "600" }}>-₹{totalDiscount.toLocaleString()}</span>
        </div>

        <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "15px" }}>
          <span style={{ color: "#cbd5e1" }}>Delivery Fee</span>
          <span style={{ color: "#10b981", fontWeight: "600" }}>FREE</span>
        </div>

        {/* Promo Coupon */}
        <div style={{ margin: "15px 0", borderTop: "1px dashed rgba(255, 255, 255, 0.1)", borderBottom: "1px dashed rgba(255, 255, 255, 0.1)", padding: "15px 0" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Zorexa Promo Coupon</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="ENTER CODE"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: "8px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "6px", fontSize: "13px", color: "#f8fafc", outline: "none", textTransform: "uppercase", fontWeight: "600" }}
            />
            <button
              onClick={handleApplyCoupon}
              style={{ padding: "0 16px", fontSize: "12px", background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer", fontWeight: "600" }}
            >
              Apply
            </button>
          </div>
          {couponMsg && (
            <div style={{ fontSize: "11px", marginTop: "6px", fontWeight: "600", color: couponMsgColor }}>
              {couponMsg}
            </div>
          )}
        </div>

        {couponDiscount > 0 && (
          <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "15px", color: "#10b981" }}>
            <span>Coupon ({appliedCoupon})</span>
            <span>-₹{couponDiscount.toLocaleString()}</span>
          </div>
        )}

        <div className="price-row total-amount" style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.1)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", padding: "14px 0", fontWeight: "700", fontSize: "16px", color: "#f8fafc", marginBottom: "18px" }}>
          <span>Grand Total</span>
          <span style={{ color: "#a855f7" }}>₹{(total - couponDiscount).toLocaleString()}</span>
        </div>

        {/* Checkout Buttons */}
        {onGoToCheckout && (
          <button
            onClick={onGoToCheckout}
            style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #6366f1, #ec4899)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "10px", cursor: "pointer", letterSpacing: "0.5px", boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)" }}
          >
            🛒 Proceed to Checkout
          </button>
        )}

        <button
          onClick={handleOrder}
          style={{ width: "100%", padding: "12px", background: "rgba(236, 72, 153, 0.15)", color: "#f472b6", border: "1px solid rgba(236, 72, 153, 0.3)", borderRadius: "8px", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
        >
          <ShoppingBag size={15} />
          <span>Quick Order via WhatsApp</span>
        </button>

        <div className="green-savings" style={{ color: "#10b981", fontWeight: "600", fontSize: "13px", marginTop: "15px", textAlign: "center", background: "rgba(16, 185, 129, 0.08)", padding: "8px", borderRadius: "6px" }}>
          ✨ You will save ₹{(totalDiscount + couponDiscount).toLocaleString()} on this order
        </div>
      </div>
    </div>
  );
}
