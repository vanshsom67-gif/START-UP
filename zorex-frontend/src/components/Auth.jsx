import React, { useState } from "react";
import { Mail, Lock, User, LogIn, UserPlus, CheckCircle, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import { API_BASE } from "../config/api";

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // UI state
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("zorex_token", data.token);
        localStorage.setItem("zorex_user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to authentication server. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName || "Zorexa Member",
          email: signupEmail,
          phone: signupPhone,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("zorex_token", data.token);
        localStorage.setItem("zorex_user", JSON.stringify(data.user));
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 800);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Banner */}
        <div className="auth-left-banner">
          <div className="auth-brand-info">
            <div className="auth-brand-logo">
              ZOREXA <Sparkles size={14} style={{ color: "#c026d3", display: "inline-block" }} />
            </div>
            <div className="auth-brand-tagline">HAUTE FASHION & STREETWEAR</div>
            <h2>{isLogin ? "Welcome Back" : "Join Zorexa"}</h2>
            <p>
              {isLogin
                ? "Sign in to access your curated wishlist, order tracking and bespoke recommendations."
                : "Create an exclusive account to explore our signature streetwear & couture collections."}
            </p>
          </div>
          <div className="banner-art">
            <div className="banner-art-icon">✨</div>
            <div className="banner-features">
              <span><ShieldCheck size={14} /> Certified Authentic</span>
              <span>⚡ Express Shipping</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-right-form">
          <div>
            {successMsg && (
              <div className="auth-alert success">
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}
            {error && (
              <div className="auth-alert error">
                {error}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="loginEmail">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} />
                    <input
                      type="email"
                      id="loginEmail"
                      placeholder="you@domain.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loading}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showLoginPass ? "text" : "password"}
                      id="loginPassword"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <span
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="password-toggle-btn"
                    >
                      {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  <LogIn size={16} />
                  <span>{loading ? "Authenticating..." : "Sign In"}</span>
                </button>

                <div className="admin-demo-box">
                  🔑 Administrator Credentials: <strong>admin@zorexa.com</strong> / <strong>admin123</strong>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label htmlFor="signupName">Full Name</label>
                  <div className="input-wrapper">
                    <User size={16} />
                    <input
                      type="text"
                      id="signupName"
                      placeholder="Vansh Soam"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} />
                    <input
                      type="email"
                      id="signupEmail"
                      placeholder="you@domain.com"
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
                    <input
                      type="tel"
                      id="signupPhone"
                      placeholder="+91 8791910659"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword">Password <span className="label-subtext">(Min 6 characters)</span></label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showSignupPass ? "text" : "password"}
                      id="signupPassword"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <span
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="password-toggle-btn"
                    >
                      {showSignupPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  <UserPlus size={16} />
                  <span>{loading ? "Creating Account..." : "Create Account"}</span>
                </button>
              </form>
            )}
          </div>

          <div className="auth-toggle">
            {isLogin ? (
              <>New to Zorexa? <span onClick={toggleMode}>Create your account</span></>
            ) : (
              <>Already have an account? <span onClick={toggleMode}>Sign In</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

