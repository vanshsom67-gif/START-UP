import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Auth from "./components/Auth";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("zorex_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("zorex_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Account Modal / Orders History states
  const [activeModalTab, setActiveModalTab] = useState(null); // 'profile' | 'orders' | null
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("zorex_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const BACKEND_URL = "http://localhost:5000";

  // Fetch products from the Express backend
  useEffect(() => {
    if (!user) return; // Only fetch if authenticated

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${BACKEND_URL}/api/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Could not load products. Please ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("zorex_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync orders to localStorage
  useEffect(() => {
    localStorage.setItem("zorex_orders", JSON.stringify(orders));
  }, [orders]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("zorex_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem("zorex_user");
    localStorage.removeItem("zorex_cart");
    setActiveModalTab(null);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const handleRemoveFromCart = (indexToRemove) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Helper to save order to state & localStorage
  const saveOrderHistory = (orderItems, orderTotal) => {
    const newOrder = {
      id: "OD" + Math.floor(10000000 + Math.random() * 90000000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: orderItems,
      total: orderTotal,
      status: "Order Placed (Z-Assured Delivery in 2 Days)"
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  const handleBuyNow = (product) => {
    const WHATSAPP_NUMBER = "8791910659";
    const originalPrice = product.originalPrice || Math.round(product.price * 1.8);
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    const message = `🆕 *ZOREXA FASHION - BUY NOW* 🆕\n\n*Product:* ${product.name}\n*Deal Price:* ₹${product.price.toLocaleString()} (_${discount}% off_)\n*MRP:* ₹${originalPrice.toLocaleString()}\n*Delivery:* FREE (Z-Assured)\n\nThank you!`;
    
    // Save order history
    saveOrderHistory([product], product.price);
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
    alert("Order placed successfully! Check your orders list in 'My Account' -> 'Orders'.");
  };

  const handleCartCheckout = (cartItems, cartTotal, couponDiscount = 0, appliedCoupon = null) => {
    const WHATSAPP_NUMBER = "8791910659";
    let message = "🆕 *ZOREXA FASHION ORDER* 🆕\n\n";
    cartItems.forEach((item, index) => {
      message += `*${index + 1}.* ${item.name}\n   Price: ₹${item.price.toLocaleString()}\n\n`;
    });
    
    const finalBill = cartTotal - couponDiscount;
    if (appliedCoupon) {
      message += `*Subtotal:* ₹${cartTotal.toLocaleString()}\n`;
      message += `*Applied Coupon:* ${appliedCoupon} (-₹${couponDiscount.toLocaleString()})\n`;
    }
    
    message += `-------------------------\n*Total Amount:* ₹${finalBill.toLocaleString()}\n*Delivery Charges:* FREE (Z-Assured)\n\nThank you for shopping on Zorexa Fashion!`;
    
    // Save order history
    saveOrderHistory([...cartItems], finalBill);
    
    // Clear Cart
    setCart([]);
    localStorage.removeItem("won_coupon");

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
    alert("Order placed successfully! Check your orders list in 'My Account' -> 'Orders'.");
  };

  const handleScrollToProducts = () => {
    const element = document.getElementById("products-catalog");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter products based on category and search query
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { label: "All Clothes", value: "All", icon: "✨" },
    { label: "Men's Clothing", value: "Men's Clothing", icon: "👕" },
    { label: "Women's Clothing", value: "Women's Clothing", icon: "👗" }
  ];

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <Navbar
        user={user}
        cartCount={cart.length}
        onLogout={handleLogout}
        onCartClick={() => {
          const cartEl = document.getElementById("cart");
          if (cartEl) cartEl.scrollIntoView({ behavior: "smooth" });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onProfileClick={() => setActiveModalTab("profile")}
        onOrdersClick={() => setActiveModalTab("orders")}
      />

      {/* CATEGORIES STRIP */}
      <div className="categories-strip" style={{ display: "flex", justifyContent: "center", gap: "30px", background: "white", padding: "12px 10px", borderBottom: "1px solid #dbdbdb" }}>
        {categories.map((cat) => (
          <div 
            key={cat.value} 
            className="category-item" 
            onClick={() => {
              setSelectedCategory(cat.value);
              handleScrollToProducts();
            }}
            style={{
              color: selectedCategory === cat.value ? "#6366f1" : "#333",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            <span style={{ fontSize: "24px", marginBottom: "4px" }}>{cat.icon}</span>
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      <Hero 
        onShopNowClick={handleScrollToProducts} 
        onCategoryClick={(catVal) => {
          setSelectedCategory(catVal);
          handleScrollToProducts();
        }}
      />

      <main style={{ paddingBottom: "4rem" }}>
        <h2 className="section-title" id="products-catalog" style={{ textAlign: "center", margin: "2rem 0", fontSize: "2rem" }}>
          {selectedCategory === "All" ? "Deals of the Day" : `${selectedCategory} Collection`}
        </h2>

        {error && (
          <div style={{ textAlign: "center", color: "#ef4444", margin: "2rem" }}>
            <p>{error}</p>
            <button style={{ marginTop: "1rem" }} onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", margin: "3rem" }}>
            <h3>Loading Premium Collection...</h3>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", margin: "3rem" }}>
            <h3>No products match your criteria.</h3>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem", maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}

        <Cart
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={handleCartCheckout}
        />
      </main>

      {/* ACCOUNT DETAILS MODAL */}
      {activeModalTab && (
        <div className="modal-overlay" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", zIndex: 2000 }}>
          <div className="modal-content" style={{ background: "white", padding: "25px", borderRadius: "4px", width: "90%", maxWidth: "600px", position: "relative" }}>
            <button className="close-btn" onClick={() => setActiveModalTab(null)} style={{ position: "absolute", top: "12px", right: "15px", background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#878787" }}>
              &times;
            </button>
            <h2 style={{ marginBottom: "20px", borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>
              {activeModalTab === "profile" ? "My Profile" : "My Orders"}
            </h2>
            
            {activeModalTab === "profile" && (
              <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "4px", border: "1px solid #f0f0f0" }}>
                <p style={{ marginBottom: "12px", fontSize: "15px" }}><strong>Email ID:</strong> <span style={{ color: "#555" }}>{user.email}</span></p>
                <p style={{ marginBottom: "12px", fontSize: "15px" }}><strong>Phone Number:</strong> <span style={{ color: "#555" }}>{user.phone || "Not Provided"}</span></p>
                <p style={{ marginBottom: "12px", fontSize: "15px" }}><strong>Account Type:</strong> <span style={{ background: "#ec4899", color: "#ffffff", padding: "2px 6px", borderRadius: "3px", fontWeight: "bold", fontSize: "12px" }}>Zorexa Plus Member</span></p>
                <p style={{ fontSize: "15px" }}><strong>Location:</strong> India</p>
              </div>
            )}

            {activeModalTab === "orders" && (
              <div style={{ maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
                {orders.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#878787" }}>
                    <h3>No Orders Placed Yet!</h3>
                    <p style={{ marginTop: "8px" }}>Start shopping and checkout to see your purchases here.</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="order-history-card" style={{ border: "1px solid #f0f0f0", borderRadius: "4px", padding: "15px", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div className="order-history-header" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "#878787", borderBottom: "1px solid #f9f9f9", paddingBottom: "8px", marginBottom: "10px" }}>
                        <span>Order ID: {order.id}</span>
                        <span>Placed On: {order.date}</span>
                      </div>
                      
                      {order.items.map((item, idx) => {
                        const BACKEND_URL = "http://localhost:5000";
                        const imageUrl = item.image.startsWith("http") ? item.image : `${BACKEND_URL}${item.image}`;
                        return (
                          <div key={idx} className="order-history-item" style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "10px" }}>
                            <img src={imageUrl} alt={item.name} style={{ width: "50px", height: "50px", objectContain: "contain" }} />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: "14px" }}>{item.name}</p>
                              <p style={{ color: "#878787", fontSize: "12px" }}>Price: ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="order-status-tag" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                          {order.status}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: "15px" }}>Total: ₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="footer" style={{ background: "#0f172a", color: "white", padding: "40px 10%", fontSize: "14px", marginTop: "40px", borderTop: "1px solid var(--border)" }}>
        <div className="footer-container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "30px", borderBottom: "1px solid #454d5e", paddingBottom: "40px", marginBottom: "20px" }}>
          <div className="footer-col" style={{ flex: 1, minWidth: "150px" }}>
            <h4 style={{ color: "#878787", textTransform: "uppercase", fontSize: "12px", marginBottom: "15px", fontWeight: 600 }}>About</h4>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Contact Us</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>About Us</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Careers</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Zorexa Stories</a></li>
            </ul>
          </div>
          <div className="footer-col" style={{ flex: 1, minWidth: "150px" }}>
            <h4 style={{ color: "#878787", textTransform: "uppercase", fontSize: "12px", marginBottom: "15px", fontWeight: 600 }}>Help</h4>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Payments</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Shipping</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Cancellation & Returns</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col" style={{ flex: 1, minWidth: "150px" }}>
            <h4 style={{ color: "#878787", textTransform: "uppercase", fontSize: "12px", marginBottom: "15px", fontWeight: 600 }}>Consumer Policy</h4>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Cancellation & Returns</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Terms Of Use</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Security</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Privacy</a></li>
            </ul>
          </div>
          <div className="footer-col" style={{ flex: 1, minWidth: "150px" }}>
            <h4 style={{ color: "#878787", textTransform: "uppercase", fontSize: "12px", marginBottom: "15px", fontWeight: 600 }}>Social</h4>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "10px" }}><a href="https://www.instagram.com/vansh_soam__akkhepur" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>Instagram (@vansh_soam_akkhepur)</a></li>
              <li style={{ marginBottom: "10px" }}><a href="https://www.instagram.com/utsavgargg_" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>Instagram (@utsavgargg_)</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Facebook</a></li>
              <li style={{ marginBottom: "10px" }}><a href="#" style={{ color: "white", textDecoration: "none" }}>Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", color: "#dbdbdb", fontSize: "13px" }}>
          <p>© 2026 Zorexa Fashion. All rights reserved.</p>
          <p>
            Made with ❤️ by 
            <a href="https://www.instagram.com/vansh_soam__akkhepur" target="_blank" rel="noopener noreferrer" style={{ color: "#ec4899", textDecoration: "none", fontWeight: "bold", marginLeft: "4px" }}>
              @vansh_soam_akkhepur
            </a> 
            and 
            <a href="https://www.instagram.com/utsavgargg_" target="_blank" rel="noopener noreferrer" style={{ color: "#ec4899", textDecoration: "none", fontWeight: "bold", marginLeft: "4px" }}>
              @utsavgargg_
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
