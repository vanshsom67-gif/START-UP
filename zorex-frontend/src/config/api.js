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

/**
 * getImageUrl — Safe image URL resolver with category fallbacks
 */
export const getImageUrl = (imagePath, category = "") => {
  if (!imagePath) {
    if (category?.toLowerCase().includes("gym") || category?.toLowerCase().includes("supplement")) {
      return "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
    return imagePath;
  }

  const clean = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return encodeURI(clean);
};
