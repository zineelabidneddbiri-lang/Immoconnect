import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/AdminSettings.css";
import api from "../api";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte administrateur ? Cette action est irréversible et vous déconnectera immédiatement.")) {
      try {
        await api.delete(`/users/${user.id}`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/logged-out");
      } catch (err) {
        console.error("Error deleting admin account:", err);
        alert("Une erreur est survenue lors de la suppression de votre compte.");
      }
    }
  };
  
  // Commission settings
  const [commissionSale, setCommissionSale] = useState("2.5");
  const [commissionRent, setCommissionRent] = useState("5.0");
  const [commissionSaved, setCommissionSaved] = useState(false);

  // Maps settings
  const [googleMapsKey, setGoogleMapsKey] = useState("AIzaSyA4_example_key_5d1h2s8");
  const [mapboxToken, setMapboxToken] = useState("pk.eyJ1IjoiaW1tb2Nvbm5lY3QiLCJhIjo...example");
  const [mapsSaved, setMapsSaved] = useState(false);

  // Email templates
  const [emailSubjectApproval, setEmailSubjectApproval] = useState("Votre annonce est en ligne !");
  const [emailBodyApproval, setEmailBodyApproval] = useState("Bonjour {client_name},\n\nNous avons le plaisir de vous informer que votre annonce {property_title} a été validée par nos curateurs et est maintenant visible sur ImmoConnect.\n\nCordialement,\nL'équipe ImmoConnect.");
  const [emailSubjectRequest, setEmailSubjectRequest] = useState("Nouvelle demande d'information");
  const [emailBodyRequest, setEmailBodyRequest] = useState("Cher utilisateur,\n\nUn client potentiel vient de vous envoyer une demande d'information concernant votre annonce {property_title}. Connectez-vous à votre espace personnel pour y répondre.\n\nCordialement,\nL'équipe ImmoConnect.");
  const [emailsSaved, setEmailsSaved] = useState(false);

  // Admin Profile settings
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminCity, setAdminCity] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userJson);
    if (parsedUser.role !== "admin") {
      navigate("/");
      return;
    }
    setUser(parsedUser);
    setAdminName(parsedUser.full_name || "");
    setAdminEmail(parsedUser.email || "");
    setAdminPhone(parsedUser.phone || "");
    setAdminCity(parsedUser.city || "");
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

  const handleSaveCommission = (e) => {
    e.preventDefault();
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 3000);
  };

  const handleSaveMaps = (e) => {
    e.preventDefault();
    setMapsSaved(true);
    setTimeout(() => setMapsSaved(false), 3000);
  };

  const handleSaveEmails = (e) => {
    e.preventDefault();
    setEmailsSaved(true);
    setTimeout(() => setEmailsSaved(false), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaved(false);
    setProfileError("");

    if (adminPassword && adminPassword !== adminConfirmPassword) {
      setProfileError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const payload = {
        full_name: adminName,
        email: adminEmail,
        phone: adminPhone,
        city: adminCity
      };
      if (adminPassword) {
        payload.password = adminPassword;
      }

      const response = await api.put(`/users/${user.id}`, payload);
      if (response.data.status === "success") {
        setProfileSaved(true);
        // Update local info
        const updatedUser = { 
          ...user, 
          full_name: adminName, 
          email: adminEmail,
          phone: adminPhone,
          city: adminCity
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setAdminPassword("");
        setAdminConfirmPassword("");
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || "Une erreur est survenue lors de la mise à jour.");
    }
  };

  return (
    <div className="settings-main-container">
      {/* Admin Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div>
          <div className="admin-sidebar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <span className="material-symbols-outlined fill-icon">domain</span>
            ImmoConnect
          </div>
          <div className="admin-menu-list">
            <Link to="/admin" className="admin-menu-item">
              <span className="material-symbols-outlined">dashboard</span>
              Tableau de bord
            </Link>
            <Link to="/admin/annonces" className="admin-menu-item">
              <span className="material-symbols-outlined">gite</span>
              Mes Annonces
            </Link>
            <Link to="/admin/demandes" className="admin-menu-item">
              <span className="material-symbols-outlined">mail</span>
              Demandes
            </Link>
            <Link to="/admin/utilisateurs" className="admin-menu-item">
              <span className="material-symbols-outlined">group</span>
              Utilisateurs
            </Link>
            <Link to="/admin/stats" className="admin-menu-item">
              <span className="material-symbols-outlined">analytics</span>
              Statistiques
            </Link>
            <Link to="/admin/settings" className="admin-menu-item admin-menu-item-active">
              <span className="material-symbols-outlined">settings</span>
              Paramètres
            </Link>
          </div>
        </div>

        <div className="admin-sidebar-footer" style={{ position: "relative" }}>
          {user && (
            <>
              <div 
                className="admin-user-profile" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: "pointer" }}
              >
                <div className="avatar-circle" style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-color)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  flexShrink: 0
                }}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="admin-user-name">{user.full_name}</p>
                  <p className="admin-user-role">Administrateur</p>
                </div>
              </div>

              {showProfileMenu && (
                <div className="admin-profile-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.full_name}</p>
                    <p className="dropdown-role">Administrateur</p>
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
                  <div className="dropdown-footer" style={{ flexDirection: "column" }}>
                    <button className="btn-edit-profile" onClick={() => { navigate("/admin/settings"); setShowProfileMenu(false); }}>
                      <span className="material-symbols-outlined">edit</span>
                      Modifier mon profil
                    </button>
                    <button className="btn-delete-account" onClick={handleDeleteAccount}>
                      <span className="material-symbols-outlined">delete_forever</span>
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <button className="admin-btn-logout" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="admin-main-area">
        {/* Header */}
        <section className="admin-header">
          <div className="admin-title-desc">
            <h1>Paramètres Système</h1>
            <p>Configure les réglages de la plateforme, les clés API de cartographie et les profils administratifs.</p>
          </div>
        </section>

        {/* Settings Form Grid */}
        <section className="settings-grid-layout">
          {/* Commission Rates */}
          <div className="settings-card">
            <div className="settings-card-title-group">
              <span className="material-symbols-outlined settings-card-icon">percent</span>
              <h2 className="settings-card-title">Taux de Commission</h2>
            </div>
            
            {commissionSaved && (
              <div className="success-banner" style={{ padding: "8px 12px", backgroundColor: "var(--success-bg)", borderLeft: "4px solid var(--success-color)", color: "var(--success-text)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600" }}>
                ✓ Taux de commission enregistrés avec succès !
              </div>
            )}

            <form onSubmit={handleSaveCommission} className="settings-form-row">
              <div className="settings-input-group">
                <label className="settings-label">Commission Vente (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="settings-input" 
                  value={commissionSale} 
                  onChange={(e) => setCommissionSale(e.target.value)}
                  required 
                />
              </div>

              <div className="settings-input-group">
                <label className="settings-label">Commission Location (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="settings-input" 
                  value={commissionRent} 
                  onChange={(e) => setCommissionRent(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="settings-btn-save">Enregistrer les taux</button>
            </form>
          </div>

          {/* Maps API Keys */}
          <div className="settings-card">
            <div className="settings-card-title-group">
              <span className="material-symbols-outlined settings-card-icon">map</span>
              <h2 className="settings-card-title">Clés API Cartes</h2>
            </div>

            {mapsSaved && (
              <div className="success-banner" style={{ padding: "8px 12px", backgroundColor: "var(--success-bg)", borderLeft: "4px solid var(--success-color)", color: "var(--success-text)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600" }}>
                ✓ Clés de cartographie mises à jour !
              </div>
            )}

            <form onSubmit={handleSaveMaps} className="settings-form-row">
              <div className="settings-input-group">
                <label className="settings-label">Clé Google Maps API</label>
                <input 
                  type="text" 
                  className="settings-input" 
                  value={googleMapsKey} 
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                  required 
                />
              </div>

              <div className="settings-input-group">
                <label className="settings-label">Token Mapbox</label>
                <input 
                  type="text" 
                  className="settings-input" 
                  value={mapboxToken} 
                  onChange={(e) => setMapboxToken(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="settings-btn-save">Mettre à jour les clés</button>
            </form>
          </div>

          {/* Email Templates */}
          <div className="settings-card" style={{ gridColumn: "span 2" }}>
            <div className="settings-card-title-group">
              <span className="material-symbols-outlined settings-card-icon">mail_outline</span>
              <h2 className="settings-card-title">Modèles d'Emails</h2>
            </div>

            {emailsSaved && (
              <div className="success-banner" style={{ padding: "8px 12px", backgroundColor: "var(--success-bg)", borderLeft: "4px solid var(--success-color)", color: "var(--success-text)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600" }}>
                ✓ Modèles d'emails sauvegardés !
              </div>
            )}

            <form onSubmit={handleSaveEmails} className="settings-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Approval Template */}
              <div className="settings-form-row">
                <span className="settings-label" style={{ color: "var(--primary-color)" }}>Confirmation d'annonce validée</span>
                
                <div className="settings-input-group">
                  <label className="settings-label">Sujet de l'email</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={emailSubjectApproval} 
                    onChange={(e) => setEmailSubjectApproval(e.target.value)}
                    required 
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Corps du message</label>
                  <textarea 
                    className="settings-input settings-textarea" 
                    value={emailBodyApproval} 
                    onChange={(e) => setEmailBodyApproval(e.target.value)}
                    required 
                  ></textarea>
                </div>
              </div>

              {/* Request Template */}
              <div className="settings-form-row">
                <span className="settings-label" style={{ color: "var(--primary-color)" }}>Avis de nouvelle demande d'intermédiation</span>

                <div className="settings-input-group">
                  <label className="settings-label">Sujet de l'email</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={emailSubjectRequest} 
                    onChange={(e) => setEmailSubjectRequest(e.target.value)}
                    required 
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Corps du message</label>
                  <textarea 
                    className="settings-input settings-textarea" 
                    value={emailBodyRequest} 
                    onChange={(e) => setEmailBodyRequest(e.target.value)}
                    required 
                  ></textarea>
                </div>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <button type="submit" className="settings-btn-save">Sauvegarder les modèles</button>
              </div>
            </form>
          </div>

          {/* Admin Profile */}
          <div className="settings-card admin-profile-section">
            <div className="settings-card-title-group">
              <span className="material-symbols-outlined settings-card-icon">manage_accounts</span>
              <h2 className="settings-card-title">Gestion du Profil Admin</h2>
            </div>

            {profileSaved && (
              <div className="success-banner" style={{ padding: "8px 12px", backgroundColor: "var(--success-bg)", borderLeft: "4px solid var(--success-color)", color: "var(--success-text)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600" }}>
                ✓ Informations de profil enregistrées !
              </div>
            )}

            {profileError && (
              <div className="error-banner" style={{ padding: "8px 12px", backgroundColor: "rgba(229, 62, 62, 0.1)", borderLeft: "4px solid #e53e3e", color: "#e53e3e", borderRadius: "4px", fontSize: "0.8rem" }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="admin-profile-inner">
              <div className="admin-avatar-card">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  className="admin-avatar-display" 
                  alt="Admin avatar" 
                />
                <button className="btn-change-avatar" type="button">Changer l'avatar</button>
              </div>

              <div className="settings-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" }}>
                <div className="settings-input-group">
                  <label className="settings-label">Nom complet</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={adminName} 
                    onChange={(e) => setAdminName(e.target.value)}
                    required 
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Adresse email</label>
                  <input 
                    type="email" 
                    className="settings-input" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required 
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Téléphone</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    placeholder="0600000000"
                    value={adminPhone} 
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Ville</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    placeholder="Casablanca"
                    value={adminCity} 
                    onChange={(e) => setAdminCity(e.target.value)}
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    className="settings-input" 
                    placeholder="••••••••" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>

                <div className="settings-input-group">
                  <label className="settings-label">Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    className="settings-input" 
                    placeholder="••••••••" 
                    value={adminConfirmPassword} 
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <button type="submit" className="settings-btn-save">Mettre à jour le profil</button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
