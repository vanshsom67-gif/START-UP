import React, { useState } from "react";
import { X, Sparkles, Gift, Check, ArrowRight } from "lucide-react";

const PRIZES = [
  { code: "ZOREXA10", label: "10% OFF", color: "#6366f1", desc: "10% off your entire bag" },
  { code: "FREESHIP", label: "FREE SHIPPING", color: "#ec4899", desc: "₹50 flat shipping savings" },
  { code: "ZOREXA15", label: "15% OFF", color: "#8b5cf6", desc: "15% off couture & streetwear" },
  { code: "ZOREXAGIFT", label: "₹100 GIFT", color: "#10b981", desc: "Flat ₹100 instant checkout gift" },
  { code: "ZOREXA20", label: "20% VIP OFF", color: "#f59e0b", desc: "20% exclusive VIP discount" },
  { code: "ZOREXA10", label: "10% OFF", color: "#06b6d4", desc: "10% off your order" },
];

export default function SpinWheelModal({ isOpen, onClose, onApplyCoupon }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(() => {
    const saved = localStorage.getItem("won_coupon");
    return saved ? PRIZES.find((p) => p.code === saved) || null : null;
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);

    // Random prize selection
    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const selectedPrize = PRIZES[randomIndex];

    // Segment angle = 360 / 6 = 60 deg
    const segmentAngle = 360 / PRIZES.length;
    // Calculate target rotation with 5 full rotations (1800 deg)
    const extraRounds = 1800 + (360 - (randomIndex * segmentAngle + segmentAngle / 2));
    const newRotation = rotation + extraRounds;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setWonPrize(selectedPrize);
      localStorage.setItem("won_coupon", selectedPrize.code);
      if (onApplyCoupon) onApplyCoupon(selectedPrize.code);
    }, 4000);
  };

  const handleClaim = () => {
    if (wonPrize && onApplyCoupon) {
      onApplyCoupon(wonPrize.code);
      navigator.clipboard.writeText(wonPrize.code);
      setCopied(true);
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  return (
    <div className="spin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="spin-modal-card">
        <button className="spin-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="spin-header">
          <div className="spin-icon-badge">
            <Gift size={24} />
          </div>
          <h2>Lucky Spin & Win</h2>
          <p>Spin the luxury wheel to unlock exclusive discounts on your order!</p>
        </div>

        {/* Wheel Container */}
        <div className="wheel-outer-wrapper">
          <div className="wheel-pointer">▼</div>
          <div
            className="wheel-circle"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            {PRIZES.map((prize, i) => {
              const angle = (360 / PRIZES.length) * i;
              return (
                <div
                  key={i}
                  className="wheel-segment"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    backgroundColor: prize.color,
                  }}
                >
                  <span className="segment-label">{prize.label}</span>
                </div>
              );
            })}
            <div className="wheel-center-hub">
              <Sparkles size={20} color="#f8fafc" />
            </div>
          </div>
        </div>

        {/* Action / Result */}
        {!wonPrize ? (
          <button
            className="spin-action-btn"
            onClick={handleSpin}
            disabled={spinning}
          >
            <Sparkles size={16} />
            <span>{spinning ? "Spinning the Wheel..." : "SPIN NOW TO WIN"}</span>
          </button>
        ) : (
          <div className="won-prize-box">
            <div className="won-tag">🎉 CONGRATULATIONS!</div>
            <div className="won-code">{wonPrize.code}</div>
            <div className="won-desc">{wonPrize.desc}</div>
            <button className="claim-coupon-btn" onClick={handleClaim}>
              {copied ? <Check size={16} /> : <ArrowRight size={16} />}
              <span>{copied ? "Coupon Applied to Cart!" : "Apply Coupon to Bag"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
