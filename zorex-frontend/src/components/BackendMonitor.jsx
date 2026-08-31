import React, { useState, useEffect } from "react";
import { Server, Database, Activity, Terminal, Play, CheckCircle2, AlertTriangle, RefreshCw, X, Copy, Check, Globe, Code } from "lucide-react";
import { API_BASE } from "../config/api";

export default function BackendMonitor({ onClose }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testEndpoint, setTestEndpoint] = useState("/api/health");
  const [responseOutput, setResponseOutput] = useState(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message || "Failed to connect to Backend API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunTest = async (endpointPath) => {
    const target = endpointPath || testEndpoint;
    setTestEndpoint(target);
    setTesting(true);
    setResponseOutput(null);
    try {
      const res = await fetch(`${API_BASE}${target}`);
      const data = await res.json();
      setResponseOutput({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
      });
    } catch (err) {
      setResponseOutput({
        status: "ERROR",
        message: err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyApiUrl = () => {
    navigator.clipboard.writeText(`${API_BASE}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="backend-monitor-modal-overlay" onClick={onClose}>
      <div className="backend-monitor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="monitor-header">
          <div className="monitor-title-group">
            <div className="monitor-icon-badge">
              <Server size={22} />
            </div>
            <div>
              <h2>Backend API Inspector & System Monitor</h2>
              <p className="monitor-sub">Live fullstack node server status running on 1 single URL</p>
            </div>
          </div>
          <button className="monitor-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* System Overview Bar */}
        <div className="monitor-status-cards">
          {/* Card 1: API Server */}
          <div className={`status-card ${health ? "card-online" : error ? "card-offline" : "card-loading"}`}>
            <div className="card-top">
              <span className="card-label">Server Status</span>
              {health ? (
                <span className="badge-online"><CheckCircle2 size={14} /> Live / Online</span>
              ) : (
                <span className="badge-offline"><AlertTriangle size={14} /> Disconnected</span>
              )}
            </div>
            <div className="card-val">{health ? "Connected 🚀" : error ? "Error" : "Checking..."}</div>
            <div className="card-footer-info">URL: {API_BASE}</div>
          </div>

          {/* Card 2: Environment */}
          <div className="status-card card-neutral">
            <div className="card-top">
              <span className="card-label">Environment</span>
              <Globe size={16} />
            </div>
            <div className="card-val">{health?.environment || "development"}</div>
            <div className="card-footer-info">Unified Express + React Build</div>
          </div>

          {/* Card 3: Database & Uptime */}
          <div className="status-card card-neutral">
            <div className="card-top">
              <span className="card-label">Database</span>
              <Database size={16} />
            </div>
            <div className="card-val">MongoDB Atlas</div>
            <div className="card-footer-info">Auto-Admin Ready</div>
          </div>
        </div>

        {/* URL Link Sharing Box */}
        <div className="monitor-url-box">
          <div className="url-info">
            <Globe size={18} className="text-amber-400" />
            <div>
              <strong>Single Link Access Point:</strong>
              <div className="url-text">{API_BASE}</div>
            </div>
          </div>
          <button className="copy-api-btn" onClick={handleCopyApiUrl}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied Base URL!" : "Copy API Base URL"}</span>
          </button>
        </div>

        {/* API Endpoint Tester */}
        <div className="monitor-tester-section">
          <h3><Terminal size={18} /> Interactive Endpoint Tester</h3>
          <p className="section-desc">Click any endpoint below to execute a real-time HTTP request directly to the backend:</p>

          <div className="quick-endpoints">
            <button 
              className={`endpoint-chip ${testEndpoint === "/api/health" ? "active" : ""}`} 
              onClick={() => handleRunTest("/api/health")}
            >
              <Activity size={13} /> GET /api/health
            </button>
            <button 
              className={`endpoint-chip ${testEndpoint === "/api/products" ? "active" : ""}`} 
              onClick={() => handleRunTest("/api/products")}
            >
              <Code size={13} /> GET /api/products
            </button>
            <button 
              className={`endpoint-chip ${testEndpoint === "/api/orders" ? "active" : ""}`} 
              onClick={() => handleRunTest("/api/orders")}
            >
              <Code size={13} /> GET /api/orders
            </button>
          </div>

          {/* Custom Input */}
          <div className="tester-input-bar">
            <span className="method-tag">GET</span>
            <input 
              type="text" 
              value={testEndpoint} 
              onChange={(e) => setTestEndpoint(e.target.value)} 
              placeholder="/api/health"
            />
            <button 
              className="run-test-btn" 
              onClick={() => handleRunTest()} 
              disabled={testing}
            >
              {testing ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              <span>Execute</span>
            </button>
          </div>

          {/* Response Terminal */}
          {responseOutput && (
            <div className="json-terminal">
              <div className="terminal-header">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
                <span className="terminal-title">Response Output (HTTP {responseOutput.status})</span>
              </div>
              <pre className="terminal-body">
                {JSON.stringify(responseOutput.data || responseOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="monitor-modal-footer">
          <button className="refresh-health-btn" onClick={fetchHealth} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh Health</span>
          </button>
          <button className="modal-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
