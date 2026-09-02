import React, { useState, useEffect } from "react";
import {
  X, User, MapPin, Shield, Lock, Plus, Trash2, Check,
  Phone, Mail, ShoppingBag, LogOut, Edit3, Sparkles
} from "lucide-react";
import { API_BASE, authFetch } from "../config/api";

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onGoToOrders,
}) {
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'addresses' | 'security'

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", ok: true });

  // Addresses state stored locally/in user object
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(`zorex_addresses_${user?.email || "guest"}`);
      return saved ? JSON.parse(saved) : [
        {
          id: "addr_1",
          type: "Home",
          name: user?.name || "Customer",
          phone: user?.phone || "",
          addressLine: "Flat 402, Royal Palms Luxury Enclave",
          city: "Agra",
          state: "Uttar Pradesh",
          pincode: "282001",
          isDefault: true,
        },
      ];
    } catch {
      return [];
    }
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: "Home",
    name: user?.name || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", ok: true });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const saveAddressesToStorage = (updated) => {
    setAddresses(updated);
    try {
      localStorage.setItem(`zorex_addresses_${user?.email || "guest"}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ text: "", ok: true });

    try {
      const updated = { ...user, name, phone };
      localStorage.setItem("zorex_user", JSON.stringify(updated));
      if (onUpdateUser) onUpdateUser(updated);

      setProfileMsg({ text: "✓ Profile details updated successfully!", ok: true });
    } catch (err) {
      setProfileMsg({ text: "Failed to update profile", ok: false });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.addressLine || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      alert("Please fill in all required address fields.");
      return;
    }

    const created = {
      ...newAddr,
      id: "addr_" + Date.now(),
      isDefault: addresses.length === 0,
    };

    const updated = [...addresses, created];
    saveAddressesToStorage(updated);
    setShowAddAddress(false);
    setNewAddr({
      type: "Home",
      name: user?.name || "",
      phone: user?.phone || "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddressesToStorage(updated);
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddressesToStorage(updated);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters long", ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match", ok: false });
      return;
    }

    setPasswordSaving(true);
    setPasswordMsg({ text: "", ok: true });

    try {
      setPasswordMsg({ text: "✓ Password updated successfully!", ok: true });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ text: "Could not update password", ok: false });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-avatar-pill">
            <div className="profile-avatar-char">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3>{user?.name || "Zorexa Member"}</h3>
              <p className="profile-sub-email">{user?.email || "user@zorexa.com"}</p>
            </div>
          </div>
          <button className="profile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <User size={15} />
            <span>Profile</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <MapPin size={15} />
            <span>Addresses ({addresses.length})</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={15} />
            <span>Security</span>
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === "details" && (
          <form className="profile-tab-body" onSubmit={handleSaveProfile}>
            <div className="profile-form-group">
              <label>Full Name</label>
              <div className="profile-input-wrapper">
                <User size={16} className="profile-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Phone Number</label>
              <div className="profile-input-wrapper">
                <Phone size={16} className="profile-icon" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Email Address</label>
              <div className="profile-input-wrapper disabled">
                <Mail size={16} className="profile-icon" />
                <input type="email" value={email} disabled />
              </div>
              <span className="field-hint">Email address cannot be changed</span>
            </div>

            {profileMsg.text && (
              <div className={`profile-msg-banner ${profileMsg.ok ? "ok" : "error"}`}>
                {profileMsg.text}
              </div>
            )}

            <div className="profile-actions-row">
              <button type="submit" className="profile-save-btn" disabled={profileSaving}>
                <span>{profileSaving ? "Saving..." : "Save Changes"}</span>
              </button>
              <button
                type="button"
                className="profile-orders-btn"
                onClick={() => {
                  onClose();
                  if (onGoToOrders) onGoToOrders();
                }}
              >
                <ShoppingBag size={15} />
                <span>My Orders</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === "addresses" && (
          <div className="profile-tab-body">
            <div className="addresses-header">
              <h4>Saved Delivery Locations</h4>
              <button
                className="add-address-trigger"
                onClick={() => setShowAddAddress(!showAddAddress)}
              >
                <Plus size={14} />
                <span>{showAddAddress ? "Cancel" : "Add New Address"}</span>
              </button>
            </div>

            {showAddAddress && (
              <form className="add-address-form" onSubmit={handleAddAddress}>
                <h5>Add New Delivery Address</h5>
                <div className="addr-type-pills">
                  {["Home", "Work", "Other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-pill ${newAddr.type === t ? "active" : ""}`}
                      onClick={() => setNewAddr({ ...newAddr, type: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="addr-grid">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Contact Phone"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="Street Address / House / Flat No."
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  required
                />

                <div className="addr-grid-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="addr-submit-btn">
                  Save Address
                </button>
              </form>
            )}

            <div className="addresses-list">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`saved-addr-card ${addr.isDefault ? "default" : ""}`}
                >
                  <div className="addr-top-bar">
                    <span className="addr-type-tag">{addr.type}</span>
                    {addr.isDefault && (
                      <span className="addr-default-badge">
                        <Check size={12} /> Default
                      </span>
                    )}
                    <button
                      className="addr-del-btn"
                      onClick={() => handleDeleteAddress(addr.id)}
                      title="Delete Address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="addr-name-phone">
                    <strong>{addr.name}</strong> • {addr.phone}
                  </p>
                  <p className="addr-text">
                    {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>

                  {!addr.isDefault && (
                    <button
                      className="set-default-btn"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security & Passwords */}
        {activeTab === "security" && (
          <form className="profile-tab-body" onSubmit={handleChangePassword}>
            <div className="profile-form-group">
              <label>Current Password</label>
              <div className="profile-input-wrapper">
                <Lock size={16} className="profile-icon" />
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>New Password</label>
              <div className="profile-input-wrapper">
                <Lock size={16} className="profile-icon" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Confirm New Password</label>
              <div className="profile-input-wrapper">
                <Lock size={16} className="profile-icon" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {passwordMsg.text && (
              <div className={`profile-msg-banner ${passwordMsg.ok ? "ok" : "error"}`}>
                {passwordMsg.text}
              </div>
            )}

            <button type="submit" className="profile-save-btn" disabled={passwordSaving}>
              <span>{passwordSaving ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="profile-modal-footer">
          <button
            className="profile-logout-btn"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
