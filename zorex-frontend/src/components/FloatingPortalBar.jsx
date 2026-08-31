import React from "react";
import { ShoppingBag, Link as LinkIcon, ShieldCheck, Server, Truck, Sparkles } from "lucide-react";

export default function FloatingPortalBar({ 
  currentView, 
  onSelectView, 
  onOpenBackendMonitor, 
  user 
}) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="floating-portal-bar">
      <div className="portal-bar-pill">
        {/* Brand Badge */}
        <div className="portal-brand-tag" title="Zorexa Single Link Portal">
          <Sparkles size={14} className="text-amber-400" />
          <span>ZOREXA PORTAL</span>
        </div>

        <div className="portal-divider"></div>

        {/* 1. Shop Storefront */}
        <button 
          className={`portal-nav-btn ${currentView === "home" ? "active" : ""}`}
          onClick={() => onSelectView("home")}
          title="Customer Shop Storefront"
        >
          <ShoppingBag size={17} />
          <span>Shop</span>
        </button>

        {/* 2. Bio Link / Link Hub */}
        <button 
          className={`portal-nav-btn ${currentView === "biolink" ? "active" : ""}`}
          onClick={() => onSelectView("biolink")}
          title="Single Bio Link Hub"
        >
          <LinkIcon size={17} />
          <span>Bio Link</span>
        </button>

        {/* 3. Admin Panel */}
        {isAdmin && (
          <button 
            className={`portal-nav-btn ${currentView === "admin" ? "active" : ""}`}
            onClick={() => onSelectView("admin")}
            title="Admin Control Dashboard"
          >
            <ShieldCheck size={17} />
            <span>Admin</span>
          </button>
        )}

        {/* 4. Backend API Inspector */}
        <button 
          className="portal-nav-btn monitor-btn"
          onClick={onOpenBackendMonitor}
          title="Backend API & Health Inspector"
        >
          <Server size={17} />
          <span>Backend API</span>
          <span className="live-dot-pulse"></span>
        </button>
      </div>
    </div>
  );
}
