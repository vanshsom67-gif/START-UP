import React, { useState } from "react";
import { ShoppingCart, Search, User, ChevronDown, Menu, X, LayoutDashboard, Heart, Package, LogOut, ShieldAlert, Link as LinkIcon, Server } from "lucide-react";

export default function Navbar({
  user,
  cartCount,
  wishlistCount,
  onLogout,
  onCartClick,
  onWishlistClick,
  searchQuery,
  onSearchChange,
  onProfileClick,
  onOrdersClick,
  onAdminClick,
  isAdmin,
  onHomeClick,
  onBioLinkClick,
  onBackendMonitorClick,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onHomeClick) onHomeClick();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="main-navbar">
      {/* LEFT: Logo + Search */}
      <div className="nav-left">
        <div className="logo-container" onClick={handleLogoClick}>
          <div className="logo-text">
            <span className="logo-main">ZOREXA</span>
            <span className="logo-subtext">
              PREMIUM LABEL
            </span>
          </div>
        </div>

        {user && (
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search luxury streetwear, ethnic & accessories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="search-clear-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Desktop Actions */}
      {user && (
        <div className="nav-actions">
          {/* Admin Panel */}
          {isAdmin && (
            <button onClick={onAdminClick} className="admin-panel-btn">
              <LayoutDashboard size={15} />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Wishlist */}
          <button className="nav-action-btn nav-wishlist-btn" onClick={onWishlistClick} title="Wishlist">
            <Heart size={19} />
            <span className="nav-btn-label">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="wishlist-badge">{wishlistCount}</span>
            )}
          </button>

          {/* Cart */}
          <button className="nav-action-btn nav-cart-btn" onClick={onCartClick} title="Shopping Cart">
            <ShoppingCart size={19} />
            <span className="nav-btn-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* User Dropdown */}
          <div className="dropdown">
            <button className="dropbtn" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="user-avatar-pill">
                <User size={15} />
              </div>
              <span className="user-name">{(user.name || user.email).split(/[@\s]/)[0]}</span>
              {isAdmin && <span className="crown-badge" title="Administrator"><ShieldAlert size={14} /></span>}
              <ChevronDown size={14} className={`chevron ${showDropdown ? "open" : ""}`} />
            </button>

            {showDropdown && (
              <div className="dropdown-content">
                <div className="dropdown-header">
                  <span className="dropdown-user-title">{user.name || user.email}</span>
                  <span className="dropdown-user-role">{isAdmin ? "Admin Account" : "Zorexa Member"}</span>
                </div>
                <div className="dropdown-divider" />
                {isAdmin && (
                  <a onClick={() => { onAdminClick(); setShowDropdown(false); }} className="admin-link">
                    <LayoutDashboard size={15} /> Admin Dashboard
                  </a>
                )}
                <a onClick={() => { onProfileClick(); setShowDropdown(false); }}>
                  <User size={15} /> My Profile
                </a>
                <a onClick={() => { onOrdersClick(); setShowDropdown(false); }}>
                  <Package size={15} /> My Orders
                </a>
                <a onClick={() => { onWishlistClick(); setShowDropdown(false); }}>
                  <Heart size={15} /> Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
                </a>
                {onBioLinkClick && (
                  <a onClick={() => { onBioLinkClick(); setShowDropdown(false); }}>
                    <LinkIcon size={15} /> Bio Link Hub
                  </a>
                )}
                {onBackendMonitorClick && (
                  <a onClick={() => { onBackendMonitorClick(); setShowDropdown(false); }}>
                    <Server size={15} /> Backend API Status
                  </a>
                )}
                <div className="dropdown-divider" />
                <a onClick={() => { onLogout(); setShowDropdown(false); }} className="logout-item">
                  <LogOut size={15} /> Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hamburger (Mobile) */}
      {user && (
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="mobile-menu" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-inner" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-search-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <div className="mobile-user-greeting">
              <span>Hi, <strong>{user.name || user.email.split("@")[0]}</strong></span>
              {isAdmin && <span className="admin-tag-mobile"><ShieldAlert size={12} /> Admin</span>}
            </div>

            {isAdmin && (
              <button className="mobile-menu-item" onClick={() => { onAdminClick(); setMobileMenuOpen(false); }}>
                <LayoutDashboard size={16} /> <span>Admin Panel</span>
              </button>
            )}

            <button className="mobile-menu-item" onClick={() => { onWishlistClick(); setMobileMenuOpen(false); }}>
              <Heart size={16} /> <span>Wishlist</span>
              {wishlistCount > 0 && <span className="cart-badge-mobile">{wishlistCount}</span>}
            </button>

            <button className="mobile-menu-item" onClick={() => { onCartClick(); setMobileMenuOpen(false); }}>
              <ShoppingCart size={16} /> <span>My Cart</span>
              {cartCount > 0 && <span className="cart-badge-mobile">{cartCount}</span>}
            </button>

            <button className="mobile-menu-item" onClick={() => { onProfileClick(); setMobileMenuOpen(false); }}>
              <User size={16} /> <span>My Profile</span>
            </button>

            <button className="mobile-menu-item" onClick={() => { onOrdersClick(); setMobileMenuOpen(false); }}>
              <Package size={16} /> <span>My Orders</span>
            </button>

            <button className="mobile-menu-item danger-item" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
              <LogOut size={16} /> <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

