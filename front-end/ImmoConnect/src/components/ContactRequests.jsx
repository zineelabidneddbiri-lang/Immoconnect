import { useState, useEffect } from "react";
import "./style/ContactRequests.css";
import "./style/AdminStats.css"; // Load admin sidebar styles
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const filters = [
  { label: "Toutes", value: "all" },
  { label: "En attente", value: "en_attente" },
  { label: "Acceptées", value: "acceptee" },
  { label: "Refusées", value: "refusee" },
];

const navItems = [
  { icon: "dashboard", label: "Dashboard", active: false },
  { icon: "support_agent", label: "Conciergerie", active: true, filled: true },
  { icon: "favorite", label: "Favoris", active: false },
  { icon: "settings", label: "Paramètres" },
  { icon: "logout", label: "Déconnexion", active: false },
];

const defaultImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

const StatusBadge = ({ status }) => {
  if (status === "en_attente" || status === "pending") return (
    <div className="badge-pending">
      <span className="badge-dot-pending" />
      En attente
    </div>
  );
  if (status === "acceptee" || status === "accepted") return (
    <div className="badge-accepted">
      <span className="material-symbols-outlined text-[14px]">check_circle</span>
      Acceptée
    </div>
  );
  return (
    <div className="badge-rejected">
      <span className="material-symbols-outlined text-[14px]">cancel</span>
      Refusée
    </div>
  );
};

