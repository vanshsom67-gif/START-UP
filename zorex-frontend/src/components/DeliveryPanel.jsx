import React, { useState, useEffect } from "react";
import { RefreshCw, LogOut, Phone, MapPin, Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { API_BASE, authFetch } from "../config/api";

const STATUS_ACTIONS = [
  { status: "Shipped", label: "Mark Shipped", color: "#0284c7", bg: "#e0f2fe" },
  { status: "Out for Delivery", label: "🚚 Out for Delivery", color: "#d97706", bg: "#fef3c7" },
  { status: "Delivered", label: "✅ Mark Delivered", color: "#16a34a", bg: "#dcfce7" },
  { status: "Cancelled", label: "❌ Cancel Order", color: "#dc2626", bg: "#fee2e2" },
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
      background: "white",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
            background: isFinal ? "#f1f5f9" : order.status === "Out for Delivery" ? "#fef3c7" : "#eef2ff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0,
          }}>
            {isFinal ? (order.status === "Delivered" ? "✅" : "❌") : order.status === "Out for Delivery" ? "🚚" : "•"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>
              #{order._id?.slice(-8).toUpperCase()}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              {order.user?.name || "Guest"} • {order.items?.length || 0} items
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <span style={{
            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
            background: isFinal ? (order.status === "Delivered" ? "#dcfce7" : "#fee2e2") : "#fef3c7",
            color: isFinal ? (order.status === "Delivered" ? "#16a34a" : "#dc2626") : "#d97706",
          }}>
            {order.status}
          </span>
          <strong style={{ fontSize: "14px", color: "#1e293b" }}>₹{order.total?.toLocaleString()}</strong>
          {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px" }}>
          {/* Customer Info */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
            padding: "14px", background: "#f8fafc", borderRadius: "10px", marginBottom: "16px",
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Customer</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{order.user?.name || "Guest"}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{order.customerEmail}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Contact</div>
              {order.user?.phone ? (
                <a
                  href={`tel:${order.user.phone}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "13px", color: "#6366f1", fontWeight: "600", textDecoration: "none",
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
            display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 14px",
            background: "#f8fafc", borderRadius: "10px", marginBottom: "16px",
          }}>
            <MapPin size={16} style={{ color: "#6366f1", flexShrink: 0, marginTop: "1px" }} />
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", marginBottom: "3px" }}>Shipping Address</div>
              <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{order.shippingAddress || "Via WhatsApp"}</div>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>Order Items</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: i < order.items.length - 1 ? "1px solid #f1f5f9" : "none",
              }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{item.name}</span>
                  <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px" }}>×{item.quantity}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Payment Info */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 14px", borderRadius: "10px",
            background: !order.isPaid && order.paymentMethod === "COD" ? "#fef3c7" : "#dcfce7",
            marginBottom: "16px",
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>Payment</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>
                {order.paymentMethod} • <span style={{ color: order.isPaid ? "#16a34a" : "#d97706" }}>{order.isPaid ? "Paid" : "Collect ₹" + order.total?.toLocaleString()}</span>
              </div>
            </div>
            {!order.isPaid && order.paymentMethod === "COD" && (
              <div style={{
                padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                background: "#d97706", color: "white",
              }}>
                COLLECT CASH
              </div>
            )}
          </div>

          {/* Tracking Logs */}
          {order.trackingLogs?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>Tracking History</div>
              {order.trackingLogs.map((log, i) => (
                <div key={i} style={{
                  display: "flex", gap: "10px", paddingLeft: "4px", marginBottom: "6px",
                }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", marginTop: "5px", flexShrink: 0,
                    background: i === order.trackingLogs.length - 1 ? "#6366f1" : "#cbd5e1",
                  }} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>{log.status}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {log.message} • {new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status Update Actions */}
          {!isFinal && (
            <div>
              {!showActions ? (
                <button
                  onClick={() => setShowActions(true)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px",
                    background: "#6366f1", color: "white", fontWeight: "700",
                    fontSize: "13px", border: "none", cursor: "pointer",
                  }}
                >
                  🔄 Update Delivery Status
                </button>
              ) : (
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px" }}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Optional comment (e.g., Arrived at local hub, Customer not available...)"
                    rows={2}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0",
                      fontSize: "13px", resize: "vertical", marginBottom: "10px", outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {STATUS_ACTIONS.filter((a) => {
                      // Only show relevant next statuses
                      if (order.status === "Confirmed") return ["Shipped", "Cancelled"].includes(a.status);
                      if (order.status === "Shipped") return ["Out for Delivery", "Cancelled"].includes(a.status);
                      if (order.status === "Out for Delivery") return ["Delivered", "Cancelled"].includes(a.status);
                      return true;
                    }).map((action) => (
                      <button
                        key={action.status}
                        onClick={() => handleUpdate(action.status)}
                        disabled={updating}
                        style={{
                          padding: "8px 14px", borderRadius: "8px", fontSize: "12px",
                          fontWeight: "700", border: "none", cursor: "pointer",
                          background: action.bg, color: action.color,
                          opacity: updating ? 0.5 : 1,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setShowActions(false); setMessage(""); }}
                      style={{
                        padding: "8px 14px", borderRadius: "8px", fontSize: "12px",
                        fontWeight: "600", border: "1px solid #e2e8f0", background: "white",
                        color: "#64748b", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
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
  const [tab, setTab] = useState("active"); // active | completed

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
      minHeight: "100vh", background: "#f1f5f9",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "16px 20px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #ec4899)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "800",
              }}>🚚</div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>Delivery Portal</div>
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
                background: "white", color: "#64748b", border: "1px solid #e2e8f0",
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
                background: "#fee2e2", color: "#dc2626", border: "none",
                cursor: "pointer", fontWeight: "600",
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ maxWidth: "800px", margin: "20px auto 0", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#6366f1" }}>{activeOrders.length}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>ACTIVE</div>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#16a34a" }}>{completedOrders.filter((o) => o.status === "Delivered").length}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>DELIVERED</div>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>{orders.length}</div>
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
              background: tab === "active" ? "#6366f1" : "white",
              color: tab === "active" ? "white" : "#64748b",
              boxShadow: tab === "active" ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
            }}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
              border: "none", cursor: "pointer",
              background: tab === "completed" ? "#6366f1" : "white",
              color: tab === "completed" ? "white" : "#64748b",
              boxShadow: tab === "completed" ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
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
            textAlign: "center", padding: "3rem", background: "white",
            borderRadius: "12px", border: "1px solid #e2e8f0",
          }}>
            <Truck size={48} style={{ color: "#e2e8f0", marginBottom: "12px" }} />
            <h3 style={{ color: "#94a3b8", fontWeight: "600", fontSize: "16px" }}>
              {tab === "active" ? "No active deliveries" : "No completed deliveries yet"}
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "4px" }}>
              {tab === "active" ? "Orders assigned to you will appear here." : "Delivered orders will be listed here."}
            </p>
          </div>
        ) : (
          displayOrders.map((order) => (
            <DeliveryOrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
          ))
        )}

        <div style={{ height: "40px" }} />
      </div>
    </div>
  );
}
