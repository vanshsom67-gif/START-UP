// Central API configuration
// Sab API calls isi file se URL aur auth header uthayenge
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * authFetch — JWT token automatically header mein lagata hai
 * Normal fetch ki jagah ye use karo protected routes ke liye
 */
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("zorex_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Token expire hone pe auto-logout
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.message?.includes("expired") || data.message?.includes("Invalid token")) {
      localStorage.removeItem("zorex_token");
      localStorage.removeItem("zorex_user");
      window.location.reload(); // Auth page pe redirect
    }
  }

  return response;
};
