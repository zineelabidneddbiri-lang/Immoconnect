import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/UserSettings.css";
import api from "../api";

const navItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "support_agent", label: "Conciergerie" },
  { icon: "favorite", label: "Favoris" },
  { icon: "settings", label: "Paramètres", active: true, filled: true },
  { icon: "logout", label: "Déconnexion" },
];

export default function UserSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userJson);
    setUser(parsedUser);
    setFullName(parsedUser.full_name || "");
    setEmail(parsedUser.email || "");
    setPhone(parsedUser.phone || "");
    setCity(parsedUser.city || "");
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/logged-out");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte définitivement ? Cette action est irréversible et supprimera toutes vos données."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await api.delete(`/users/${user.id}`);
      if (response.data.status === "success") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Votre compte a été supprimé avec succès.");
        navigate("/logged-out");
      } else {
        alert("Une erreur est survenue lors de la suppression du compte.");
      }
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert(
        err.response?.data?.message ||
        "Une erreur est survenue lors de la suppression du compte."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaved(false);
    setError("");

    if (password && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        full_name: fullName,
        email: email,
        phone: phone,
        city: city,
      };
      if (password) {
        payload.password = password;
      }

      const response = await api.put(`/users/${user.id}`, payload);
      if (response.data.status === "success") {
        setSaved(true);
        // Update local info
        const updatedUser = { 
          ...user, 
          full_name: fullName, 
          email: email,
          phone: phone,
          city: city
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Une erreur est survenue lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="usersettings-container">
      {/* Sidebar */}
      <aside className={`client-sidebar-aside ${sidebarOpen ? "client-sidebar-open" : ""}`}>
        <div className="client-sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '8px' }}>
          <div>
            <div className="client-sidebar-brand-title" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>ImmoConnect</div>
            <div className="client-sidebar-brand-edition">Édition Client</div>
          </div>
          <button className="mobile-menu-close" onClick={() => setSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="client-sidebar-nav">
          {navItems.map(({ icon, label, active, filled }) => {
            const handleNav = (e) => {
              e.preventDefault();
              if (label === "Dashboard") {
                navigate(user.role === 'admin' ? '/admin' : '/dashboard');
              } else if (label === "Favoris") {
                navigate("/dashboard/favoris");
              } else if (label === "Conciergerie") {
                navigate("/dashboard/demandes");
              } else if (label === "Paramètres") {
                navigate("/dashboard/profile");
              } else if (label === "Déconnexion") {
                handleLogout();
              }
            };
            return (
              <a key={label} href="#"
                onClick={handleNav}
                className={`client-sidebar-nav-link ${
                  active ? "client-sidebar-nav-link-active" : "client-sidebar-nav-link-inactive"
                }`}>
                <span className={`material-symbols-outlined ${active && filled ? "fill-icon" : ""}`}>{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>
        <div className="client-sidebar-footer">
          <button className="btn-publish-property" onClick={() => navigate("/dashboard/publier")}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Publier un bien
          </button>
          <div className="client-sidebar-footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/aide"); }} className="client-sidebar-footer-link">
              <span className="material-symbols-outlined">help</span> Aide
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="client-sidebar-footer-link">
              <span className="material-symbols-outlined">logout</span> Déconnexion
            </a>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="usersettings-main-area">
        {/* Header */}
        <header className="usersettings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="usersettings-title-desc">
              <h1>Mon Profil</h1>
              <p>Gérez vos informations personnelles et modifiez votre mot de passe d'accès.</p>
            </div>
          </div>
          
          <div className="db-header-actions">
            <div 
              className="db-header-profile" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <div className="profile-info">
                <p className="profile-name">{user.full_name}</p>
                <p className="profile-badge">Client Premium</p>
              </div>
              <div className="profile-initials" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#630ed4', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="profile-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.full_name}</p>
                    <p className="dropdown-role">Client Premium</p>
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-body">
                    <div className="info-item">
                      <span className="material-symbols-outlined">email</span>
                      <div className="info-content">
                        <p className="info-label">Email</p>
                        <p className="info-value">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="info-item">
                        <span className="material-symbols-outlined">call</span>
                        <div className="info-content">
                          <p className="info-label">Téléphone</p>
                          <p className="info-value">{user.phone}</p>
                        </div>
                      </div>
                    )}
                    {user.city && (
                      <div className="info-item">
                        <span className="material-symbols-outlined">location_on</span>
                        <div className="info-content">
                          <p className="info-label">Ville</p>
                          <p className="info-value">{user.city}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-footer" style={{ flexDirection: "column", gap: "8px" }}>
                    <button className="btn-edit-profile" onClick={() => { navigate("/dashboard/profile"); setShowProfileMenu(false); }} style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary-color)",
                      border: "1px solid rgba(99, 14, 212, 0.1)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all var(--transition-fast)",
                      cursor: "pointer",
                      marginBottom: "4px"
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                      Modifier mon profil
                    </button>
                    <button className="btn-delete-account" onClick={handleDeleteAccount}>
                      <span className="material-symbols-outlined">delete_forever</span>
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="usersettings-content-wrapper">
          <div className="usersettings-card">
            <div className="usersettings-card-title-group">
              <span className="material-symbols-outlined usersettings-card-icon">manage_accounts</span>
              <h2>Informations Personnelles</h2>
            </div>

            {saved && (
              <div className="success-banner" style={{ padding: "10px 14px", backgroundColor: "var(--success-bg)", borderLeft: "4px solid var(--success-color)", color: "var(--success-text)", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>
                ✓ Vos modifications ont été enregistrées avec succès !
              </div>
            )}

            {error && (
              <div className="error-banner" style={{ padding: "10px 14px", backgroundColor: "rgba(229, 62, 62, 0.1)", borderLeft: "4px solid #e53e3e", color: "#e53e3e", borderRadius: "6px", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="usersettings-form">
              <div className="usersettings-avatar-section">
                <div className="profile-initials-large">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="avatar-info">
                  <h3>Photo de profil</h3>
                  <p>Votre initiale est affichée automatiquement.</p>
                </div>
              </div>

              <div className="usersettings-form-grid">
                <div className="form-group">
                  <label className="form-label">Nom Complet</label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse Email</label>
                  <input
                    type="email"
                    className="form-input-text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="ex: +212600000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="ex: Marrakech"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nouveau Mot de Passe</label>
                  <input
                    type="password"
                    className="form-input-text"
                    placeholder="Laisser vide pour ne pas modifier"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmer le Mot de Passe</label>
                  <input
                    type="password"
                    className="form-input-text"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
