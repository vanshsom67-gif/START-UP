import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, RefreshCw, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { API_BASE, authFetch } from "../config/api";

const STATUS_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];

const STATUS_COLOR = {
  Placed: { bg: "#dbeafe", color: "#2563eb", icon: "📋" },
  Confirmed: { bg: "#fef3c7", color: "#d97706", icon: "✅" },
  Shipped: { bg: "#e0f2fe", color: "#0284c7", icon: "🚚" },
  Delivered: { bg: "#dcfce7", color: "#16a34a", icon: "🎉" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626", icon: "❌" },
};

function OrderTimeline({ status }) {
  if (status === "Cancelled") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", padding: "8px 12px", background: "#fee2e2", borderRadius: "8px" }}>
        <span>❌</span>
        <span style={{ fontSize: "13px", color: "#dc2626", fontWeight: "600" }}>Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="order-timeline">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s}>
            <div className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
              <div className="timeline-dot">
                {done ? "✓" : i + 1}
              </div>
              <span className="timeline-label">{s}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`timeline-line ${i < currentIdx ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_COLOR[order.status] || STATUS_COLOR.Placed;

  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const handleViewInvoice = (order) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) {
      alert("Please allow popups to view the invoice.");
      return;
    }

    const itemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
            <strong>${item.name}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center;">
            x${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: 600;">
            ₹${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const subtotal = order.subtotal || order.total;
    const discountHTML = order.discount > 0 
      ? `<tr>
          <td colspan="2" style="padding: 8px 12px; text-align: right; color: #64748b; font-size: 13px;">Coupon Discount:</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 600; color: #16a34a; font-size: 13px;">-₹${order.discount.toLocaleString()}</td>
         </tr>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - Zorexa Fashion</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; background: #f8fafc; padding: 40px; margin: 0; }
          .container { background: white; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px; }
          .brand h1 { margin: 0; font-size: 28px; background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
          .brand p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0; font-size: 20px; color: #6366f1; }
          .invoice-details p { margin: 4px 0; font-size: 13px; color: #64748b; }
          .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
          .section-col h3 { font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.5px; }
          .section-col p { margin: 0; font-size: 14px; line-height: 1.5; color: #334155; }
          .table-items { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          .table-items th { background: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; }
          .table-items td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .summary { float: right; width: 300px; margin-bottom: 40px; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table td { padding: 6px 12px; font-size: 14px; }
          .summary-table tr.total td { border-top: 1px solid #e2e8f0; font-weight: 700; font-size: 16px; color: #6366f1; padding-top: 12px; }
          .footer { clear: both; border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center; color: #94a3b8; font-size: 12px; }
          @media print {
            body { background: white; padding: 0; }
            .container { border: none; box-shadow: none; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">🖨️ Print Invoice</button>
          </div>
          <div class="header">
            <div class="brand">
              <h1>Zorexa Fashion</h1>
              <p>Style Unleashed</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Order ID:</strong> #${order._id.toUpperCase()}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div class="section-grid">
            <div class="section-col">
              <h3>Billed To</h3>
              <p><strong>${order.user?.name || "Zorexa Customer"}</strong></p>
              <p>Email: ${order.customerEmail || "—"}</p>
            </div>
            <div class="section-col">
              <h3>Shipping Address</h3>
              <p>${order.shippingAddress || "Via WhatsApp Contact"}</p>
            </div>
          </div>

          <table class="table-items">
            <thead>
              <tr>
                <th style="width: 60%;">Item Description</th>
                <th style="text-align: center; width: 15%;">Quantity</th>
                <th style="text-align: right; width: 25%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <table class="summary-table">
              <tr>
                <td colspan="2" style="text-align: right; color: #64748b;">Subtotal:</td>
                <td style="text-align: right; font-weight: 600;">₹${subtotal.toLocaleString()}</td>
              </tr>
              ${discountHTML}
              <tr>
                <td colspan="2" style="text-align: right; color: #64748b;">Delivery Charges:</td>
                <td style="text-align: right; font-weight: 600; color: #16a34a;">FREE</td>
              </tr>
              <tr class="total">
                <td colspan="2" style="text-align: right;">Grand Total:</td>
                <td style="text-align: right;">₹${order.total.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for shopping with us! If you have any questions, contact support@zorexa.com or via WhatsApp at +91 8791910659.</p>
            <p>© 2026 Zorexa Fashion. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-card-left">
          <div className="order-status-icon">{statusInfo.icon}</div>
          <div>
            <div className="order-id">
              Order #{order._id?.slice(-8).toUpperCase() || "XXXXXXXX"}
            </div>
            <div className="order-date">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </div>
          </div>
        </div>

        <div className="order-card-right">
          <span
            className="order-status-badge"
            style={{ background: statusInfo.bg, color: statusInfo.color }}
          >
            {order.status}
          </span>
          <strong className="order-total">₹{order.total?.toLocaleString()}</strong>
          <button className="order-expand-btn">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Preview items (always visible) */}
      <div className="order-items-preview">
        {order.items?.slice(0, expanded ? order.items.length : 2).map((item, i) => {
          const img = item.image?.startsWith("http") ? item.image : `${API_BASE}${item.image}`;
          return (
            <div key={i} className="order-item-row">
              <img src={img} alt={item.name} className="order-item-img"
                onError={(e) => { e.target.style.display = "none"; }} />
              <div className="order-item-info">
                <p className="order-item-name">{item.name}</p>
                <p className="order-item-meta">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
              </div>
              <p className="order-item-total">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          );
        })}
        {!expanded && order.items?.length > 2 && (
          <p style={{ fontSize: "12px", color: "#6366f1", cursor: "pointer", marginTop: "4px" }}
            onClick={() => setExpanded(true)}>
            +{order.items.length - 2} more items
          </p>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="order-expanded">
          {/* Timeline */}
          <OrderTimeline status={order.status} />

          {/* Price breakdown */}
          <div className="order-price-breakdown">
            <div className="order-price-row">
              <span>Subtotal</span>
              <span>₹{(order.subtotal || order.total)?.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="order-price-row">
                <span>Coupon discount</span>
                <span style={{ color: "#10b981" }}>-₹{order.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="order-price-row">
              <span>Delivery</span>
              <span style={{ color: "#10b981" }}>FREE</span>
            </div>
            <div className="order-price-row total">
              <strong>Total</strong>
              <strong>₹{order.total?.toLocaleString()}</strong>
            </div>
          </div>

          {/* Delivery info */}
          <div className="order-delivery-info" style={{ position: "relative", minHeight: "100px" }}>
            <div style={{ paddingRight: "100px" }}>
              <p>
                <strong>📍 Address:</strong>{" "}
                {typeof order.shippingAddress === "string"
                  ? order.shippingAddress
                  : "Via WhatsApp"}
              </p>
              <p style={{ marginTop: "4px" }}>
                <strong>💳 Payment:</strong> {order.paymentMethod || "WhatsApp"} •{" "}
                <span style={{ color: order.isPaid ? "#16a34a" : "#d97706", fontWeight: "600" }}>
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </p>
              {order.courierName && (
                <p style={{ marginTop: "4px" }}>
                  <strong>🚚 Courier:</strong> {order.courierName}{" "}
                  {order.trackingId && <span>(Tracking ID: {order.trackingId})</span>}
                </p>
              )}
              {order.deliveryPartner && (
                <p style={{ marginTop: "4px" }}>
                  <strong>👤 Delivery Partner:</strong> {order.deliveryPartner.name}{" "}
                  {order.deliveryPartner.phone && <span>(📞 <a href={`tel:${order.deliveryPartner.phone}`} style={{ color: "#6366f1", textDecoration: "none", fontWeight: "600" }}>{order.deliveryPartner.phone}</a>)</span>}
                </p>
              )}
              {order.estimatedDeliveryDate ? (
                <p style={{ marginTop: "4px" }}>
                  <strong>📅 Estimated Delivery:</strong>{" "}
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              ) : (
                order.status !== "Delivered" && order.status !== "Cancelled" && (
                  <p style={{ marginTop: "4px" }}>
                    <strong>📅 Expected Delivery:</strong>{" "}
                    {deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleViewInvoice(order); }}
              style={{
                position: "absolute",
                right: "12px",
                bottom: "12px",
                background: "white",
                color: "#6366f1",
                border: "1px solid #c7d2fe",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              📄 Invoice
            </button>
          </div>

          {/* Tracking History Logs */}
          {order.trackingLogs && order.trackingLogs.length > 0 && (
            <div style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              background: "white",
              borderRadius: "10px",
              padding: "16px",
              border: "1px solid #e2e8f0"
            }}>
              <h4 style={{ fontSize: "12px", color: "#475569", textTransform: "uppercase", marginBottom: "12px", fontWeight: "700" }}>
                📍 Detailed Tracking History
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {order.trackingLogs.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%",
                        background: i === order.trackingLogs.length - 1 ? "#6366f1" : "#cbd5e1",
                        marginTop: "5px",
                        boxShadow: i === order.trackingLogs.length - 1 ? "0 0 0 4px rgba(99,102,241,0.2)" : "none"
                      }} />
                      {i < order.trackingLogs.length - 1 && (
                        <div style={{ width: "2px", flexGrow: 1, background: "#e2e8f0", marginTop: "4px" }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: "4px", flex: 1 }}>
                      <div style={{ fontWeight: "700", color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{log.status}</span>
                        <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "400" }}>
                          {new Date(log.timestamp).toLocaleString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div style={{ color: "#475569", marginTop: "2px", fontSize: "12px" }}>{log.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage({ user, onBack, onShopNow }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/orders/mine`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        setError("Could not load orders.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filterOptions = ["All", ...Object.keys(STATUS_COLOR)];
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <button className="pd-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            {orders.length} orders total
          </p>
        </div>
        <button
          className="orders-refresh-btn"
          onClick={fetchOrders}
          style={{ marginLeft: "auto", background: "white", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", cursor: "pointer" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-tabs">
        {filterOptions.map((f) => (
          <button
            key={f}
            className={`orders-filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f !== "All" && orders.filter((o) => o.status === f).length > 0 && (
              <span className="orders-filter-count">
                {orders.filter((o) => o.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="orders-error">
          <p>{error}</p>
          <button onClick={fetchOrders}>Retry</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <Package size={64} style={{ color: "#e2e8f0" }} />
          <h3>
            {filter === "All" ? "No orders yet!" : `No ${filter} orders`}
          </h3>
          <p>
            {filter === "All"
              ? "Start shopping and your orders will appear here."
              : `You don't have any ${filter.toLowerCase()} orders.`}
          </p>
          <button onClick={onShopNow} style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart size={16} />
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
