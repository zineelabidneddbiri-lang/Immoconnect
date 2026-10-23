import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/dashborduser.css";
import api from "../api";

const navItems = [
  { icon: "dashboard", label: "Dashboard", active: true, filled: true },
  { icon: "support_agent", label: "Conciergerie" },
  { icon: "favorite", label: "Favoris" },
  { icon: "settings", label: "Paramètres" },
  { icon: "logout", label: "Déconnexion" },
];

const defaultImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [demandesList, setDemandesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userJson);
    setUser(parsedUser);
    fetchDashboardData(parsedUser.id);
  }, []);

  const fetchDashboardData = async (userId) => {
    setLoading(true);
    try {
      // Fetch user's listings
      const annoncesResponse = await api.get(`/users/${userId}/annonces`);
      if (annoncesResponse.data.status === "success") {
        const list = annoncesResponse.data.data;
        setPropertiesCount(list.length);
        setPendingCount(list.filter((p) => p.status === "en_attente").length);
      }

      // Fetch user's favorites
      const favsResponse = await api.get(`/users/${userId}/favoris`);
      if (favsResponse.data.status === "success") {
        setFavoritesCount(favsResponse.data.data.length);
      }

      // Fetch user's demandes
      const demandesResponse = await api.get("/demandes");
      if (demandesResponse.data.success) {
        setDemandesList(demandesResponse.data.data.data || []);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
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

  if (!user) {
    return null;
  }

  const kpis = [
    { icon: "apartment", bg: "bg-[#d2bbff]", iconColor: "text-[#630ed4]", label: "Mes annonces", value: propertiesCount },
    { icon: "question_answer", bg: "bg-[#e8ddff]", iconColor: "text-[#674bb5]", label: "Demandes envoyées", value: demandesList.length },
    { icon: "stars", bg: "bg-[#ebddff]", iconColor: "text-[#6129bc]", label: "Favoris", value: favoritesCount, filled: true },
    { icon: "pending_actions", bg: "bg-[#ffdad6]", iconColor: "text-[#ba1a1a]", label: "En attente", value: pendingCount },
  ];

  return (
    <div className="dashboard-container">
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

      {/* Main */}
      <main className="db-main-content">
        {/* Header */}
        <header className="db-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="db-header-title">Tableau de bord</h1>
          </div>
          <div className="db-header-actions">
            <div 
              className="db-header-profile" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <div className="profile-info">
                <p className="profile-name">{user.full_name}</p>
                <p className="profile-badge">{user.role === "admin" ? "Administrateur" : "Client Premium"}</p>
              </div>
              <div className="profile-initials" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#630ed4', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="profile-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.full_name}</p>
                    <p className="dropdown-role">{user.role === "admin" ? "Administrateur" : "Client Premium"}</p>
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

        <div className="content-wrapper">
          {/* Hero */}
          <section className="hero-banner">
            <div className="hero-content">
              <h2 className="hero-title">Bonjour, {user.full_name.split(" ")[0]}</h2>
              <p className="hero-desc">
                Bienvenue dans votre espace personnel. Vous pouvez suivre l'avancement de vos demandes d'intermédiation immobilière et gérer vos coups de cœur.
              </p>
              <div className="hero-actions">
                <button className="btn-banner-primary" onClick={() => navigate("/")}>
                  Rechercher des biens
                </button>
                <button className="btn-banner-secondary" onClick={() => navigate("/dashboard/favoris")}>
                  Mes Favoris
                </button>
              </div>
            </div>
            <div className="hero-circle-1" />
            <div className="hero-circle-2" />
          </section>

          {/* KPIs */}
          <section className="kpi-grid">
            {kpis.map(({ icon, bg, iconColor, label, value, filled }) => (
              <div key={label} className="kpi-card">
                <div className={`kpi-icon-wrapper ${bg}`}>
                  <span className={`material-symbols-outlined ${iconColor} ${filled ? "fill-icon" : ""}`}>{icon}</span>
                </div>
                <p className="kpi-label">{label}</p>
                <p className="kpi-value">{value}</p>
              </div>
            ))}
          </section>

          <div className="dashboard-layout">
            {/* Concierge Table */}
            <div className="layout-table" style={{ width: '100%' }}>
              <div className="table-header-flex">
                <div>
                  <h3 className="table-title">Suivi Intermédiation</h3>
                  <p className="table-subtitle">Suivez l'état de validation de vos demandes de contact par nos administrateurs.</p>
                </div>
              </div>
              
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Chargement des demandes...
                </div>
              ) : demandesList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  Aucune demande envoyée pour le moment.
                </div>
              ) : (
                <div className="table-card">
                  <table className="concierge-table">
                    <thead className="concierge-thead">
                      <tr>
                        {["Bien concerné", "Nom de contact", "État de la demande", "Action"].map((h, i) => (
                          <th key={h} className={`concierge-th ${i === 3 ? "text-right" : ""}`}>{h}</th>
                        ))}
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
                          <tr key={r.id} className="concierge-tr">
                            <td className="concierge-td">
                              <div className="property-cell">
                                <div className="property-image-wrapper">
                                  <img src={propertyImage} alt={r.annonce?.title || "Propriété"} className="property-image" />
                                </div>
                                <span className="property-name">{r.annonce?.title || "Propriété"}</span>
                              </div>
                            </td>
                            <td className="concierge-td client-name">{r.contact_name}</td>
                            <td className="concierge-td">
                              <div className="status-flex">
                                <span className={`status-dot ${r.status === 'acceptee' ? 'bg-green-500' : (r.status === 'refusee' ? 'bg-red-500' : 'bg-amber-500')}`} />
                                <span className={`status-badge ${r.status === 'acceptee' ? 'bg-green-100 text-green-700' : (r.status === 'refusee' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}`}>
                                  {r.status === 'acceptee' ? 'Acceptée' : (r.status === 'refusee' ? 'Refusée' : 'En attente')}
                                </span>
                              </div>
                            </td>
                            <td className="concierge-td text-right">
                              <button className="btn-track" onClick={() => navigate(`/annonce/${r.annonce_id}`)}>Voir le bien</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>ImmoConnect</div>
            <div className="footer-links">
              <Link to="/legal?tab=mentions" className="footer-link">Mentions Légales</Link>
              <Link to="/legal?tab=confidentialite" className="footer-link">Confidentialité</Link>
              <Link to="/legal?tab=cookies" className="footer-link">Cookies</Link>
            </div>
            <p className="footer-copy">© 2026 ImmoConnect. L'art de l'habitat d'exception.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}