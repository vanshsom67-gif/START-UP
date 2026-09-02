import React, { useState, useEffect } from "react";
import { RefreshCw, LogOut, Phone, MapPin, Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { API_BASE, authFetch, getImageUrl } from "../config/api";

const STATUS_ACTIONS = [
  { status: "Shipped", label: "Mark Shipped", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" },
  { status: "Out for Delivery", label: "🚚 Out for Delivery", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)" },
  { status: "Delivered", label: "✅ Mark Delivered", color: "#34d399", bg: "rgba(52, 211, 153, 0.15)" },
  { status: "Cancelled", label: "❌ Cancel Order", color: "#f87171", bg: "rgba(248, 113, 113, 0.15)" },
];

function DeliveryOrderCard({ order, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [showActions, setShowActions] = useState(false);

  const handleUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await authFetch(`${API_BASE}/api/orders/${order._id}/delivery-status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, message: message.trim() || undefined }),
      });
      if (res.ok) {
        setMessage("");
        setShowActions(false);
        onStatusUpdate();
      } else {
        const data = await res.json();
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Network error");
    }
    setUpdating(false);
  };

  const isFinal = order.status === "Delivered" || order.status === "Cancelled";

  return (
    <div style={{
      background: "rgba(18, 18, 24, 0.85)",
      borderRadius: "14px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      overflow: "hidden",
      marginBottom: "16px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          cursor: "pointer",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px",
            background: isFinal ? "rgba(255, 255, 255, 0.05)" : order.status === "Out for Delivery" ? "rgba(245, 158, 11, 0.15)" : "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0,
          }}>
            {isFinal ? (order.status === "Delivered" ? "✅" : "❌") : order.status === "Out for Delivery" ? "🚚" : "📦"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#f8fafc" }}>
              #{order._id?.slice(-8).toUpperCase()}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              {order.user?.name || "Customer"} • {order.items?.length || 0} items
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <span style={{
            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
            background: isFinal ? (order.status === "Delivered" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)") : "rgba(245, 158, 11, 0.15)",
            color: isFinal ? (order.status === "Delivered" ? "#34d399" : "#f87171") : "#fbbf24",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}>
            {order.status}
          </span>
          <strong style={{ fontSize: "14px", color: "#f8fafc" }}>₹{order.total?.toLocaleString()}</strong>
          {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", padding: "20px" }}>
          {/* Customer Info */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
            padding: "14px", background: "rgba(0, 0, 0, 0.3)", borderRadius: "10px", marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Customer</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>{order.user?.name || "Customer"}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{order.customerEmail}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Contact</div>
              {order.user?.phone ? (
                <a
                  href={`tel:${order.user.phone}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "13px", color: "#818cf8", fontWeight: "600", textDecoration: "none",
                  }}
                >
                  <Phone size={13} /> {order.user.phone}
                </a>
              ) : (
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>—</span>
              )}
            </div>
          </div>

          {/* Address */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px",
            background: "rgba(0, 0, 0, 0.3)", borderRadius: "10px", marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}>
            <MapPin size={16} style={{ color: "#818cf8", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", marginBottom: "3px" }}>Shipping Address</div>
              <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>{order.shippingAddress || "Via WhatsApp Direct"}</div>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>Order Items</div>
            {order.items?.map((item, i) => {
              const img = getImageUrl(item.image, item.category);
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={img}
                      alt={item.name}
                      style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80";
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>{item.name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {!isFinal && (
            <div>
              {!showActions ? (
                <button
                  onClick={() => setShowActions(true)}
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px", fontSize: "13px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white",
                    border: "none", cursor: "pointer", fontWeight: "700",
                  }}
                >
                  Update Delivery Status
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Status note (e.g. Handed to customer at door)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      padding: "8px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "12px", outline: "none",
                    }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {STATUS_ACTIONS.map((action) => (
                      <button
                        key={action.status}
                        onClick={() => handleUpdate(action.status)}
                        disabled={updating}
                        style={{
                          padding: "8px 10px", borderRadius: "8px", fontSize: "12px",
                          fontWeight: "700", border: `1px solid ${action.color}40`,
                          background: action.bg, color: action.color, cursor: "pointer",
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowActions(false)}
                    style={{
                      padding: "6px", background: "transparent", border: "none",
                      color: "#94a3b8", fontSize: "12px", cursor: "pointer", marginTop: "4px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveryPanel({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/orders/assigned`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const activeOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => ["Delivered", "Cancelled"].includes(o.status));
  const displayOrders = tab === "active" ? activeOrders : completedOrders;

  return (
    <div style={{
      minHeight: "100vh", background: "#0b0c10",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#f8fafc", paddingBottom: "60px",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(18, 18, 24, 0.95)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "16px 20px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #ec4899)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "800",
              }}>🚚</div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>Delivery Portal</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{user?.name} • {user?.email}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={fetchOrders}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 12px", borderRadius: "8px", fontSize: "12px",
                background: "rgba(255, 255, 255, 0.05)", color: "#cbd5e1", border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer", fontWeight: "600",
              }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={onLogout}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 12px", borderRadius: "8px", fontSize: "12px",
                background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)",
                cursor: "pointer", fontWeight: "600",
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ maxWidth: "800px", margin: "24px auto 0", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(18, 18, 24, 0.85)", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#818cf8" }}>{activeOrders.length}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>ACTIVE</div>
          </div>
          <div style={{ background: "rgba(18, 18, 24, 0.85)", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#34d399" }}>{completedOrders.filter((o) => o.status === "Delivered").length}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>DELIVERED</div>
          </div>
          <div style={{ background: "rgba(18, 18, 24, 0.85)", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc" }}>{orders.length}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>TOTAL</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => setTab("active")}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
              border: "none", cursor: "pointer",
              background: tab === "active" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(18, 18, 24, 0.85)",
              color: tab === "active" ? "white" : "#94a3b8",
              boxShadow: tab === "active" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
            }}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
              border: "none", cursor: "pointer",
              background: tab === "completed" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(18, 18, 24, 0.85)",
              color: tab === "completed" ? "white" : "#94a3b8",
              boxShadow: tab === "completed" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
            }}
          >
            ✅ Completed ({completedOrders.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading deliveries...</div>
        ) : displayOrders.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "3rem", background: "rgba(18, 18, 24, 0.85)",
            borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)",
          }}>
            <Truck size={48} style={{ color: "#475569", marginBottom: "12px" }} />
            <h3 style={{ color: "#f8fafc", fontWeight: "600", fontSize: "16px" }}>
              {tab === "active" ? "No active deliveries" : "No completed deliveries yet"}
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
              {tab === "active" ? "Orders assigned to you will appear here." : "Delivered orders will be listed here."}
            </p>
          </div>
        ) : (
          displayOrders.map((order) => (
            <DeliveryOrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
          ))
        )}
      </div>
    </div>
  );
}
