import React from "react";
import { ShoppingBag, Link as LinkIcon, ShieldCheck, Server, Sparkles, Gift } from "lucide-react";

export default function FloatingPortalBar({ 
  currentView, 
  onSelectView, 
  onOpenBackendMonitor, 
  onOpenSpinWheel,
  user 
}) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="floating-portal-bar">
      <div className="portal-bar-pill">
        {/* Brand Badge */}
        <div className="portal-brand-tag" title="Zorexa Single Link Portal">
          <Sparkles size={14} className="text-amber-400" />
          <span>ZOREXA</span>
        </div>

        <div className="portal-divider"></div>

        {/* 1. Shop Storefront */}
        <button 
          className={`portal-nav-btn ${currentView === "home" ? "active" : ""}`}
          onClick={() => onSelectView("home")}
          title="Customer Shop Storefront"
        >
          <ShoppingBag size={16} />
          <span>Shop</span>
        </button>

        {/* 2. Lucky Spin & Win */}
        {onOpenSpinWheel && (
          <button 
            className="portal-nav-btn spin-pill-btn"
            onClick={onOpenSpinWheel}
            title="Spin the Wheel to Win Discount Codes"
          >
            <Gift size={16} color="#ec4899" />
            <span style={{ color: "#f472b6", fontWeight: "700" }}>Spin & Win</span>
          </button>
        )}

        {/* 3. Bio Link */}
        <button 
          className={`portal-nav-btn ${currentView === "biolink" ? "active" : ""}`}
          onClick={() => onSelectView("biolink")}
          title="Single Bio Link Hub"
        >
          <LinkIcon size={16} />
          <span>Bio Link</span>
        </button>

        {/* 4. Admin Panel */}
        {isAdmin && (
          <button 
            className={`portal-nav-btn ${currentView === "admin" ? "active" : ""}`}
            onClick={() => onSelectView("admin")}
            title="Admin Control Dashboard"
          >
            <ShieldCheck size={16} />
            <span>Admin</span>
          </button>
        )}

        {/* 5. Backend API Inspector */}
        <button 
          className="portal-nav-btn monitor-btn"
          onClick={onOpenBackendMonitor}
          title="Backend API & Health Inspector"
        >
          <Server size={16} />
          <span>API</span>
          <span className="live-dot-pulse"></span>
        </button>
      </div>
    </div>
  );
}
