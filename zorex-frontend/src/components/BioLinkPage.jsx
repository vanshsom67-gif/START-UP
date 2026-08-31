import React, { useState } from "react";
import { 
  ShoppingBag, Sparkles, MessageCircle, Truck, ShieldCheck, 
  ExternalLink, Copy, Check, 
  MapPin, Phone, Mail, ArrowRight, Share2, Layers, Server, Globe
} from "lucide-react";
import { API_BASE } from "../config/api";

export default function BioLinkPage({ 
  onGoHome, 
  onGoAdmin, 
  onGoOrders, 
  onOpenBackendMonitor, 
  user 
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const WHATSAPP_NUMBER = "8791910659";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Zorexa Fashion! I would like to inquire about your premium collection."
  )}`;

  return (
    <div className="bio-link-container">
      {/* Dynamic Background Glows */}
      <div className="bio-bg-glow glow-1"></div>
      <div className="bio-bg-glow glow-2"></div>

      <div className="bio-link-card">
        {/* Brand Header */}
        <div className="bio-header">
          <div className="bio-avatar-wrapper">
            <div className="bio-avatar">
              <span className="bio-avatar-text">Z</span>
            </div>
            <div className="bio-badge">
              <Sparkles size={12} />
            </div>
          </div>

          <h1 className="bio-title">ZOREXA FASHION</h1>
          <p className="bio-tagline">Luxurious Streetwear & Haute Couture Label</p>
          <div className="bio-status-pill">
            <span className="live-dot"></span>
            Fullstack Store + Backend API Live on 1 Link
          </div>
        </div>

        {/* Action / Share Bar */}
        <div className="bio-share-bar">
          <span className="bio-url-preview">{siteUrl}</span>
          <button className="bio-copy-btn" onClick={handleCopyLink}>
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>

        {/* Main Link Buttons Stack */}
        <div className="bio-links-stack">
          {/* 1. Explore Full Online Store */}
          <button className="bio-link-btn primary-btn" onClick={onGoHome}>
            <div className="bio-btn-icon">
              <ShoppingBag size={20} />
            </div>
            <div className="bio-btn-text">
              <span className="btn-main-title">🛍️ Shop Online Store</span>
              <span className="btn-sub-title">Browse luxury clothing, streetwear & accessories</span>
            </div>
            <ArrowRight size={18} className="bio-arrow" />
          </button>

          {/* 2. Direct WhatsApp Instant Order & Chat */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bio-link-btn whatsapp-btn"
          >
            <div className="bio-btn-icon">
              <MessageCircle size={20} />
            </div>
            <div className="bio-btn-text">
              <span className="btn-main-title">💬 Order via WhatsApp</span>
              <span className="btn-sub-title">Instant support & direct WhatsApp orders</span>
            </div>
            <ExternalLink size={18} className="bio-arrow" />
          </a>

          {/* 3. My Orders & Live Tracking */}
          <button className="bio-link-btn track-btn" onClick={onGoOrders}>
            <div className="bio-btn-icon">
              <Truck size={20} />
            </div>
            <div className="bio-btn-text">
              <span className="btn-main-title">📦 Track My Orders</span>
              <span className="btn-sub-title">Check live status & delivery updates</span>
            </div>
            <ArrowRight size={18} className="bio-arrow" />
          </button>

          {/* 4. Backend API Inspector & Server Live Dashboard */}
          <button className="bio-link-btn server-btn" onClick={onOpenBackendMonitor}>
            <div className="bio-btn-icon">
              <Server size={20} />
            </div>
            <div className="bio-btn-text">
              <span className="btn-main-title">🔌 Backend API Monitor & Health</span>
              <span className="btn-sub-title">View live database status & API test endpoints</span>
            </div>
            <ArrowRight size={18} className="bio-arrow" />
          </button>

          {/* 5. Admin Panel (If user is admin or for quick portal access) */}
          {user?.role === "admin" && (
            <button className="bio-link-btn admin-btn" onClick={onGoAdmin}>
              <div className="bio-btn-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="bio-btn-text">
                <span className="btn-main-title">👑 Admin Control Dashboard</span>
                <span className="btn-sub-title">Manage products, orders, users & sales analytics</span>
              </div>
              <ArrowRight size={18} className="bio-arrow" />
            </button>
          )}
        </div>

        {/* Feature Grid Banner */}
        <div className="bio-feature-grid">
          <div className="feature-item">
            <span className="feature-emoji">🚚</span>
            <span>Free Express Delivery</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">💎</span>
            <span>100% Original Premium</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">⚡</span>
            <span>COD Available</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="bio-socials">
          <a href="https://instagram.com/vansh_soam__akkhepur" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
        </div>

        {/* Footer info */}
        <div className="bio-footer">
          <p>© 2026 Zorexa Fashion Label • All Rights Reserved</p>
          <p className="sub">Powered by Single Unified Express + React Server</p>
        </div>
      </div>
    </div>
  );
}
