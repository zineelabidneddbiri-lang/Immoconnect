import { useState, useEffect } from "react";
import "./style/favories.css";
import api from "../api";

const filters = ["Tout", "Villas", "Appartements", "Terrains"];

const navItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "support_agent", label: "Conciergerie" },
  { icon: "favorite", label: "Favoris", active: true, filled: true },
  { icon: "settings", label: "Paramètres" },
  { icon: "logout", label: "Déconnexion" },
];

const defaultImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

import { useNavigate, Link } from "react-router-dom";

export default function Favorites() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchFavorites(parsedUser.id);
  }, []);

  const fetchFavorites = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${userId}/favoris`);
      if (response.data.status === "success") {
        setFavorites(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      const response = await api.delete(`/favoris/${id}`);
      if (response.data.status === "success") {
        setFavorites((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
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

  const displayed = favorites
    .filter((p) => {
      if (activeFilter === "Tout") return true;
      if (activeFilter === "Villas") return p.property_type === "maison";
      if (activeFilter === "Appartements") return p.property_type === "appartement";
      if (activeFilter === "Terrains") return p.property_type === "terrain";
      return true;
    });

  if (!user) return null;

  return (
    <div className="favorites-container">
      <div className="split-layout">
        {/* Sidebar */}
        <aside className={`client-sidebar-aside ${sidebarOpen ? "client-sidebar-open" : ""}`}>
          <div className="client-sidebar-profile-box" style={{ position: 'relative' }}>
            <button className="mobile-menu-close" onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: '10px', right: '10px', margin: 0 }}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="client-sidebar-profile-flex" onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')} style={{ cursor: "pointer", marginTop: '24px' }}>
              <div className="profile-initials" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#630ed4', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', marginRight: '12px' }}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p className="client-sidebar-profile-name">{user.full_name.split(" ")[0]}</p>
                <p className="client-sidebar-profile-badge">{user.role === "admin" ? "Administrateur" : "Client Premium"}</p>
              </div>
            </div>
            <button className="btn-publish-property" onClick={() => navigate("/dashboard/publier")}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Publier un bien
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
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/aide"); }} className="client-sidebar-footer-link">
              <span className="material-symbols-outlined">help</span>
              Aide
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="client-sidebar-footer-link">
              <span className="material-symbols-outlined">logout</span>
              Déconnexion
            </a>
          </div>
        </aside>

        <main className="fav-main-content">
          {/* Header */}
          <header className="fav-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="fav-header-title">
                Mes Favoris
              </h1>
              <p className="header-subtitle">
                Vous avez{" "}
                <span className="header-span-count">{favorites.length} {favorites.length > 1 ? 'propriétés' : 'propriété'}</span>{" "}
                sauvegardées dans votre collection.
              </p>
            </div>
            <div className="filters-wrapper">
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`filter-btn ${
                    activeFilter === f
                      ? "filter-btn-active"
                      : "filter-btn-inactive"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </header>

          {/* Cards Grid */}
          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
              Chargement de vos favoris...
            </div>
          ) : displayed.length > 0 ? (
            <section className="cards-grid">
              {displayed.map((p) => {
                const hasImage = p.image_annonce && p.image_annonce.length > 0;
                const propertyImage = hasImage 
                  ? (p.image_annonce[0].image_path.startsWith('http') 
                      ? p.image_annonce[0].image_path 
                      : `http://127.0.0.1:8000/storage/${p.image_annonce[0].image_path}`)
                  : defaultImg;

                return (
                  <div key={p.id} className="card-root" onClick={() => navigate(`/annonce/${p.id}`)} style={{ cursor: "pointer" }}>
                    <div className="card-image-wrapper">
                      <img src={propertyImage} alt={p.title} className="card-img" />
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(p.id); }}
                        className="remove-btn"
                        title="Retirer des favoris"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                      <div className="card-tag-wrapper">
                        <span className="card-tag">
                          {p.listing_type === "vente" ? "Vente" : "Location"}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card-header">
                        <h3 className="card-title">{p.title}</h3>
                        <span className="card-price">{Number(p.price).toLocaleString()} MAD</span>
                      </div>
                      <p className="card-location">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {p.city}
                      </p>
                      <div className="card-details">
                        <span className="card-detail-item">
                          <span className="material-symbols-outlined text-[16px]">bed</span> {p.rooms || 0} Ch.
                        </span>
                        <span className="card-detail-item">
                          <span className="material-symbols-outlined text-[16px]">bathtub</span> {p.bathrooms || 0} Sdb.
                        </span>
                        <span className="card-detail-item">
                          <span className="material-symbols-outlined text-[16px]">square_foot</span> {p.surface_area || 0} m²
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            /* Empty State */
            <section className="empty-state-section">
              <div className="empty-state-icon-wrapper">
                <div className="empty-state-icon-blur" />
                <div className="empty-state-icon-circle">
                  <span className="material-symbols-outlined empty-state-icon fill-icon">favorite</span>
                </div>
              </div>
              <h2 className="empty-state-title">Votre collection est vide</h2>
              <p className="empty-state-desc">
                Commencez à explorer nos propriétés d'exception et ajoutez-les à vos favoris pour les retrouver ici.
              </p>
              <button
                onClick={() => navigate("/")}
                className="btn-explore"
              >
                Explorer les annonces
              </button>
            </section>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">ImmoConnect</div>
          <div className="footer-links">
            {["Mentions Légales", "Confidentialité", "Cookies", "Presse"].map((l) => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
          <p className="footer-copy">© 2026 ImmoConnect. L'art de l'habitat d'exception.</p>
        </div>
      </footer>
    </div>
  );
}