import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, ShoppingCart, Heart, AlertCircle, X } from "lucide-react";

let toastId = 0;

export default function Toast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "cart": return <ShoppingCart size={18} />;
      case "wishlist": return <Heart size={18} />;
      case "error": return <AlertCircle size={18} />;
      default: return <CheckCircle size={18} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "cart": return { bg: "#1e293b", icon: "#ff9f00", border: "#ff9f00" };
      case "wishlist": return { bg: "#1e293b", icon: "#ec4899", border: "#ec4899" };
      case "error": return { bg: "#1e293b", icon: "#ef4444", border: "#ef4444" };
      default: return { bg: "#1e293b", icon: "#10b981", border: "#10b981" };
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column-reverse",
      gap: "8px",
      pointerEvents: "none",
    }}>
      {toasts.map((toast) => {
        const colors = getColor(toast.type);
        return (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: colors.bg,
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              borderLeft: `4px solid ${colors.border}`,
              animation: "toastSlideUp 0.3s ease-out",
              pointerEvents: "auto",
              minWidth: "280px",
              maxWidth: "420px",
            }}
          >
            <span style={{ color: colors.icon, flexShrink: 0 }}>{getIcon(toast.type)}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                boxShadow: "none",
                transform: "none",
                textTransform: "none",
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Hook for toast management
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // max 3 at a time
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
