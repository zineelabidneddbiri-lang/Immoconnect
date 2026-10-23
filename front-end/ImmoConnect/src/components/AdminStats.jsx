import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/AdminStats.css";
import api from "../api";

export default function AdminStats() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [statTab, setStatTab] = useState("30"); // 7 or 30 days
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

  // Mock charts values
  const userGrowth30Days = [
    { label: "01 Juin", val: 30, count: 12 },
    { label: "05 Juin", val: 45, count: 24 },
    { label: "10 Juin", val: 60, count: 38 },
    { label: "15 Juin", val: 55, count: 32 },
    { label: "20 Juin", val: 75, count: 56 },
    { label: "25 Juin", val: 90, count: 72 },
    { label: "30 Juin", val: 100, count: 95 }
  ];

  const userGrowth7Days = [
    { label: "Lun", val: 40, count: 5 },
    { label: "Mar", val: 55, count: 12 },
    { label: "Mer", val: 70, count: 18 },
    { label: "Jeu", val: 65, count: 15 },
    { label: "Ven", val: 80, count: 25 },
    { label: "Sam", val: 95, count: 34 },
    { label: "Dim", val: 100, count: 42 }
  ];

  const activeGrowthData = statTab === "30" ? userGrowth30Days : userGrowth7Days;

  return (
    <div className="stats-container">
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
            <Link to="/admin/stats" className="admin-menu-item admin-menu-item-active">
              <span className="material-symbols-outlined">analytics</span>
              Statistiques
            </Link>
            <Link to="/admin/settings" className="admin-menu-item">
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
            <h1>Statistiques & Rapports</h1>
            <p>Produit la vue d'ensemble des performances du catalogue et des transactions sécurisées.</p>
          </div>
        </section>

        {/* KPI Row */}
        <section className="stats-kpis">
          <div className="kpi-stat-card">
            <div className="kpi-stat-header">
              <span>Revenus Mensuels</span>
              <span className="material-symbols-outlined" style={{ color: "var(--primary-color)" }}>trending_up</span>
            </div>
            <span className="kpi-stat-value">48 290 MAD</span>
            <div className="kpi-stat-growth growth-positive">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_upward</span>
              +12% ce mois
            </div>
          </div>

          <div className="kpi-stat-card">
            <div className="kpi-stat-header">
              <span>Commission Totale</span>
              <span className="material-symbols-outlined" style={{ color: "var(--primary-color)" }}>account_balance_wallet</span>
            </div>
            <span className="kpi-stat-value">1 245 000 MAD</span>
            <div className="kpi-stat-growth growth-positive">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_upward</span>
              +8.4% global
            </div>
          </div>

          <div className="kpi-stat-card">
            <div className="kpi-stat-header">
              <span>Taux de Conversion</span>
              <span className="material-symbols-outlined" style={{ color: "var(--primary-color)" }}>percent</span>
            </div>
            <span className="kpi-stat-value">4.2 %</span>
            <div className="kpi-stat-growth growth-negative">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_downward</span>
              -0.2% vs hier
            </div>
          </div>
        </section>

        {/* Charts Row */}
        <section className="charts-grid-row">
          {/* User growth bars */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2 className="chart-card-title">Croissance des utilisateurs</h2>
              
              <div className="chart-tab-actions">
                <button 
                  className={`chart-tab-btn ${statTab === "7" ? "chart-tab-btn-active" : ""}`} 
                  onClick={() => setStatTab("7")}
                >
                  7 jours
                </button>
                <button 
                  className={`chart-tab-btn ${statTab === "30" ? "chart-tab-btn-active" : ""}`} 
                  onClick={() => setStatTab("30")}
                >
                  30 jours
                </button>
              </div>
            </div>

            <div className="bar-chart-mockup">
              {activeGrowthData.map((data, idx) => (
                <div key={idx} className="chart-bar-container">
                  <div 
                    className={`chart-bar-pillar ${idx === activeGrowthData.length - 1 ? "chart-bar-pillar-active" : ""}`} 
                    style={{ height: `${data.val * 1.8}px` }}
                  >
                    <span className="chart-bar-tooltip">{data.count} inscrits</span>
                  </div>
                  <span className="chart-bar-label">{data.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Types Donut chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2 className="chart-card-title">Types de biens</h2>
            </div>
            
            <div className="donut-chart-mockup">
              <div className="donut-graphic">
                <div className="donut-inner-hole">
                  <span className="donut-inner-total">1 248</span>
                  <span className="donut-inner-label">Biens</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "var(--primary-color)" }} />
                  <span>Villas</span>
                  <span className="legend-percent">65%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#a78bfa" }} />
                  <span>Apparts</span>
                  <span className="legend-percent">35%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transactions Card */}
        <section className="chart-card monthly-transactions-card">
          <div className="chart-card-header">
            <h2 className="chart-card-title">Transactions Mensuelles</h2>
          </div>

          <div className="transaction-chart-bars">
            {[35, 45, 60, 40, 50, 70, 85, 90, 100, 110, 95, 120].map((val, idx) => {
              const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
              return (
                <div key={idx} className="chart-bar-container" style={{ width: "6%" }}>
                  <div className="chart-bar-pillar trans-bar-pillar" style={{ height: `${val * 1.1}px` }}>
                    <span className="chart-bar-tooltip">{val} ventes</span>
                  </div>
                  <span className="chart-bar-label">{months[idx]}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
