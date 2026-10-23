import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style/adminDashbord.css";
import api from "../api";

import {
  FaHome,
  FaHeart,
  FaCog,
  FaSignOutAlt,
  FaQuestionCircle,
  FaBell,
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaBuilding,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";

import { MdDashboard, MdMail } from "react-icons/md";

import {
  IoSearch,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

const defaultImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all"); // all, validee, en_attente, refusee
  const [searchQuery, setSearchQuery] = useState("");
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

  const [stats, setStats] = useState([
    { title: "Total", value: "0" },
    { title: "Validées", value: "0" },
    { title: "En attente", value: "0" },
    { title: "Refusées", value: "0" },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userJson);
    if (parsedUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    fetchProperties();
    fetchStats();
  }, [currentPage, activeStatus]);

  const fetchStats = async () => {
    try {
      const [allRes, valRes, pendRes, refRes] = await Promise.all([
        api.get("/annonces", { params: { status: "all" } }),
        api.get("/annonces", { params: { status: "validee" } }),
        api.get("/annonces", { params: { status: "en_attente" } }),
        api.get("/annonces", { params: { status: "refusee" } }),
      ]);

      setStats([
        { title: "Total", value: allRes.data.data.total || 0 },
        { title: "Validées", value: valRes.data.data.total || 0 },
        { title: "En attente", value: pendRes.data.data.total || 0 },
        { title: "Refusées", value: refRes.data.data.total || 0 },
      ]);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        status: activeStatus,
        city: searchQuery || undefined,
      };
      const response = await api.get("/annonces", { params });
      if (response.data.status === "success") {
        setPropertiesList(response.data.data.data);
        setLastPage(response.data.data.last_page);
        setTotalCount(response.data.data.total);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProperties();
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/annonces/${id}`, { status: "validee" });
      fetchProperties();
      fetchStats();
    } catch (err) {
      console.error("Error approving property:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/annonces/${id}`, { status: "refusee" });
      fetchProperties();
      fetchStats();
    } catch (err) {
      console.error("Error rejecting property:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      try {
        await api.delete(`/annonces/${id}`);
        fetchProperties();
        fetchStats();
      } catch (err) {
        console.error("Error deleting property:", err);
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

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar-aside">
        <div className="admin-sidebar-content">
          <div className="admin-logo-wrapper" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <FaBuilding className="admin-logo-icon" />
            ImmoConnect
          </div>

          <div className="admin-nav-list">
            <NavItem active icon={<MdDashboard />} text="Dashboard" onClick={() => navigate("/admin")} />
            <NavItem icon={<FaUsers />} text="Utilisateurs" onClick={() => navigate("/admin/utilisateurs")} />
            <NavItem icon={<FaChartBar />} text="Statistiques" onClick={() => navigate("/admin/stats")} />
            <NavItem icon={<FaCog />} text="Paramètres" onClick={() => navigate("/admin/settings")} />
          </div>

          <button className="admin-btn-publish-property" onClick={() => navigate("/dashboard/publier")}>
            Publier un bien
          </button>
        </div>

        <div className="admin-sidebar-footer" style={{ position: "relative" }}>
          <NavItem
            icon={<FaQuestionCircle />}
            text="Aide"
            onClick={() => navigate("/aide")}
          />

          {user && (
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
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="admin-user-name" style={{ fontWeight: "700", color: "#ffffff" }}>{user.full_name}</p>
                  <p className="admin-user-role" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>Administrateur</p>
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

          <NavItem
            icon={<FaSignOutAlt />}
            text="Déconnexion"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Content */}
      <main className="admin-main-content">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-flex">
            <h1 className="admin-header-title">
              Gestion des Annonces - Admin
            </h1>

            <div className="admin-header-actions">
              <form onSubmit={handleSearch} className="search-container">
                <IoSearch
                  size={18}
                  className="search-icon"
                />

                <input
                  type="text"
                  placeholder="Filtrer par ville..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-buttons">
            <button 
              className={activeStatus === "all" ? "filter-active" : "filter-btn"}
              onClick={() => { setActiveStatus("all"); setCurrentPage(1); }}
            >
              Toutes
            </button>

            <button 
              className={activeStatus === "validee" ? "filter-active" : "filter-btn"}
              onClick={() => { setActiveStatus("validee"); setCurrentPage(1); }}
            >
              Validée
            </button>

            <button 
              className={activeStatus === "en_attente" ? "filter-active" : "filter-btn"}
              onClick={() => { setActiveStatus("en_attente"); setCurrentPage(1); }}
            >
              En attente
            </button>

            <button 
              className={activeStatus === "refusee" ? "filter-active" : "filter-btn"}
              onClick={() => { setActiveStatus("refusee"); setCurrentPage(1); }}
            >
              Refusée
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-section">
          {stats.map((item) => (
            <div
              key={item.title}
              className="stat-card"
            >
              <p className="stat-title">
                {item.title}
              </p>

              <h2 className="stat-value">
                {item.value}
              </h2>
            </div>
          ))}
        </section>

        {/* Table */}
        <section className="table-section">
          <div className="table-card">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Chargement des annonces...
              </div>
            ) : propertiesList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Aucune annonce trouvée.
              </div>
            ) : (
              <table className="property-table">
                <thead className="table-thead">
                  <tr>
                    <th className="table-head">Bien</th>
                    <th className="table-head">Propriétaire</th>
                    <th className="table-head">Prix</th>
                    <th className="table-head">Date</th>
                    <th className="table-head">Statut</th>
                    <th className="table-head text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {propertiesList.map((property) => {
                    const hasImage = property.image_annonce && property.image_annonce.length > 0;
                    const propertyImage = hasImage 
                      ? (property.image_annonce[0].image_path.startsWith('http') 
                          ? property.image_annonce[0].image_path 
                          : `http://127.0.0.1:8000/storage/${property.image_annonce[0].image_path}`)
                      : defaultImg;

                    return (
                      <tr
                        key={property.id}
                        className="table-row"
                      >
                        <td className="property-td">
                          <div className="property-flex">
                            <img
                              src={propertyImage}
                              alt={property.title}
                              className="property-img"
                            />

                            <div>
                              <h3 className="property-info-title">
                                {property.title}
                              </h3>

                              <p className="property-location">
                                {property.city}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>{property.user?.full_name || "Inconnu"}</td>

                        <td className="font-semibold">
                          {Number(property.price).toLocaleString()} MAD
                        </td>

                        <td>{new Date(property.created_at).toLocaleDateString()}</td>

                        <td>
                          <StatusBadge
                            status={property.status}
                          />
                        </td>

                        <td>
                          <div className="actions-td-wrapper">
                            <button 
                              className="action-btn hover:text-violet-600"
                              onClick={() => navigate(`/annonce/${property.id}`)}
                              title="Voir le bien"
                            >
                              <FaEye />
                            </button>

                            {property.status !== "validee" && (
                              <button 
                                className="action-btn hover:text-green-500"
                                onClick={() => handleApprove(property.id)}
                                title="Valider"
                              >
                                <FaCheck />
                              </button>
                            )}

                            {property.status !== "refusee" && (
                              <button 
                                className="action-btn hover:text-amber-500"
                                onClick={() => handleReject(property.id)}
                                title="Refuser"
                              >
                                <FaTimes />
                              </button>
                            )}

                            <button 
                              className="action-btn hover:text-red-500"
                              onClick={() => handleDelete(property.id)}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="pagination-container">
                <p className="pagination-info">
                  Affichage de la page {currentPage} sur {lastPage}
                </p>

                <div className="pagination-btns">
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <IoChevronBack />
                  </button>

                  {Array.from({ length: lastPage }, (_, idx) => idx + 1).map((n) => (
                    <button
                      key={n}
                      className={currentPage === n ? "page-btn active-page" : "page-btn"}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                    disabled={currentPage === lastPage}
                  >
                    <IoChevronForward />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`admin-nav-item-btn ${
        active ? "admin-nav-item-active" : "admin-nav-item-inactive"
      }`}
    >
      {icon}
      {text}
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === "validee" || status === "Validée") {
    return (
      <span className="badge-success">
        Acceptée
      </span>
    );
  }

  if (status === "en_attente" || status === "En attente") {
    return (
      <span className="badge-warning">
        En attente
      </span>
    );
  }

  return (
    <span className="badge-danger">
      Refusée
    </span>
  );
}