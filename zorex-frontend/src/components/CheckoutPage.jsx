import React, { useState } from "react";
import { ArrowLeft, CheckCircle, MapPin, CreditCard, ShoppingBag, ChevronRight, Tag } from "lucide-react";
import { API_BASE } from "../config/api";

const STEPS = ["Delivery Address", "Order Review", "Payment"];

const COUPONS = {
  ZOREXA10: { discount: 0.10, label: "10% Off" },
  ZOREXA15: { discount: 0.15, label: "15% Off" },
  ZOREXA20: { discount: 0.20, label: "20% Off" },
  FREESHIP: { discount: 50, label: "₹50 Off", flat: true },
  ZOREXAGIFT: { discount: 100, label: "₹100 Off", flat: true },
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage({
  cart,
  user,
  onBack,
  onOrderPlaced,
}) {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ text: "", ok: true });
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addrErrors, setAddrErrors] = useState({});

  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
  const originalTotal = cart.reduce((s, item) => s + (item.originalPrice || Math.round(item.price * 1.8)) * item.quantity, 0);
  const totalDiscount = originalTotal - subtotal;

  let couponDiscount = 0;
  if (appliedCoupon) {
    const c = COUPONS[appliedCoupon];
    couponDiscount = c.flat ? Math.min(c.discount, subtotal) : Math.round(subtotal * c.discount);
  }

  const grandTotal = subtotal - couponDiscount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponMsg({ text: `✓ Coupon "${code}" applied — ${COUPONS[code].label}!`, ok: true });
    } else if (!code) {
      setCouponMsg({ text: "Please enter a coupon code", ok: false });
    } else {
      setAppliedCoupon(null);
      setCouponMsg({ text: "Invalid coupon code", ok: false });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMsg({ text: "", ok: true });
  };

  const validateAddress = () => {
    const errors = {};
    if (!address.name.trim()) errors.name = "Name required";
    if (!address.phone.trim() || address.phone.length < 10) errors.phone = "Valid phone required";
    if (!address.addressLine.trim()) errors.addressLine = "Address required";
    if (!address.city.trim()) errors.city = "City required";
    if (!address.state.trim()) errors.state = "State required";
    if (!address.pincode.trim() || address.pincode.length < 6) errors.pincode = "Valid pincode required";
    setAddrErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateAddress()) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleConfirmOrder = async () => {
    try {
      if (paymentMethod === "upi") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert("Failed to load Razorpay payment SDK. Please check your internet connection.");
          return;
        }

        // Create the order on the backend first
        const data = await onOrderPlaced({
          items: cart,
          address,
          total: grandTotal,
          subtotal,
          discount: couponDiscount,
          couponCode: appliedCoupon || "",
          paymentMethod: "UPI",
        });

        if (!data || !data.razorpayOrder) {
          alert("Failed to create online payment order.");
          return;
        }

        const options = {
          key: data.razorpayKeyId,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "Zorexa Fashion",
          description: "Purchase Order Payment",
          order_id: data.razorpayOrder.id,
          handler: async function (response) {
            try {
              // Call verify-payment endpoint
              const verifyRes = await fetch(`${API_BASE}/api/orders/verify-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("zorex_token")}`
                },
                body: JSON.stringify({
                  orderId: data.order._id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.status === "success") {
                setOrderPlaced(true);
              } else {
                alert(verifyData.message || "Payment verification failed. Please contact support.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              alert("An error occurred during payment verification. Please contact support.");
            }
          },
          prefill: {
            name: address.name,
            contact: address.phone,
            email: user?.email || "",
          },
          theme: {
            color: "#6366f1",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // COD & WhatsApp orders
      const WHATSAPP_NUMBER = "8791910659";
      let message = `🛍️ *ZOREXA FASHION - NEW ORDER*\n\n`;
      message += `*Customer Details:*\n`;
      message += `Name: ${address.name}\n`;
      message += `Phone: ${address.phone}\n`;
      message += `Address: ${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}\n\n`;
      message += `*Order Items:*\n`;

      cart.forEach((item, i) => {
        message += `${i + 1}. ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ""} × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}\n`;
      });

      message += `\n*Price Breakdown:*\n`;
      message += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
      if (couponDiscount > 0) message += `Coupon (${appliedCoupon}): -₹${couponDiscount.toLocaleString()}\n`;
      message += `Delivery: FREE\n`;
      message += `*Total: ₹${grandTotal.toLocaleString()}*\n\n`;
      message += `Payment Method: ${paymentMethod === "whatsapp" ? "WhatsApp Order (COD)" : "Cash on Delivery"}\n\n`;
      message += `Thank you for shopping at Zorexa Fashion! 🎉`;

      await onOrderPlaced({
        items: cart,
        address,
        total: grandTotal,
        subtotal,
        discount: couponDiscount,
        couponCode: appliedCoupon || "",
        paymentMethod: paymentMethod === "whatsapp" ? "whatsapp" : "cod",
      });

      if (paymentMethod === "whatsapp") {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
      }

      setOrderPlaced(true);
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not place order.");
    }
  };

  // ORDER PLACED SUCCESS SCREEN
  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <div className="checkout-success-card">
          <div className="checkout-success-icon">
            <CheckCircle size={64} style={{ color: "#10b981" }} />
          </div>
          <h2>Order Placed Successfully! 🎉</h2>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>
            Your order has been placed. {paymentMethod === "whatsapp" ? "A WhatsApp message has been sent to our team." : "Our team will contact you for delivery."}
          </p>
          <div className="checkout-success-summary">
            <div className="checkout-success-row">
              <span>Items</span>
              <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="checkout-success-row">
              <span>Total Paid</span>
              <strong style={{ color: "#10b981" }}>₹{grandTotal.toLocaleString()}</strong>
            </div>
            <div className="checkout-success-row">
              <span>Delivery</span>
              <span>2–5 Business Days</span>
            </div>
          </div>
          <button onClick={onBack} style={{ width: "100%", marginTop: "1.5rem", background: "#6366f1" }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <div className="checkout-header">
        <button className="pd-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <h1>Checkout</h1>
      </div>

      {/* Steps Progress */}
      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`checkout-step ${i === step ? "active" : i < step ? "done" : ""}`}>
            <div className="checkout-step-num">
              {i < step ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
            </div>
            <span className="checkout-step-label">{s}</span>
            {i < STEPS.length - 1 && <div className={`checkout-step-line ${i < step ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="checkout-body">
        {/* MAIN CONTENT */}
        <div className="checkout-main">
          {/* STEP 0: Address */}
          {step === 0 && (
            <div className="checkout-card">
              <div className="checkout-card-header">
                <MapPin size={18} />
                <h2>Delivery Address</h2>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    placeholder="Vansh Soam"
                    className={addrErrors.name ? "error" : ""}
                  />
                  {addrErrors.name && <span className="field-error">{addrErrors.name}</span>}
                </div>

                <div className="checkout-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="8791910659"
                    className={addrErrors.phone ? "error" : ""}
                  />
                  {addrErrors.phone && <span className="field-error">{addrErrors.phone}</span>}
                </div>
              </div>

              <div className="checkout-field">
                <label>Full Address *</label>
                <textarea
                  value={address.addressLine}
                  onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                  placeholder="House No., Street, Landmark..."
                  rows={3}
                  className={addrErrors.addressLine ? "error" : ""}
                />
                {addrErrors.addressLine && <span className="field-error">{addrErrors.addressLine}</span>}
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label>City *</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Agra"
                    className={addrErrors.city ? "error" : ""}
                  />
                  {addrErrors.city && <span className="field-error">{addrErrors.city}</span>}
                </div>

                <div className="checkout-field">
                  <label>State *</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="Uttar Pradesh"
                    className={addrErrors.state ? "error" : ""}
                  />
                  {addrErrors.state && <span className="field-error">{addrErrors.state}</span>}
                </div>

                <div className="checkout-field">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.slice(0, 6) })}
                    placeholder="282001"
                    maxLength={6}
                    className={addrErrors.pincode ? "error" : ""}
                  />
                  {addrErrors.pincode && <span className="field-error">{addrErrors.pincode}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Order Review */}
          {step === 1 && (
            <div className="checkout-card">
              <div className="checkout-card-header">
                <ShoppingBag size={18} />
                <h2>Review Your Order ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h2>
              </div>

              <div className="checkout-items-list">
                {cart.map((item) => {
                  const img = item.image?.startsWith("http") ? item.image : `${API_BASE}${item.image}`;
                  return (
                    <div key={item._id || item.id} className="checkout-item">
                      <img src={img} alt={item.name} className="checkout-item-img" />
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{item.name}</p>
                        {item.selectedSize && (
                          <p className="checkout-item-size">Size: {item.selectedSize}</p>
                        )}
                        <p className="checkout-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="checkout-coupon-section">
                <div className="checkout-coupon-header">
                  <Tag size={16} />
                  <span>Apply Coupon</span>
                </div>

                {!appliedCoupon ? (
                  <div className="checkout-coupon-input">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON CODE"
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <button onClick={applyCoupon}>Apply</button>
                  </div>
                ) : (
                  <div className="checkout-coupon-applied">
                    <span>✓ {appliedCoupon} — {COUPONS[appliedCoupon].label}</span>
                    <button onClick={removeCoupon} style={{ color: "#ef4444" }}>Remove</button>
                  </div>
                )}

                {couponMsg.text && (
                  <p className={`coupon-msg ${couponMsg.ok ? "ok" : "error"}`}>{couponMsg.text}</p>
                )}

                <div className="checkout-coupon-hints">
                  Try: ZOREXA10 | ZOREXA15 | ZOREXA20 | FREESHIP | ZOREXAGIFT
                </div>
              </div>

              {/* Delivery address summary */}
              <div className="checkout-addr-summary">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px" }}>Delivering to:</strong>
                  <button
                    onClick={() => setStep(0)}
                    style={{ fontSize: "12px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", boxShadow: "none" }}
                  >
                    Change
                  </button>
                </div>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  {address.name} • {address.phone}<br />
                  {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="checkout-card">
              <div className="checkout-card-header">
                <CreditCard size={18} />
                <h2>Choose Payment Method</h2>
              </div>

              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === "whatsapp" ? "selected" : ""}`}>
                  <input type="radio" name="payment" value="whatsapp" checked={paymentMethod === "whatsapp"} onChange={() => setPaymentMethod("whatsapp")} />
                  <div className="payment-option-content">
                    <div className="payment-icon">💬</div>
                    <div>
                      <div className="payment-name">WhatsApp Order</div>
                      <div className="payment-desc">Place order via WhatsApp — our team contacts you. Pay on delivery.</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                  <div className="payment-option-content">
                    <div className="payment-icon">💵</div>
                    <div>
                      <div className="payment-name">Cash on Delivery</div>
                      <div className="payment-desc">Pay when your order arrives at your doorstep. 100% safe.</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                  <div className="payment-option-content">
                    <div className="payment-icon">💳</div>
                    <div>
                      <div className="payment-name">Online Payment</div>
                      <div className="payment-desc">Pay instantly using UPI, Cards, NetBanking, or Wallet via Razorpay.</div>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === "upi" && (
                <div style={{ padding: "16px", background: "#eef2ff", borderRadius: "8px", marginTop: "1rem", fontSize: "13px", color: "#4f46e5", border: "1px solid #c7d2fe" }}>
                  Pay securely using Razorpay sandbox/test environment.
                </div>
              )}

              {/* Final Address & Items Summary */}
              <div className="checkout-final-summary">
                <p><strong>📍 Address:</strong> {address.addressLine}, {address.city} - {address.pincode}</p>
                <p style={{ marginTop: "6px" }}><strong>{cart.reduce((s, i) => s + i.quantity, 0)} items</strong> • Z-Assured delivery in 2–5 days</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="checkout-nav-btns">
            {step > 0 && (
              <button className="checkout-prev-btn" onClick={() => setStep((s) => s - 1)}>
                ← Previous
              </button>
            )}
            {step < 2 ? (
              <button className="checkout-next-btn" onClick={handleNext}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="checkout-place-btn"
                onClick={handleConfirmOrder}
              >
                {paymentMethod === "whatsapp" 
                  ? "📲 Place Order via WhatsApp" 
                  : paymentMethod === "cod" 
                  ? "✅ Confirm Order (COD)" 
                  : "💳 Pay Online via Razorpay"}
              </button>
            )}
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="checkout-summary">
          <h3 className="checkout-summary-title">Price Details</h3>

          <div className="checkout-summary-row">
            <span>Price ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>₹{originalTotal.toLocaleString()}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Discount</span>
            <span style={{ color: "#10b981" }}>-₹{totalDiscount.toLocaleString()}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="checkout-summary-row">
              <span>Coupon ({appliedCoupon})</span>
              <span style={{ color: "#10b981" }}>-₹{couponDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="checkout-summary-row">
            <span>Delivery</span>
            <span style={{ color: "#10b981" }}>FREE</span>
          </div>
          <div className="checkout-summary-divider" />
          <div className="checkout-summary-total">
            <span>Total Amount</span>
            <strong>₹{grandTotal.toLocaleString()}</strong>
          </div>
          <div className="checkout-summary-savings">
            You save ₹{(totalDiscount + couponDiscount).toLocaleString()} on this order! 🎉
          </div>

          {/* Mini cart items */}
          <div style={{ marginTop: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
            {cart.map((item) => {
              const img = item.image?.startsWith("http") ? item.image : `${API_BASE}${item.image}`;
              return (
                <div key={item._id || item.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <img src={img} alt={item.name} style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "4px", background: "#f8fafc" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8" }}>×{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "700" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