export default function ContactRequests() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [demandesList, setDemandesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin user detection states
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userJson);
    setCurrentUser(user);
    setIsAdmin(user.role === "admin");
    fetchDemandes();
  }, [activeFilter, activePage]);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const endpoint = activeFilter === "all" ? "/demandes" : "/demandes/filter";
      const params = {
        page: activePage,
        status: activeFilter !== "all" ? activeFilter : undefined,
      };

      const response = await api.get(endpoint, { params });
      if (response.data.success) {
        setDemandesList(response.data.data.data);
        setLastPage(response.data.data.last_page);
        setTotalCount(response.data.data.total);
      }
    } catch (err) {
      console.error("Error loading contact requests:", err);
    } finally {
      setLoading(false);
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

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous supprimer cette demande ?")) {
      try {
        const response = await api.delete(`/demandes/${id}`);
        if (response.data.success) {
          fetchDemandes();
        }
      } catch (err) {
        console.error("Error deleting request:", err);
      }
    }
  };

  return (
    <div className="contact-requests-container">
      {/* Sidebar */}
      {isAdmin ? (
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
              <Link to="/admin/demandes" className="admin-menu-item admin-menu-item-active">
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
              <Link to="/admin/settings" className="admin-menu-item">
                <span className="material-symbols-outlined">settings</span>
                Paramètres
              </Link>
            </div>
          </div>
          
          <div className="admin-sidebar-footer" style={{ position: 'relative' }}>
            {currentUser && (
              <>
                <div 
                  className="admin-user-profile" 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", margin: "8px 0" }}
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
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <p className="admin-user-name" style={{ fontWeight: "700", color: "#ffffff" }}>{currentUser.full_name}</p>
                    <p className="admin-user-role" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>Administrateur</p>
                  </div>
                </div>

                {showProfileMenu && (
                  <div className="admin-profile-dropdown" onClick={(e) => e.stopPropagation()} style={{ bottom: "100%", left: "12px", right: "12px", position: "absolute" }}>
                    <div className="dropdown-header">
                      <p className="dropdown-name">{currentUser.full_name}</p>
                      <p className="dropdown-role">Administrateur</p>
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-body">
                      <div className="info-item">
                        <span className="material-symbols-outlined">email</span>
                        <div className="info-content">
                          <p className="info-label">Email</p>
                          <p className="info-value">{currentUser.email}</p>
                        </div>
                      </div>
                      {currentUser.phone && (
                        <div className="info-item">
                          <span className="material-symbols-outlined">call</span>
                          <div className="info-content">
                            <p className="info-label">Téléphone</p>
                            <p className="info-value">{currentUser.phone}</p>
                          </div>
                        </div>
                      )}
                      {currentUser.city && (
                        <div className="info-item">
                          <span className="material-symbols-outlined">location_on</span>
                          <div className="info-content">
                            <p className="info-label">Ville</p>
                            <p className="info-value">{currentUser.city}</p>
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
                    </div>
                  </div>
                )}
              </>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/aide"); }} className="admin-menu-item">
              <span className="material-symbols-outlined">help</span>
              Aide
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="admin-menu-item" style={{ color: '#ef4444' }}>
              <span className="material-symbols-outlined">logout</span>
              Déconnexion
            </a>
          </div>
        </aside>
      ) : (
        <aside className={`client-sidebar-aside ${sidebarOpen ? "client-sidebar-open" : ""}`}>
          <div className="client-sidebar-logo-wrapper" onClick={() => navigate("/")} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '8px', cursor: "pointer" }}>
            <span className="client-sidebar-brand-title">ImmoConnect</span>
            <button className="mobile-menu-close" onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="client-sidebar-nav">
            {navItems.map(({ icon, label, active, filled }) => {
              const handleNav = (e) => {
                e.preventDefault();
                if (label === "Dashboard") {
                  navigate("/dashboard");
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
                <a
                  key={label}
                  href="#"
                  onClick={handleNav}
                  className={`client-sidebar-nav-link ${
                    active ? "client-sidebar-nav-link-active" : "client-sidebar-nav-link-inactive"
                  }`}
                >
                  <span className={`material-symbols-outlined ${filled && active ? "fill-icon" : ""}`}>{icon}</span>
                  {label}
                </a>
              );
            })}
          </nav>
          <div className="client-sidebar-footer">
            <button className="btn-publish" onClick={() => navigate("/dashboard/publier")}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Publier un bien
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/aide"); }} className="client-sidebar-footer-link">
              <span className="material-symbols-outlined">help</span>
              Aide
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="client-sidebar-footer-link">
              <span className="material-symbols-outlined text-red-600">logout</span>
              Déconnexion
            </a>
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="req-main-content">
        {/* Header */}
        <header className="header-nav">
          <div className="header-bar" style={{ display: 'flex', alignItems: 'center' }}>
            {!isAdmin && (
              <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}
            <span className="req-header-title">
              {isAdmin ? "Gestion des demandes d'intermédiation" : "Mes demandes d'intermédiation"}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="content-wrapper">
          {/* Filters */}
          <div className="filters-wrapper">
            {filters.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setActiveFilter(value); setActivePage(1); }}
                className={`filter-button ${
                  activeFilter === value
                    ? "filter-button-active"
                    : "filter-button-inactive"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <div className="table-container">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Chargement des demandes...
                </div>
              ) : demandesList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Aucune demande dans cette catégorie.
                </div>
              ) : (
                <table className="requests-table">
                  <thead>
                    <tr className="table-header-tr">
                      <th className="table-th">Propriété</th>
                      {isAdmin && <th className="table-th">Client</th>}
                      <th className="table-th">Message</th>
                      <th className="table-th">Date d'envoi</th>
                      <th className="table-th">Statut</th>
                      <th className="table-th">Note Admin</th>
                      <th className="table-th table-th-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandesList.map((r) => {
                      const hasImage = r.annonce?.image_annonce && r.annonce.image_annonce.length > 0;
                      const propertyImage = hasImage 
                        ? (r.annonce.image_annonce[0].image_path.startsWith('http') 
                            ? r.annonce.image_annonce[0].image_path 
                            : `http://127.0.0.1:8000/storage/${r.annonce.image_annonce[0].image_path}`)
                        : defaultImg;

                      return (
                        <tr key={r.id} className="table-tr">
                          <td className="table-td">
                            <div className="property-cell">
                              <div className="property-image-wrapper">
                                <img src={propertyImage} alt={r.annonce?.title || "Propriété"} className="property-image" />
                              </div>
                              <div>
                                <p className="property-name">{r.annonce?.title || "Propriété"}</p>
                                <p className="property-location">{r.annonce?.city || "Maroc"}</p>
                              </div>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="table-td">
                              <div>
                                <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>{r.contact_name || r.user?.full_name || "Inconnu"}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.contact_phone || r.user?.phone || "Aucun téléphone"}</p>
                              </div>
                            </td>
                          )}
                          <td className="table-td" style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.message}>
                            {r.message}
                          </td>
                          <td className="table-td date-cell">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="table-td"><StatusBadge status={r.status} /></td>
                          <td className={`table-td response-cell ${r.admin_note ? 'response-style-normal' : 'response-style-italic'}`}>
                            {r.admin_note || "Aucune note"}
                          </td>
                          <td className="table-td table-td-right">
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button className="btn-action btn-action-primary" onClick={() => navigate(`/annonce/${r.annonce_id}`)}>
                                Voir le bien
                              </button>
                              <button 
                                className="btn-action btn-action-danger" 
                                onClick={() => handleDelete(r.id)}
                              >
                                Annuler
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
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="pagination-wrapper">
              <p className="pagination-info">
                Affichage de la page {activePage} sur {lastPage}
              </p>
              <div className="pagination-btns">
                <button 
                  className="pagination-btn"
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  disabled={activePage === 1}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: lastPage }, (_, idx) => idx + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setActivePage(n)}
                    className={`pagination-btn ${
                      activePage === n ? "pagination-btn-active" : ""
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button 
                  className="pagination-btn"
                  onClick={() => setActivePage((p) => Math.min(lastPage, p + 1))}
                  disabled={activePage === lastPage}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer-section">
          <div className="footer-container">
            <div className="footer-brand">ImmoConnect</div>
            <div className="footer-links-list">
              {["Mentions Légales", "Confidentialité", "Cookies", "Presse"].map((l) => (
                <a key={l} href="#" className="footer-links-item">{l}</a>
              ))}
            </div>
            <p className="footer-copyright">© 2026 ImmoConnect. L'art de l'habitat d'exception.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
