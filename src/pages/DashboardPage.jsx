import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, fetchAllUsers, deleteUser } from "../api";

function DashboardPage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(user?.role === "admin" ? "users" : "profile");
  const [allUsers, setAllUsers] = useState([]);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load all users when on users tab
  useEffect(() => {
    if (activeTab === "users" && user?.role === "admin") {
      loadAllUsers();
    }
  }, [activeTab]);

  const loadAllUsers = async () => {
    try {
      const res = await fetchAllUsers();
      // Show everyone except admin
      setAllUsers(res.data.filter((u) => u._id !== user.id));
    } catch (err) {
      console.log("Could not load users:", err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg("");
    setUpdateError("");
    setSaving(true);
    try {
      const res = await updateProfile({ name: editName, email: editEmail });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUpdateMsg("Profile updated successfully!");
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}'s account? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      // If user deleted themselves
      if (userId === user.id) {
        logout();
        navigate("/login");
      } else {
        setAllUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete user");
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="dashboard-layout">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">User Management</div>
        <div className="navbar-user">
          <span>Hello, <strong>{user?.name}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">

        {/* Welcome strip */}
        <div className="welcome-card">
          <div className="welcome-avatar">{avatarLetter}</div>
          <div className="welcome-text">
            <h2>
              {user?.name}
              <span className={`role-badge ${user?.role === "admin" ? "role-admin" : "role-user"}`}>
                {user?.role}
              </span>
            </h2>
            <p>{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {user?.role === "admin" && (
            <button
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              All Users
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
        </div>

        {/* ── All user tab for adminonly ── */}
        {activeTab === "users" && user?.role === "admin" && (
          <div>
            <p className="users-count">
              {allUsers.length} registered user{allUsers.length !== 1 ? "s" : ""}
            </p>

            {allUsers.length === 0 ? (
              <div className="card empty-state">
                No other users registered yet.
              </div>
            ) : (
              <div className="user-cards">
                {allUsers.map((u) => (
                  <div className="user-card" key={u._id}>
                    {/* Avatar */}
                    <div className="user-card-avatar">
                      {u.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + Email */}
                    <div className="user-card-info">
                      <div className="user-card-name">{u.name}</div>
                      <div className="user-card-email">{u.email}</div>
                    </div>

                    {/* Role badge + Delete */}
                    <div className="user-card-actions">
                      <span className={`role-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}>
                        {u.role}
                      </span>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── My prof tab ── */}
        {activeTab === "profile" && (
          <div className="card">
            <h3>My Profile</h3>

            <div className="profile-info">
              <div className="info-item">
                <label>Name</label>
                <span>{user?.name}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <span style={{ textTransform: "capitalize" }}>{user?.role}</span>
              </div>
            </div>

            <h3>Edit Profile</h3>

            {updateMsg && <div className="success-message">{updateMsg}</div>}
            {updateError && <div className="error-message">{updateError}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Your email"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "auto", padding: "10px 28px" }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            {user?.role !== "admin" && (
              <div className="danger-zone">
                <p className="danger-title"></p>
                <p className="danger-desc">
                  Click here to delete your account permanantly 
                </p>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteUser(user?.id, user?.name)}
                >
                  Delete My Account
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;
