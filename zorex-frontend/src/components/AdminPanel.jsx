import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Plus, Pencil, Trash2, Check, X, RefreshCw, ChevronDown, ArrowLeft
} from "lucide-react";
import { API_BASE, authFetch } from "../config/api";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "products", label: "Products", icon: "👕" },
  { id: "orders", label: "Orders", icon: "" },
  { id: "users", label: "Users", icon: "👥" },
];

const STATUS_OPTIONS = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const CATEGORIES = ["Gym & Supplements", "Men's Clothing", "Women's Clothing", "Accessories", "Footwear"];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, productsRes, usersRes] = await Promise.all([
          authFetch(`${API_BASE}/api/orders/stats/summary`),
          fetch(`${API_BASE}/api/products`),
          authFetch(`${API_BASE}/api/auth/users`),
        ]);

        if (statsRes.ok) {
          const d = await statsRes.json();
          setStats(d.stats);
        }
        if (productsRes.ok) {
          const d = await productsRes.json();
          setProductCount(d.length);
        }
        if (usersRes.ok) {
          const d = await usersRes.json();
          setUserCount(d.count);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: "#94a3b8" }}>Loading dashboard...</div>;

  const statCards = [
    { label: "Total Products", value: productCount, icon: "👕", color: "#6366f1" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: "", color: "#ec4899" },
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: "💰", color: "#10b981" },
    { label: "Pending Orders", value: stats?.pendingOrders || 0, icon: "⏳", color: "#f59e0b" },
    { label: "Delivered", value: stats?.deliveredOrders || 0, icon: "✅", color: "#22c55e" },
    { label: "Registered Users", value: userCount, icon: "👥", color: "#8b5cf6" },
  ];

  return (
    <div>
      <h2 className="admin-section-title">📊 Dashboard Overview</h2>
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "#1e293b" }}>🚀 Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ padding: "12px 16px", background: "#eef2ff", borderRadius: "8px", fontSize: "13px", color: "#6366f1", fontWeight: "600" }}>
            Admin: <strong>admin@zorexa.com</strong> / admin123
          </div>
          <div style={{ padding: "12px 16px", background: "#fdf4ff", borderRadius: "8px", fontSize: "13px", color: "#9333ea", fontWeight: "600" }}>
            Backend API: <strong>http://localhost:5000</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab({ onProductsChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const emptyForm = { name: "", price: "", originalPrice: "", image: "", galleryImages: "", category: "Men's Clothing", description: "", stock: "100", rating: "4.2" };
  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState([]);
  const [vSize, setVSize] = useState("");
  const [vColor, setVColor] = useState("");
  const [vStock, setVStock] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddVariant = () => {
    if (!vSize.trim()) {
      alert("Size is required to add a variant!");
      return;
    }
    const newVariant = {
      size: vSize.trim().toUpperCase(),
      color: vColor.trim(),
      stock: Number(vStock) || 0
    };
    const duplicate = variants.find(
      (v) =>
        v.size === newVariant.size &&
        v.color.toLowerCase() === newVariant.color.toLowerCase()
    );
    if (duplicate) {
      alert("This Size & Color combination already exists!");
      return;
    }
    setVariants([...variants, newVariant]);
    setVSize("");
    setVColor("");
    setVStock("");
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const computedStock = variants.length > 0
      ? variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
      : Number(form.stock) || 100;

    const extraImages = form.galleryImages
      ? form.galleryImages.split(",").map((img) => img.trim()).filter(Boolean)
      : [];
    const mainImg = form.image || "/images/placeholder.jpg";

    const body = {
      name: form.name.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      image: mainImg,
      images: [mainImg, ...extraImages],
      category: form.category,
      description: form.description,
      stock: computedStock,
      rating: Number(form.rating) || 4.2,
      variants,
    };

    try {
      let res;
      if (editingId) {
        res = await authFetch(`${API_BASE}/api/products/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        res = await authFetch(`${API_BASE}/api/products`, { method: "POST", body: JSON.stringify(body) });
      }

      const data = await res.json();
      if (res.ok) {
        showMsg(editingId ? "Product updated!" : "Product added!");
        setForm(emptyForm);
        setVariants([]);
        setEditingId(null);
        setShowForm(false);
        loadProducts();
        if (onProductsChange) onProductsChange();
      } else {
        showMsg(data.message || "Error", "error");
      }
    } catch (err) {
      showMsg("Request failed", "error");
    }
  };

  const handleEdit = (product) => {
    const galleryString = product.images && product.images.length > 1
      ? product.images.slice(1).join(", ")
      : "";

    setForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || "",
      image: product.image || "",
      galleryImages: galleryString,
      category: product.category,
      description: product.description || "",
      stock: product.stock || 100,
      rating: product.rating || 4.2,
    });
    setVariants(product.variants || []);
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" delete karna chahte ho?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("Product deleted!");
        loadProducts();
        if (onProductsChange) onProductsChange();
      } else {
        showMsg("Delete failed", "error");
      }
    } catch (err) {
      showMsg("Request failed", "error");
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const res = await authFetch(`${API_BASE}/api/products/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        showMsg(`Product ${product.isActive ? "hidden" : "shown"}!`);
        loadProducts();
      }
    } catch (err) { showMsg("Request failed", "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>👕 Products Management</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={loadProducts} style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", textTransform: "none" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} style={{ background: "#6366f1", color: "white", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", textTransform: "none" }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: "10px 16px", marginBottom: "1rem", borderRadius: "6px", fontSize: "14px", fontWeight: "500", background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#dc2626" : "#16a34a" }}>
          {msg.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="admin-form-card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem", color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", boxShadow: "none", textTransform: "none" }}>
              <X size={18} />
            </button>
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div>
                <label>Product Name *</label>
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Hoodie For Men" required />
              </div>
              <div>
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleFormChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Sale Price (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handleFormChange} placeholder="799" required min="1" />
              </div>
              <div>
                <label>MRP / Original Price (₹)</label>
                <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleFormChange} placeholder="1499 (optional)" />
              </div>
              <div>
                <label>Stock Quantity</label>
                <input type="number" name="stock" value={form.stock} onChange={handleFormChange} placeholder="100" />
              </div>
              <div>
                <label>Rating (0-5)</label>
                <input type="number" step="0.1" name="rating" value={form.rating} onChange={handleFormChange} placeholder="4.2" min="0" max="5" />
              </div>
            </div>
            <div>
              <label>Image Path / URL *</label>
              <input name="image" value={form.image} onChange={handleFormChange} placeholder="/images/hoodie.jpg  ya  https://..." required />
            </div>
            <div>
              <label>Additional Gallery Images (Comma separated URLs / paths)</label>
              <input name="galleryImages" value={form.galleryImages} onChange={handleFormChange} placeholder="/images/hoodie_back.jpg, /images/hoodie_side.jpg" />
            </div>
            <div>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Product description..." style={{ resize: "vertical" }} />
            </div>

            {/* Variants Manager */}
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              marginTop: "12px"
            }}>
              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "10px", marginTop: 0 }}>
                🛠️ Manage Product Variants (Sizes & Colors)
              </h4>
              
              {/* Variant creation inputs */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "12px" }}>
                <div style={{ flex: 1, minWidth: "80px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>Size *</label>
                  <input
                    type="text"
                    value={vSize}
                    onChange={(e) => setVSize(e.target.value)}
                    placeholder="e.g. M, L, XL"
                    style={{ margin: 0, padding: "8px" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "100px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>Color (Optional)</label>
                  <input
                    type="text"
                    value={vColor}
                    onChange={(e) => setVColor(e.target.value)}
                    placeholder="e.g. Black, White"
                    style={{ margin: 0, padding: "8px" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "80px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>Variant Qty</label>
                  <input
                    type="number"
                    value={vStock}
                    onChange={(e) => setVStock(e.target.value)}
                    placeholder="10"
                    min="0"
                    style={{ margin: 0, padding: "8px" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  style={{
                    background: "#6366f1", color: "white", padding: "10px 16px",
                    borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                    border: "none", cursor: "pointer", height: "38px"
                  }}
                >
                  + Add Variant
                </button>
              </div>

              {/* Added Variants List */}
              {variants.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  {variants.map((v, index) => (
                    <div
                      key={index}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "white", border: "1px solid #cbd5e1", borderRadius: "20px",
                        padding: "4px 12px", fontSize: "12px", fontWeight: "600", color: "#334155"
                      }}
                    >
                      <span>Size: {v.size} {v.color && `• Color: ${v.color}`} (Qty: {v.stock})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        style={{
                          background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                          padding: 0, fontSize: "14px", fontWeight: "700", display: "inline-flex",
                          boxShadow: "none", transform: "none"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                  No variants added yet. Overall stock quantity input above will be used.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" style={{ background: "#6366f1", color: "white", padding: "10px 24px", borderRadius: "6px", textTransform: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={14} /> {editingId ? "Update Product" : "Add Product"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: "6px", textTransform: "none" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading products...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imgSrc = product.image?.startsWith("http") ? product.image : `${API_BASE}${product.image}`;
                return (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={imgSrc} alt={product.name} style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", background: "#f8fafc", border: "1px solid #e2e8f0" }} />
                        <span style={{ fontWeight: "500", fontSize: "13px" }}>{product.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>{product.category}</td>
                    <td style={{ fontWeight: "600" }}>₹{product.price?.toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>⭐ {product.rating}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(product)}
                        style={{ padding: "3px 10px", fontSize: "11px", fontWeight: "600", borderRadius: "20px", textTransform: "none", background: product.isActive ? "#dcfce7" : "#fee2e2", color: product.isActive ? "#16a34a" : "#dc2626", border: "none", boxShadow: "none", cursor: "pointer" }}
                      >
                        {product.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleEdit(product)} style={{ background: "#eef2ff", color: "#6366f1", border: "none", padding: "6px 10px", borderRadius: "6px", textTransform: "none", boxShadow: "none", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(product._id, product.name)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", textTransform: "none", boxShadow: "none", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Koi product nahi hai. Pehle Add Product karo!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [assignModalOrder, setAssignModalOrder] = useState(null);
  
  const [selectedPartner, setSelectedPartner] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [savingAssign, setSavingAssign] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchDeliveryPartners = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/auth/delivery-partners`);
      if (res.ok) {
        const data = await res.json();
        setDeliveryPartners(data.deliveryPartners || []);
      }
    } catch (e) {
      console.error("Failed to fetch delivery partners", e);
    }
  };

  useEffect(() => {
    loadOrders();
    fetchDeliveryPartners();
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await authFetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showMsg(`Order status → ${newStatus}`);
        loadOrders();
      } else {
        showMsg("Status update failed", "error");
      }
    } catch (err) {
      showMsg("Request failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenAssignModal = (order) => {
    setAssignModalOrder(order);
    setSelectedPartner(order.deliveryPartner?._id || order.deliveryPartner || "");
    setCourierName(order.courierName || "Local Delivery Partner");
    setTrackingId(order.trackingId || `ZX-${order._id?.slice(-6).toUpperCase()}`);
    setEstimatedDeliveryDate(
      order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assignModalOrder) return;
    setSavingAssign(true);
    try {
      const res = await authFetch(`${API_BASE}/api/orders/${assignModalOrder._id}/assign-delivery`, {
        method: "PATCH",
        body: JSON.stringify({
          deliveryPartner: selectedPartner || null,
          courierName: courierName.trim(),
          trackingId: trackingId.trim(),
          estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
        }),
      });
      if (res.ok) {
        showMsg("Delivery assigned successfully");
        setAssignModalOrder(null);
        loadOrders();
      } else {
        const data = await res.json();
        showMsg(data.message || "Failed to assign delivery", "error");
      }
    } catch (err) {
      showMsg("Network error", "error");
    } finally {
      setSavingAssign(false);
    }
  };

  const getStatusClass = (status) => status?.toLowerCase() || "placed";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>Orders Management</h2>
        <button onClick={loadOrders} style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", textTransform: "none" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {msg.text && (
        <div style={{ padding: "10px 16px", marginBottom: "1rem", borderRadius: "6px", fontSize: "14px", fontWeight: "500", background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#dc2626" : "#16a34a" }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading orders...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Change Status</th>
                <th>Delivery Info</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontFamily: "monospace", fontSize: "12px" }}>#{order._id?.slice(-8).toUpperCase()}</td>
                  <td>
                    <div style={{ fontSize: "13px" }}>
                      <div style={{ fontWeight: "500" }}>{order.user?.name || "Guest"}</div>
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>{order.customerEmail}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    {order.items?.map((item, i) => (
                      <div key={i}>{item.name} × {item.quantity}</div>
                    ))}
                  </td>
                  <td style={{ fontWeight: "700" }}>₹{order.total?.toLocaleString()}</td>
                  <td>
                    <div style={{ fontSize: "12px" }}>
                      <div style={{ fontWeight: "600", color: order.paymentMethod === "COD" ? "#94a3b8" : order.paymentMethod === "WhatsApp" ? "#22c55e" : "#6366f1" }}>
                        {order.paymentMethod}
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: order.isPaid ? "#16a34a" : "#d97706" }}>
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: "12px", color: "#64748b" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(order.status)}`}>{order.status}</span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", color: "#334155", cursor: "pointer", outline: "none", background: "white" }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    {order.deliveryPartner || order.courierName ? (
                      <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.4" }}>
                        <div style={{ fontWeight: "700", color: "#1e293b" }}>{order.courierName || "Local Partner"}</div>
                        {order.deliveryPartner && (
                          <div style={{ color: "#6366f1" }}>👤 {order.deliveryPartner.name || "Assigned"}</div>
                        )}
                        <div style={{ color: "#94a3b8" }}>ID: {order.trackingId || "Local-ZX"}</div>
                        {order.estimatedDeliveryDate && (
                          <div style={{ fontSize: "10px", marginTop: "2px" }}>Est: {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                        )}
                        <button
                          onClick={() => handleOpenAssignModal(order)}
                          style={{
                            background: "none", border: "none", color: "#6366f1", padding: 0,
                            fontSize: "11px", cursor: "pointer", textDecoration: "underline",
                            marginTop: "4px", display: "block"
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignModal(order)}
                        style={{
                          padding: "5px 10px", fontSize: "11px", background: "#eef2ff",
                          color: "#6366f1", border: "none", borderRadius: "6px",
                          cursor: "pointer", fontWeight: "600"
                        }}
                      >
                        🚚 Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Koi order nahi hai abhi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Delivery Modal */}
      {assignModalOrder && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 2000, animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: "white", borderRadius: "16px", width: "90%", maxWidth: "500px",
            padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #f1f5f9", position: "relative"
          }}>
            <button
              onClick={() => setAssignModalOrder(null)}
              style={{
                position: "absolute", top: "16px", right: "16px", background: "none",
                border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b", padding: "4px"
              }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
              🚚 Assign Delivery Partner
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Order ID: <span style={{ fontFamily: "monospace", fontWeight: "600" }}>#{assignModalOrder._id.toUpperCase()}</span>
            </p>

            <form onSubmit={handleSaveAssignment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Delivery Partner
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1",
                    fontSize: "14px", background: "white", outline: "none"
                  }}
                >
                  <option value="">-- Choose Partner (Or General Courier) --</option>
                  {deliveryPartners.map((dp) => (
                    <option key={dp._id} value={dp._id}>
                      {dp.name} ({dp.phone || "No phone"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Courier / Carrier Name
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Local Delivery Partner, Delhivery, Blue Dart"
                  required
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1",
                    fontSize: "14px", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Tracking ID
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. Local-ZX, DEL-923847"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1",
                    fontSize: "14px", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1",
                    fontSize: "14px", outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setAssignModalOrder(null)}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                    background: "white", color: "#475569", fontWeight: "600", cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssign}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "8px", border: "none",
                    background: "linear-gradient(135deg, #6366f1, #ec4899)", color: "white",
                    fontWeight: "700", cursor: "pointer", fontSize: "13px",
                    boxShadow: "0 4px 10px rgba(99,102,241,0.2)", opacity: savingAssign ? 0.7 : 1
                  }}
                >
                  {savingAssign ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleRoleChange = async (user, newRole) => {
    if (user._id === currentUserId) return;
    if (!window.confirm(`${user.email} ko role '${newRole}' dena chahte ho?`)) return;

    try {
      const res = await authFetch(`${API_BASE}/api/auth/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        showMsg(`${user.email} → ${newRole}`);
        loadUsers();
      } else {
        showMsg("Role update failed", "error");
      }
    } catch (err) {
      showMsg("Request failed", "error");
    }
  };

  const handleStatusToggle = async (user) => {
    if (user._id === currentUserId) return;
    try {
      const res = await authFetch(`${API_BASE}/api/auth/users/${user._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        showMsg(`User ${user.isActive ? "deactivated" : "activated"}`);
        loadUsers();
      } else {
        showMsg("Status update failed", "error");
      }
    } catch (err) {
      showMsg("Request failed", "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>👥 Users Management</h2>
        <button onClick={loadUsers} style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", textTransform: "none" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {msg.text && (
        <div style={{ padding: "10px 16px", marginBottom: "1rem", borderRadius: "6px", fontSize: "14px", fontWeight: "500", background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#dc2626" : "#16a34a" }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading users...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ background: user._id === currentUserId ? "#fafafa" : "" }}>
                  <td style={{ fontWeight: "500" }}>
                    {user.name}
                    {user._id === currentUserId && <span style={{ marginLeft: "6px", fontSize: "10px", color: "#6366f1", fontWeight: "600" }}>YOU</span>}
                  </td>
                  <td style={{ fontSize: "13px" }}>{user.email}</td>
                  <td style={{ fontSize: "13px", color: "#64748b" }}>{user.phone || "—"}</td>
                  <td>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: user.role === "admin" ? "#eef2ff" : user.role === "delivery" ? "#fef3c7" : "#f1f5f9",
                      color: user.role === "admin" ? "#6366f1" : user.role === "delivery" ? "#d97706" : "#64748b"
                    }}>
                      {user.role === "admin" ? "Admin" : user.role === "delivery" ? "Delivery" : "User"}
                    </span>
                  </td>
                  <td>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: user.isActive ? "#dcfce7" : "#fee2e2", color: user.isActive ? "#16a34a" : "#dc2626" }}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td>
                    {user._id !== currentUserId ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          style={{
                            padding: "5px 8px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "11px",
                            color: "#334155",
                            cursor: "pointer",
                            outline: "none",
                            background: "white"
                          }}
                        >
                          <option value="user">👤 User</option>
                          <option value="delivery">🚚 Delivery</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          style={{ padding: "5px 10px", fontSize: "11px", background: user.isActive ? "#fee2e2" : "#dcfce7", color: user.isActive ? "#dc2626" : "#16a34a", border: "none", borderRadius: "6px", textTransform: "none", boxShadow: "none", fontWeight: "600", cursor: "pointer" }}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Koi user registered nahi hai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main AdminPanel Component ────────────────────────────────────────────────
export default function AdminPanel({ user, onProductsChange, onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin-page">
      {/* Top Header with Back Button */}
      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              title="Return to Main Shop"
            >
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </button>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
              🛡️ Zorexa Admin Control Panel
            </h1>
            <span style={{ fontSize: "12px", color: "#c7d2fe" }}>Manage catalog, orders & registered users</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", background: "rgba(255, 255, 255, 0.1)", color: "#e0e7ff", padding: "6px 14px", borderRadius: "20px" }}>
            👤 {user?.name || user?.email}
          </span>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "linear-gradient(135deg, #6366f1, #c026d3)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(99,102,241,0.4)"
              }}
            >
              <ArrowLeft size={15} /> Storefront
            </button>
          )}
        </div>
      </div>

      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #e2e8f0", marginBottom: "12px" }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 12px",
                  background: "linear-gradient(135deg, #eef2ff, #f3e8ff)",
                  color: "#4f46e5",
                  border: "1px solid #c7d2fe",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginBottom: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease"
                }}
              >
                <ArrowLeft size={15} /> ⬅️ Back to Store
              </button>
            )}
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>Admin Navigation</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{user?.email}</div>
          </div>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-sidebar-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "products" && <ProductsTab onProductsChange={onProductsChange} />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "users" && <UsersTab currentUserId={user?.id} />}
        </main>
      </div>
    </div>
  );
}
