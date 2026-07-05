import React, { useState } from "react";
import { ShoppingCart, LogOut, Search, User, ChevronDown } from "lucide-react";

export default function Navbar({ user, cartCount, onLogout, onCartClick, searchQuery, onSearchChange, onProfileClick, onOrdersClick }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav>
      <div className="nav-left" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div 
          className="logo-container" 
          onClick={() => window.location.reload()} 
          style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
        >
          <span className="logo-main" style={{ color: "white", fontSize: "20px", fontStyle: "italic", fontWeight: "700", lineHeight: "1" }}>
            Zorexa
          </span>
          <span className="logo-subtext">
            Explore <span style={{ color: "#ec4899" }}>Plus</span> <span style={{ color: "#ec4899", fontSize: "10px" }}>★</span>
          </span>
        </div>

        {user && (
          <div className="search-wrapper" style={{ width: "350px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {user && (
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button className="secondary" onClick={onCartClick} style={{ position: "relative" }}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "#ec4899",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  lineHeight: "1",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          <div 
            className="dropdown" 
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            style={{ position: "relative" }}
          >
            <button 
              className="dropbtn" 
              style={{ 
                background: "transparent", 
                color: "white", 
                border: "none", 
                display: "flex", 
                alignItems: "center", 
                gap: "4px", 
                cursor: "pointer", 
                fontWeight: "600", 
                fontSize: "15px",
                padding: "8px 10px"
              }}
            >
              <User size={16} />
              <span>Hi, {user.email.split("@")[0]}</span>
              <ChevronDown size={14} />
            </button>
            {showDropdown && (
              <div 
                className="dropdown-content" 
                style={{ 
                  display: "block",
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  backgroundColor: "white",
                  minWidth: "150px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  borderRadius: "2px",
                  border: "1px solid #f0f0f0",
                  zIndex: 1000
                }}
              >
                <a 
                  onClick={onProfileClick}
                  style={{ 
                    color: "#212121", 
                    padding: "10px 15px", 
                    textDecoration: "none", 
                    display: "block", 
                    fontSize: "14px", 
                    cursor: "pointer",
                    borderBottom: "1px solid #f9f9f9"
                  }}
                >
                  👤 My Profile
                </a>
                <a 
                  onClick={onOrdersClick}
                  style={{ 
                    color: "#212121", 
                    padding: "10px 15px", 
                    textDecoration: "none", 
                    display: "block", 
                    fontSize: "14px", 
                    cursor: "pointer",
                    borderBottom: "1px solid #f9f9f9"
                  }}
                >
                  📦 Orders
                </a>
                <a 
                  onClick={onLogout}
                  style={{ 
                    color: "#212121", 
                    padding: "10px 15px", 
                    textDecoration: "none", 
                    display: "block", 
                    fontSize: "14px", 
                    cursor: "pointer"
                  }}
                >
                  🚪 Logout
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
