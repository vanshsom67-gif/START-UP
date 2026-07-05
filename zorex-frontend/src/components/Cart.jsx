import React, { useState, useEffect } from "react";
import { Trash2, ShoppingBag } from "lucide-react";

export default function Cart({ cart, onRemoveFromCart, onClearCart, onCheckout }) {
  const totalOriginal = cart.reduce((sum, item) => sum + (item.originalPrice || Math.round(item.price * 1.8)), 0);
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const totalDiscount = totalOriginal - total;

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
      alert("Your cart is empty!");
      return;
    }
    onCheckout(cart, total, couponDiscount, appliedCoupon);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-section" id="cart" style={{ margin: "2rem auto", padding: "3rem 1.5rem", background: "white", border: "1px solid #e0e0e0", borderRadius: "4px", textAlign: "center", maxWidth: "800px" }}>
        <img 
          src="https://img1a.flixcart.com/www/linchpin/fk-cp-zion/img/my-orders-empty_f06d8a.png" 
          alt="Empty Cart" 
          style={{ width: "150px", marginBottom: "1rem" }}
        />
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>Your Cart is Empty!</h2>
        <p style={{ color: "#878787", margin: "1rem 0" }}>Add items to it now to shop premium fashion & devices.</p>
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
        gap: "20px", 
        maxWidth: "1200px", 
        margin: "3rem auto", 
        padding: "0", 
        background: "transparent", 
        border: "none", 
        boxShadow: "none", 
        textAlign: "left",
        flexWrap: "wrap"
      }}
    >
      <div className="cart-left" style={{ flex: "2 1 600px", background: "white", padding: "20px", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", paddingBottom: "15px", borderBottom: "1px solid #f0f0f0" }}>
          My Cart ({cart.length})
        </h2>
        
        <div className="cart-items-list" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
          {cart.map((item, index) => {
            const BACKEND_URL = "http://localhost:5000";
            const imageUrl = item.image.startsWith("http") ? item.image : `${BACKEND_URL}${item.image}`;
            const originalPrice = item.originalPrice || Math.round(item.price * 1.8);
            const discount = Math.round(((originalPrice - item.price) / originalPrice) * 100);

            return (
              <div 
                key={index} 
                className="cart-item" 
                style={{ 
                  display: "flex", 
                  gap: "15px", 
                  padding: "15px 0", 
                  borderBottom: "1px solid #f0f0f0",
                  alignItems: "center"
                }}
              >
                <img 
                  src={imageUrl} 
                  alt={item.name} 
                  style={{ width: "80px", height: "80px", objectFit: "contain" }}
                />
                
                <div className="cart-item-info" style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "500", color: "#212121", marginBottom: "4px" }}>
                    {item.name}
                  </h4>
                  <div className="z-assured-badge" style={{ marginBottom: "6px" }}>
                    Z-Assured<span>Assured</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#212121" }}>₹{item.price.toLocaleString()}</span>
                    <span style={{ fontSize: "13px", textDecoration: "line-through", color: "#878787" }}>₹{originalPrice.toLocaleString()}</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#388e3c" }}>{discount}% Off</span>
                  </div>
                </div>
                
                <button 
                  className="danger" 
                  onClick={() => onRemoveFromCart(index)}
                  style={{ padding: "0.4rem 0.6rem", borderRadius: "2px", background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className="secondary" onClick={onClearCart} style={{ marginRight: "10px", textTransform: "uppercase", padding: "10px 20px" }}>
            Clear Cart
          </button>
        </div>
      </div>

      <div className="cart-right" style={{ flex: "1 1 300px", background: "white", padding: "20px", borderRadius: "4px", border: "1px solid #e0e0e0", height: "fit-content" }}>
        <div className="price-details-title" style={{ color: "#878787", textTransform: "uppercase", fontSize: "13px", fontWeight: "600", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px", marginBottom: "15px" }}>
          Price Details
        </div>
        
        <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "15px" }}>
          <span>Price ({cart.length} items)</span>
          <span>₹{totalOriginal.toLocaleString()}</span>
        </div>
        
        <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "15px" }}>
          <span>Discount</span>
          <span style={{ color: "#10b981" }}>-₹{totalDiscount.toLocaleString()}</span>
        </div>
        
        <div className="price-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "15px" }}>
          <span>Delivery Charges</span>
          <span style={{ color: "#10b981" }}>FREE</span>
        </div>

        {/* Zorexa Promo Coupon input box */}
        <div style={{ margin: "15px 0", borderTop: "1px dashed #e0e0e0", borderBottom: "1px dashed #e0e0e0", padding: "15px 0" }}>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: "#878787", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Zorexa Promo Coupon</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input 
              type="text" 
              placeholder="ENTER CODE" 
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", outline: "none", textTransform: "uppercase", fontWeight: "600" }}
            />
            <button 
              onClick={handleApplyCoupon} 
              style={{ padding: "0 15px", fontSize: "12px", background: "#6366f1", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontWeight: "600" }}
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
        
        <div className="price-row total-amount" style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #e0e0e0", borderBottom: "1px dashed #e0e0e0", padding: "15px 0", fontWeight: "600", fontSize: "16px", marginBottom: "15px" }}>
          <span>Total Amount</span>
          <span>₹{(total - couponDiscount).toLocaleString()}</span>
        </div>
        
        <button 
          onClick={handleOrder} 
          style={{ width: "100%", padding: "12px", background: "#ec4899", color: "white", border: "none", borderRadius: "2px", fontWeight: "600", fontSize: "14px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <ShoppingBag size={16} />
          <span>Place Order via WhatsApp</span>
        </button>
        
        <div className="green-savings" style={{ color: "#10b981", fontWeight: "600", fontSize: "14px", marginTop: "15px", textAlign: "center" }}>
          You will save ₹{(totalDiscount + couponDiscount).toLocaleString()} on this order
        </div>
      </div>
    </div>
  );
}
