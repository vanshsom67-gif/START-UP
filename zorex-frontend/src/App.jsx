import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Auth from "./components/Auth";
import AdminPanel from "./components/AdminPanel";
import FilterSidebar from "./components/FilterSidebar";
import ProductDetail from "./components/ProductDetail";
import WishlistPage from "./components/WishlistPage";
import CheckoutPage from "./components/CheckoutPage";
import OrdersPage from "./components/OrdersPage";
import DeliveryPanel from "./components/DeliveryPanel";
import BioLinkPage from "./components/BioLinkPage";
import BackendMonitor from "./components/BackendMonitor";
import FloatingPortalBar from "./components/FloatingPortalBar";
import Toast, { useToast } from "./components/Toast";
import SpinWheelModal from "./components/SpinWheelModal";
import CartDrawer from "./components/CartDrawer";
import ProfileModal from "./components/ProfileModal";
import { API_BASE, authFetch, getImageUrl } from "./config/api";
import { SlidersHorizontal } from "lucide-react";

const DEFAULT_FILTERS = {
  category: "All",
  sort: "newest",
  minPrice: 0,
  maxPrice: 5000,
  minRating: 0,
};

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

  // Wishlist: array of product IDs
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("zorex_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Recently Viewed: array of product IDs
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem("zorex_recently_viewed");
    return saved ? JSON.parse(saved) : [];
  });

  // View-based routing
  // 'home' | 'product' | 'wishlist' | 'checkout' | 'orders' | 'admin'
  const [view, setView] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Toast notifications
  const { toasts, addToast, removeToast } = useToast();

  // Profile and Footer modals
  const [activeModalTab, setActiveModalTab] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [spinWheelOpen, setSpinWheelOpen] = useState(false);
  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [backendMonitorOpen, setBackendMonitorOpen] = useState(false);

  // ── Persist state ─────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("zorex_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("zorex_wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem("zorex_recently_viewed", JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  // ── Fetch Products ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Products load nahi ho paye. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchProducts(); }, [user, fetchProducts]);

  // ── Auth ──────────────────────────────────────────────────────────────
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("zorex_user", JSON.stringify(userData));
    setView("home");
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setView("home");
    setActiveModalTab(null);
    localStorage.removeItem("zorex_user");
    localStorage.removeItem("zorex_token");
    localStorage.removeItem("zorex_cart");
  };

  // ── Wishlist ──────────────────────────────────────────────────────────
  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        addToast("Removed from Wishlist", "wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        addToast("Added to Wishlist ❤️", "wishlist");
        return [...prev, productId];
      }
    });
  };

  // ── Cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const productId = product._id || product.id;
      const size = product.selectedSize || "";
      const color = product.selectedColor || "";
      const cartItemId = `${productId}-${size}-${color}`;

      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        addToast(`${product.name} quantity updated in cart`, "cart");
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      addToast(`${product.name} added to cart 🛒`, "cart");
      return [...prev, { ...product, cartItemId, quantity: product.quantity || 1 }];
    });
    setCartDrawerOpen(true);
  };

  const handleRemoveFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => (item.cartItemId || item._id || item.id) !== cartItemId));
    addToast("Item removed from cart", "error");
  };

  const handleUpdateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) { handleRemoveFromCart(cartItemId); return; }
    setCart((prev) =>
      prev.map((item) =>
        (item.cartItemId || item._id || item.id) === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleClearCart = () => setCart([]);

  // ── Buy Now → WhatsApp ────────────────────────────────────────────────
  const handleBuyNow = async (product) => {
    const WHATSAPP_NUMBER = "8791910659";
    const qty = product.quantity || 1;
    const originalPrice = product.originalPrice || Math.round(product.price * 1.8);
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
    const size = product.selectedSize ? ` (Size: ${product.selectedSize})` : "";
    const message = `🆕 *ZOREXA FASHION - BUY NOW* 🆕\n\n*Product:* ${product.name}${size}\n*Qty:* ${qty}\n*Deal Price:* ₹${(product.price * qty).toLocaleString()} (_${discount}% off_)\n*MRP:* ₹${(originalPrice * qty).toLocaleString()}\n*Delivery:* FREE (Z-Assured)\n\nThank you!`;

    try {
      await authFetch(`${API_BASE}/api/orders`, {
        method: "POST",
        body: JSON.stringify({
          items: [{ productId: product._id || null, name: product.name, price: product.price, image: product.image, quantity: qty }],
          subtotal: product.price * qty,
          discount: 0,
          couponCode: "",
          total: product.price * qty,
          paymentMethod: "WhatsApp",
        }),
      });
    } catch (e) { console.error(e); }

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // ── Order Placed (from Checkout) ──────────────────────────────────────
  const handleOrderPlaced = async ({ items, address, total, subtotal, discount, couponCode, paymentMethod }) => {
    try {
      const res = await authFetch(`${API_BASE}/api/orders`, {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item._id || null,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            size: item.selectedSize || "",
            color: item.selectedColor || "",
          })),
          subtotal,
          discount,
          couponCode,
          total,
          paymentMethod: paymentMethod === "whatsapp" ? "WhatsApp" : paymentMethod === "cod" ? "COD" : "UPI",
          shippingAddress: `${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart([]);
        return data;
      } else {
        throw new Error(data.message || "Order placement failed");
      }
    } catch (e) {
      console.error("Order save failed:", e);
      throw e;
    }
  };

  // ── Navigation helpers ────────────────────────────────────────────────
  const goHome = () => { setView("home"); setSelectedProduct(null); };
  const goToProduct = (product) => {
    const pid = product._id || product.id;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter(id => id !== pid);
      return [pid, ...filtered].slice(0, 10); // Keep last 10
    });
    setSelectedProduct(product);
    setView("product");
    window.scrollTo({ top: 0 });
  };

  const handleScrollToProducts = () => {
    if (view !== "home") { setView("home"); setTimeout(() => document.getElementById("products-catalog")?.scrollIntoView({ behavior: "smooth" }), 100); }
    else document.getElementById("products-catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Filter & Sort Products ────────────────────────────────────────────
  const filteredProducts = products
    .filter((p) => p.isActive !== false)
    .filter((p) => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filters.category === "All" || p.category === filters.category;
      const matchPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
      const matchRating = (p.rating || 4.2) >= filters.minRating;
      return matchSearch && matchCat && matchPrice && matchRating;
    })
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.price - b.price;
      if (filters.sort === "price_desc") return b.price - a.price;
      if (filters.sort === "rating") return (b.rating || 4.2) - (a.rating || 4.2);
      if (filters.sort === "reviews") return (b.ratingCount || 120) - (a.ratingCount || 120);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const cartCount = cart.reduce((s, item) => s + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";

  const CATEGORIES = [
    { label: "All Catalog", value: "All", icon: "✨" },
    { label: "Gym & Supplements", value: "Gym & Supplements", icon: "🏋️‍♂️" },
    { label: "Men's Clothing", value: "Men's Clothing", icon: "👕" },
    { label: "Women's Clothing", value: "Women's Clothing", icon: "👗" },
    { label: "Accessories", value: "Accessories", icon: "👜" },
    { label: "Footwear", value: "Footwear", icon: "👟" },
  ];

  // Shared Navbar props
  const navbarProps = {
    user, cartCount, wishlistCount, isAdmin,
    searchQuery, onSearchChange: setSearchQuery,
    onLogout: handleLogout,
    onCartClick: () => setCartDrawerOpen(true),
    onWishlistClick: () => setView("wishlist"),
    onProfileClick: () => setProfileModalOpen(true),
    onOrdersClick: () => setView("orders"),
    onAdminClick: () => setView("admin"),
    onHomeClick: goHome,
    onBioLinkClick: () => setView("biolink"),
    onBackendMonitorClick: () => setBackendMonitorOpen(true),
  };

  const handleApplyCouponFromSpin = (code) => {
    localStorage.setItem("won_coupon", code);
    addToast(`🎉 Coupon "${code}" unlocked & applied to cart!`, "success");
  };

  // ── NOT LOGGED IN ─────────────────────────────────────────────────────
  if (!user) return <Auth onLoginSuccess={handleLoginSuccess} />;

  // ── DELIVERY PANEL ────────────────────────────────────────────────────
  if (isDelivery) {
    return <DeliveryPanel user={user} onLogout={handleLogout} />;
  }

  const sharedModals = (
    <>
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onGoToCheckout={() => {
          setCartDrawerOpen(false);
          setView("checkout");
        }}
        onClearCart={handleClearCart}
        onOpenSpinWheel={() => {
          setCartDrawerOpen(false);
          setSpinWheelOpen(true);
        }}
      />

      <SpinWheelModal
        isOpen={spinWheelOpen}
        onClose={() => setSpinWheelOpen(false)}
        onApplyCoupon={handleApplyCouponFromSpin}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          localStorage.setItem("zorex_user", JSON.stringify(updated));
        }}
        onLogout={handleLogout}
        onGoToOrders={() => {
          setProfileModalOpen(false);
          setView("orders");
        }}
      />

      <FloatingPortalBar
        currentView={view}
        onSelectView={setView}
        onOpenBackendMonitor={() => setBackendMonitorOpen(true)}
        onOpenSpinWheel={() => setSpinWheelOpen(true)}
        user={user}
      />

      {backendMonitorOpen && <BackendMonitor onClose={() => setBackendMonitorOpen(false)} />}
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );

  // ── ADMIN PANEL ───────────────────────────────────────────────────────
  if (view === "admin" && isAdmin) {
    return (
      <>
        <Navbar {...navbarProps} />
        <AdminPanel user={user} onProductsChange={fetchProducts} onBack={goHome} />
        {sharedModals}
      </>
    );
  }

  // ── BIO LINK PAGE ─────────────────────────────────────────────────────
  if (view === "biolink") {
    return (
      <>
        <Navbar {...navbarProps} />
        <BioLinkPage
          user={user}
          onGoHome={goHome}
          onGoAdmin={() => setView("admin")}
          onGoOrders={() => setView("orders")}
          onOpenBackendMonitor={() => setBackendMonitorOpen(true)}
        />
        {sharedModals}
      </>
    );
  }

  // ── PRODUCT DETAIL ────────────────────────────────────────────────────
  if (view === "product" && selectedProduct) {
    const related = products.filter(
      (p) => p.category === selectedProduct.category &&
        (p._id || p.id) !== (selectedProduct._id || selectedProduct.id) &&
        p.isActive !== false
    );
    return (
      <>
        <Navbar {...navbarProps} />
        <ProductDetail
          product={selectedProduct}
          onBack={goHome}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isWishlisted={wishlist.includes(selectedProduct._id || selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          relatedProducts={related}
          onRelatedClick={goToProduct}
        />
        {sharedModals}
      </>
    );
  }

  // ── WISHLIST PAGE ─────────────────────────────────────────────────────
  if (view === "wishlist") {
    return (
      <>
        <Navbar {...navbarProps} />
        <WishlistPage
          wishlist={wishlist}
          products={products}
          onBack={goHome}
          onRemoveFromWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onProductClick={goToProduct}
        />
        {sharedModals}
      </>
    );
  }

  // ── CHECKOUT PAGE ─────────────────────────────────────────────────────
  if (view === "checkout") {
    return (
      <>
        <Navbar {...navbarProps} />
        <CheckoutPage
          cart={cart}
          user={user}
          onBack={goHome}
          onOrderPlaced={handleOrderPlaced}
        />
        {sharedModals}
      </>
    );
  }

  // ── ORDERS PAGE ───────────────────────────────────────────────────────
  if (view === "orders") {
    return (
      <>
        <Navbar {...navbarProps} />
        <OrdersPage
          user={user}
          onBack={goHome}
          onShopNow={goHome}
        />
        {sharedModals}
      </>
    );
  }

  // ── HOME / MAIN STORE ─────────────────────────────────────────────────
  return (
    <div className="app-container">
      <Navbar {...navbarProps} />

      {/* Categories Strip */}
      <div className="categories-strip">
        <div className="categories-container">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              className={`category-item ${filters.category === cat.value ? "active" : ""}`}
              onClick={() => { setFilters((f) => ({ ...f, category: cat.value })); handleScrollToProducts(); }}
            >
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Hero
        onShopNowClick={handleScrollToProducts}
        onCategoryClick={(catVal) => { setFilters((f) => ({ ...f, category: catVal })); handleScrollToProducts(); }}
      />

      <main style={{ paddingBottom: "4rem" }}>
        {/* Deal of the Day Strip */}
        <div className="horizontal-strip-container">
          <div className="strip-header">
            <div>
              <h3 className="section-title">Curated Trending Deals ⚡</h3>
              <p className="section-subtitle">Handpicked luxury streetwear & fashion essentials at exclusive prices</p>
            </div>
            <button className="view-all-btn" onClick={() => { setFilters(DEFAULT_FILTERS); handleScrollToProducts(); }}>View All Catalog</button>
          </div>
          <div className="strip-scroll">
            {products
              .filter(p => p.isActive !== false)
              .sort((a, b) => b.price - a.price)
              .slice(0, 8)
              .map(p => (
                <div key={p._id || p.id} className="strip-card" onClick={() => goToProduct(p)}>
                  <div className="strip-img">
                    <img
                      src={getImageUrl(p.image, p.category)}
                      alt={p.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <span className="strip-discount">
                      {Math.round(((p.originalPrice || p.price * 1.8) - p.price) / (p.originalPrice || p.price * 1.8) * 100)}% OFF
                    </span>
                  </div>
                  <div className="strip-info">
                    <h4>{p.name}</h4>
                    <p className="strip-price">₹{p.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recently Viewed Strip */}
        {recentlyViewed.length > 0 && (
          <div className="horizontal-strip-container" style={{ marginTop: "2rem" }}>
            <div className="strip-header">
              <div>
                <h3 className="section-title">Recently Viewed 🕰️</h3>
                <p className="section-subtitle">Continue exploring items you checked out</p>
              </div>
            </div>
            <div className="strip-scroll">
              {recentlyViewed
                .map(id => products.find(p => (p._id || p.id) === id))
                .filter(Boolean)
                .map(p => (
                  <div key={p._id || p.id} className="strip-card" onClick={() => goToProduct(p)}>
                    <div className="strip-img">
                      <img
                        src={getImageUrl(p.image, p.category)}
                        alt={p.name}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                    </div>
                    <div className="strip-info">
                      <h4>{p.name}</h4>
                      <p className="strip-price">₹{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Products toolbar */}
        <div className="products-toolbar" id="products-catalog">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              {filters.category === "All" ? "Featured Collection" : `${filters.category}`}
              {searchQuery && <span style={{ fontSize: "1rem", color: "#a1a1aa", fontWeight: "400" }}> — Searching "{searchQuery}"</span>}
            </h2>
            <p className="section-subtitle" style={{ margin: "2px 0 0 0" }}>Explore signature pieces tailored for your unique style</p>
          </div>

          <div className="products-toolbar-right">
            <span className="products-count">{filteredProducts.length} Products</span>
            <button
              className="filter-toggle-btn"
              onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {Object.values(filters).join("") !== Object.values(DEFAULT_FILTERS).join("") && (
                <span className="filter-active-dot" />
              )}
            </button>
          </div>
        </div>

        <div className="products-with-filter">
          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={filterSidebarOpen}
            onClose={() => setFilterSidebarOpen(false)}
            filters={filters}
            onFiltersChange={setFilters}
            productCount={filteredProducts.length}
          />

          <div className="products-main-area">
            {/* Error */}
            {error && (
              <div className="error-banner">
                <p>Unable to load products. Please ensure backend server is connected.</p>
                <button className="retry-btn" onClick={fetchProducts}>Retry Connection</button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="loading-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="product-card-skeleton">
                    <div className="skeleton-img" />
                    <div className="skeleton-line long" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line medium" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="empty-catalog-state">
                <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#000" }}>ZOREXA</div>
                <h3>No Products Found</h3>
                <p>Try adjusting your search criteria or price range filter</p>
                <button className="clear-filters-btn" onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }}>
                  Reset Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="products-container">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onCardClick={goToProduct}
                    isWishlisted={wishlist.includes(product._id || product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TRUST BADGES SECTION */}
        <section className="trust-features-section">
          <div className="trust-features-grid">
            <div className="trust-card">
              <div className="trust-icon">🚚</div>
              <h4>Express Global Shipping</h4>
              <p>Fast doorstep delivery with real-time order tracking</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🛡️</div>
              <h4>100% Authentic Apparel</h4>
              <p>Curated premium quality fabrics & original designs</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔄</div>
              <h4>Hassle-Free Returns</h4>
              <p>Simple 7-day exchange policy for guaranteed satisfaction</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">💬</div>
              <h4>24/7 Priority Support</h4>
              <p>Instant assistance via WhatsApp & dedicated care</p>
            </div>
          </div>
        </section>

        {/* Cart Drawer / Bar */}
        <Cart
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={(items, total, discount, coupon) => {
            const WHATSAPP_NUMBER = "8791910659";
            const finalTotal = total - discount;
            let msg = "🆕 *ZOREXA FASHION ORDER* 🆕\n\n";
            items.forEach((item, i) => { msg += `*${i + 1}.* ${item.name} (x${item.quantity}) — ₹${(item.price * item.quantity).toLocaleString()}\n`; });
            if (coupon) msg += `\nCoupon: ${coupon} (-₹${discount.toLocaleString()})\n`;
            msg += `\n*Total:* ₹${finalTotal.toLocaleString()}\n*Delivery:* FREE`;
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
          }}
          onUpdateQuantity={handleUpdateQuantity}
          onGoToCheckout={() => { if (cart.length > 0) setView("checkout"); }}
        />
      </main>

      {/* Profile Modal */}
      {activeModalTab && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModalTab(null); }}
        >
          <div className="glass-modal-card">
            <button onClick={() => setActiveModalTab(null)} className="modal-close-btn">&times;</button>
            <h2 className="modal-title">My Profile</h2>
            <div className="modal-info-box">
              <p><strong>Name:</strong> {user.name || "Zorexa Member"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
              <p><strong>Status:</strong>{" "}
                <span className={`status-pill ${isAdmin ? "admin" : "member"}`}>
                  {isAdmin ? "Administrator" : "Zorexa Member"}
                </span>
              </p>
            </div>
            <button className="primary-modal-btn" onClick={() => { setActiveModalTab(null); setView("orders"); }}>
              View Order History
            </button>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {aboutUsOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setAboutUsOpen(false); }}
        >
          <div className="glass-modal-card">
            <button onClick={() => setAboutUsOpen(false)} className="modal-close-btn">&times;</button>
            <h2 className="modal-title">About Zorexa Fashion</h2>
            <p className="modal-description">
              <strong>ZOREXA</strong> is built for style connoisseurs. We are dedicated to bringing high-street couture, premium streetwear, and traditional craftsmanship directly to your wardrobe.
            </p>
            
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--primary)" }}>Founders & Visionaries</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Founder 1 */}
              <div className="founder-card">
                <div className="founder-avatar">VS</div>
                <div>
                  <strong className="founder-name">Vansh Soam</strong>
                  <span className="founder-role">CEO & Lead Developer</span>
                  <a href="https://www.instagram.com/vansh_soam__akkhepur" target="_blank" rel="noopener noreferrer" className="founder-social">📸 Instagram →</a>
                </div>
              </div>
              
              {/* Founder 2 */}
              <div className="founder-card">
                <div className="founder-avatar">UG</div>
                <div>
                  <strong className="founder-name">Utsav Garg</strong>
                  <span className="founder-role">Co-founder & Creative Director</span>
                  <a href="https://www.instagram.com/utsavgargg_" target="_blank" rel="noopener noreferrer" className="founder-social">📸 Instagram →</a>
                </div>
              </div>
            </div>
            
            <button className="primary-modal-btn" onClick={() => setAboutUsOpen(false)}>
              Explore Zorexa
            </button>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {contactUsOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setContactUsOpen(false); }}
        >
          <div className="glass-modal-card">
            <button onClick={() => setContactUsOpen(false)} className="modal-close-btn">&times;</button>
            <h2 className="modal-title">Customer Concierge</h2>
            <div className="contact-details-list">
              <p>📍 <strong>HQ Address:</strong> Zorexa Fashion Studio, Uttar Pradesh, India</p>
              <p>📞 <strong>WhatsApp Support:</strong> +91 8791910659</p>
              <p>✉️ <strong>Direct Email:</strong> support@zorexa.com</p>
              <p>⏰ <strong>Working Hours:</strong> Mon - Sat (10:00 AM - 7:00 PM IST)</p>
            </div>
            <button className="primary-modal-btn" onClick={() => setContactUsOpen(false)}>
              Close Concierge
            </button>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="footer-logo">ZOREXA</div>
            <p className="footer-brand-text">Haute Fashion & Premium Streetwear crafted for modern style enthusiasts.</p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a onClick={() => setContactUsOpen(true)} style={{ cursor: "pointer" }}>Contact Concierge</a></li>
              <li><a onClick={() => setAboutUsOpen(true)} style={{ cursor: "pointer" }}>About Zorexa</a></li>
              <li><a href="#products-catalog">New Arrivals</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li><a href="#">Payment Options</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Exchange</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Security Assurance</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Founders</h4>
            <ul>
              <li><a href="https://www.instagram.com/vansh_soam__akkhepur" target="_blank" rel="noopener noreferrer">📸 Vansh Soam</a></li>
              <li><a href="https://www.instagram.com/utsavgargg_" target="_blank" rel="noopener noreferrer">📸 Utsav Garg</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Zorexa Fashion. All rights reserved.</p>
          <p>Crafted with precision by <a href="https://www.instagram.com/vansh_soam__akkhepur" target="_blank" rel="noopener noreferrer">@vansh</a> & <a href="https://www.instagram.com/utsavgargg_" target="_blank" rel="noopener noreferrer">@utsav</a></p>
        </div>
      </footer>

      {sharedModals}
    </div>
  );
}

