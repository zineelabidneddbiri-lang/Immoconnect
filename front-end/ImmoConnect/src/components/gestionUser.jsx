import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style/gestionUser.css";
import api from "../api";

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/admin" },
  { icon: "group", label: "Utilisateurs", path: "/admin/utilisateurs", active: true },
  { icon: "analytics", label: "Statistiques", path: "/admin/stats" },
  { icon: "settings", label: "Paramètres", path: "/admin/settings" },
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte administrateur ? Cette action est irréversible et vous déconnectera immédiatement.")) {
      try {
        await api.delete(`/users/${currentUser.id}`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/logged-out");
      } catch (err) {
        console.error("Error deleting admin account:", err);
        alert("Une erreur est survenue lors de la suppression de votre compte.");
      }
    }
  };

  // Stats counts
  const [clientCount, setClientCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [suspendedCount, setSuspendedCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userJson);
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    setCurrentUser(user);
    fetchUsers();
    fetchStats();
  }, [activePage, search]);

  const fetchStats = async () => {
    try {
      // Fetch all users to calculate stats
      const response = await api.get("/us"); // /api/us is the unpaginated route
      if (response.data && Array.isArray(response.data)) {
        const list = response.data;
        setClientCount(list.filter((u) => u.role === "user").length);
        setAdminCount(list.filter((u) => u.role === "admin").length);
        setSuspendedCount(list.filter((u) => u.status === "banned").length);
      }
    } catch (err) {
      console.error("Error loading user stats:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: activePage,
        search: search || undefined,
      };
      const response = await api.get("/users", { params });
      if (response.data.status === "success") {
        setUsersList(response.data.data.data);
        setLastPage(response.data.data.last_page);
        setTotalCount(response.data.data.total);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userItem) => {
    if (userItem.id === currentUser.id) {
      alert("Vous ne pouvez pas suspendre votre propre compte !");
      return;
    }
    const newStatus = userItem.status === "active" ? "banned" : "active";
    try {
      await api.put(`/users/${userItem.id}`, { status: newStatus });
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte !");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
        fetchStats();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

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

  const stats = [
    { label: "Total Utilisateurs", value: totalCount, sub: "Dans la base", subColor: "emerald", icon: "trending_up", highlight: "primary" },
    { label: "Clients", value: clientCount, sub: `${clientCount} comptes actifs`, subColor: "slate", highlight: "dark" },
    { label: "Administrateurs", value: adminCount, sub: `${adminCount} modérateurs`, subColor: "slate", highlight: "dark" },
    { label: "Suspendus", value: suspendedCount, sub: "Comptes bannis", subColor: "slate", highlight: "red", border: true },
  ];

  return (
    <div className="admin-users-container">
      {/* Sidebar */}
      <aside className="sidebar-aside">
        <div className="sidebar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <h1 className="logo-text">ImmoConnect</h1>
        </div>
        <div className="sidebar-nav">
          {navItems.map(({ icon, label, path, active }) => {
            return (
              <a
                key={label}
                href="#"
                onClick={(e) => { e.preventDefault(); navigate(path); }}
                className={`nav-link ${active ? "active" : "inactive"}`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </a>
            );
          })}
        </div>
        <div className="sidebar-footer" style={{ position: "relative" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/aide"); }} className="sidebar-footer-link help">
            <span className="material-symbols-outlined">help</span>
            <span>Aide</span>
          </a>

          {currentUser && (
            <>
              <div 
                className="admin-user-profile" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "rgba(99, 14, 212, 0.05)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", margin: "8px 0" }}
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
                  fontWeight: "700"
                }}>
                  {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="admin-user-name" style={{ fontWeight: "700", color: "var(--text-main)" }}>{currentUser.full_name}</p>
                  <p className="admin-user-role" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Administrateur</p>
                </div>
              </div>

              {showProfileMenu && (
                <div className="admin-profile-dropdown" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#ffffff", border: "1px solid rgba(99, 14, 212, 0.15)", color: "var(--text-main)" }}>
                  <div className="dropdown-header">
                    <p className="dropdown-name" style={{ color: "var(--text-main)" }}>{currentUser.full_name}</p>
                    <p className="dropdown-role" style={{ color: "var(--text-muted)" }}>Administrateur</p>
                  </div>
                  <div className="dropdown-divider" style={{ backgroundColor: "rgba(99, 14, 212, 0.1)" }} />
                  <div className="dropdown-body">
                    <div className="info-item">
                      <span className="material-symbols-outlined" style={{ color: "var(--primary-color)" }}>email</span>
                      <div className="info-content">
                        <p className="info-label" style={{ color: "var(--text-muted)" }}>Email</p>
                        <p className="info-value" style={{ color: "var(--text-main)" }}>{currentUser.email}</p>
                      </div>
                    </div>
                    {currentUser.phone && (
                      <div className="info-item">
                        <span className="material-symbols-outlined" style={{ color: "var(--primary-color)" }}>call</span>
                        <div className="info-content">
                          <p className="info-label" style={{ color: "var(--text-muted)" }}>Téléphone</p>
                          <p className="info-value" style={{ color: "var(--text-main)" }}>{currentUser.phone}</p>
                        </div>
                      </div>
                    )}
                    {currentUser.city && (
                      <div className="info-item">
                        <span className="material-symbols-outlined" style={{ color: "var(--primary-color)" }}>location_on</span>
                        <div className="info-content">
                          <p className="info-label" style={{ color: "var(--text-muted)" }}>Ville</p>
                          <p className="info-value" style={{ color: "var(--text-main)" }}>{currentUser.city}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="dropdown-divider" style={{ backgroundColor: "rgba(99, 14, 212, 0.1)" }} />
                  <div className="dropdown-footer" style={{ flexDirection: "column" }}>
                    <button className="btn-edit-profile" onClick={() => { navigate("/admin/settings"); setShowProfileMenu(false); }} style={{ border: "1px solid rgba(99, 14, 212, 0.2)" }}>
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

          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="sidebar-footer-link logout">
            <span className="material-symbols-outlined">logout</span>
            <span>Déconnexion</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="mgmt-main-content">
        {/* Header */}
        <header className="header-container">
          <div className="header-wrapper">
            <div className="header-left">
              <span className="material-symbols-outlined header-icon">admin_panel_settings</span>
              <h2 className="mgmt-header-title">Gestion des Utilisateurs - Admin</h2>
            </div>
            <div className="header-right">
              <div className="mgmt-search-wrapper">
                <span className="material-symbols-outlined mgmt-search-icon">search</span>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setActivePage(1); }}
                  className="mgmt-search-input"
                  placeholder="Rechercher par nom..."
                />
              </div>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {/* Stats */}
          <div className="stats-grid">
            {stats.map(({ label, value, sub, subColor, icon, highlight, border }) => (
              <div key={label} className={`stat-card ${border ? "suspended-border" : ""}`}>
                <span className="stat-label">{label}</span>
                <span className={`stat-value ${highlight}`}>{value}</span>
                <div className={`stat-sub ${subColor}`}>
                  {icon && <span className="material-symbols-outlined">{icon}</span>}
                  <span>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Annuaire des Utilisateurs</h3>
            </div>

            <div className="table-overflow">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Chargement des utilisateurs...
                </div>
              ) : usersList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Aucun utilisateur trouvé.
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr className="table-thead-row">
                      {["Avatar & Nom", "Email", "Rôle", "Téléphone", "Statut", "Actions"].map((h, i) => (
                        <th key={h} className={`table-th ${i === 5 ? "text-right" : ""} ${i === 0 ? "pl-8" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="table-tbody">
                    {usersList.map((u) => {
                      const isSuspended = u.status === "banned";
                      
                      return (
                        <tr key={u.id}>
                          <td className="table-td pl-8">
                            <div className="user-profile">
                              <div className="profile-initials" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#630ed4', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', marginRight: '12px', flexShrink: 0 }}>
                                {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <p className={`user-name ${isSuspended ? "suspended" : ""}`}>{u.full_name}</p>
                                <p className="user-id">#{u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-td">
                            <span className={`user-email ${isSuspended ? "suspended" : ""}`}>{u.email}</span>
                          </td>
                          <td className="table-td">
                            <span className={`badge-role ${u.role === 'admin' ? 'admin' : 'acheteur'}`}>
                              {u.role === 'admin' ? 'Admin' : 'Client'}
                            </span>
                          </td>
                          <td className="table-td">
                            <span className="user-date">{u.phone || "Non renseigné"}</span>
                          </td>
                          <td className="table-td">
                            <div className={`status-wrapper ${isSuspended ? "suspended" : "active"}`}>
                              <span className={`status-dot ${isSuspended ? "suspended" : "active"}`} />
                              {isSuspended ? "Suspendu" : "Actif"}
                            </div>
                          </td>
                          <td className="table-td text-right">
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingRight: '20px' }}>
                              <button 
                                className={`btn-action ${isSuspended ? "btn-action-success" : "btn-action-warning"}`} 
                                onClick={() => toggleStatus(u)}
                              >
                                {isSuspended ? "Activer" : "Suspendre"}
                              </button>
                              <button 
                                className="btn-action btn-action-danger" 
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="pagination-wrapper">
                <p className="pagination-label">Affichage de la page {activePage} sur {lastPage}</p>
                <div className="pagination-buttons">
                  <button 
                    className="pagination-btn chevron"
                    onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                    disabled={activePage === 1}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: lastPage }, (_, idx) => idx + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setActivePage(n)}
                      className={`pagination-btn number ${activePage === n ? "active" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn chevron"
                    onClick={() => setActivePage((p) => Math.min(lastPage, p + 1))}
                    disabled={activePage === lastPage}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div>
              <p className="footer-logo">ImmoConnect</p>
              <p className="footer-copyright">© 2026 ImmoConnect. L'art de l'habitat d'exception.</p>
            </div>
            <div className="footer-links">
              {["Mentions Légales", "Confidentialité", "Cookies", "Presse"].map((l) => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
