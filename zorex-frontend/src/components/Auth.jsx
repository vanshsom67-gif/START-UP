import React, { useState } from "react";
import { Mail, Phone, Lock, User, LogIn, UserPlus } from "lucide-react";

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup States
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  // Feedback States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupEmail || !signupPhone || !signupPassword) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          phone: signupPhone,
          password: signupPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Account Created Successfully! Please log in.");
        setIsLogin(true);
        // Reset states
        setSignupEmail("");
        setSignupPhone("");
        setSignupPassword("");
        // Autofill login username
        setLoginUsername(signupEmail);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left-banner">
          <div>
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>
            <p>
              {isLogin
                ? "Get access to your Orders, Wishlist and Recommendations"
                : "We do not share your personal details with anyone."}
            </p>
          </div>
          <div className="banner-art">🛒🛍️📦</div>
        </div>

        <div className="auth-right-form">
          <div>
            {error && (
              <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: "500", textAlign: "center" }}>
                {error}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Email or Phone Number</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      id="username"
                      placeholder="name@email.com or +91..."
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      id="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ textTransform: "uppercase" }}>
                  <LogIn size={18} />
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label htmlFor="signupEmail">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      id="signupEmail"
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupPhone">Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input
                      type="text"
                      id="signupPhone"
                      placeholder="e.g., 8791910659"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword">Create Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      id="signupPassword"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ textTransform: "uppercase" }}>
                  <UserPlus size={18} />
                  {loading ? "Creating Account..." : "Continue"}
                </button>
              </form>
            )}
          </div>

          <div className="auth-toggle">
            {isLogin ? (
              <>
                New to Zorexa Fashion?
                <span onClick={toggleMode}>Create an account</span>
              </>
            ) : (
              <>
                Already have an account?
                <span onClick={toggleMode}>Login</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
