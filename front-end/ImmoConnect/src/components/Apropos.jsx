import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/Apropos.css";
import api from "../api";

export default function Apropos() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/logged-out");
    }
  };

  return (
    <div className="apropos-container">
      {/* Navbar */}
      <nav className="global-fixed-navbar">
        <div className="global-nav-brand" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined fill-icon">domain</span>
          ImmoConnect
        </div>
        <div className="global-nav-links">
          <Link to="/" className="global-nav-link">
            Annonces
          </Link>
          <Link to="/about" className="global-nav-link global-nav-link-active">
            À propos
          </Link>
          <Link to="/aide" className="global-nav-link">
            Aide & FAQ
          </Link>
        </div>
        <div className="global-nav-actions">
          {user ? (
            <>
              <button className="global-btn-connect" onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
                Tableau de bord
              </button>
              <button className="global-btn-contact" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button className="global-btn-connect" onClick={() => navigate("/login")}>
                Se connecter
              </button>
              <button className="global-btn-contact" onClick={() => navigate("/login")}>
                Publier
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="about-main">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-hero-title">
              Redéfinir l'art de l'acquisition <br />
              immobilière d'exception.
            </h1>
            <p className="about-hero-desc">
              ImmoConnect fusionne l'expertise immobilière traditionnelle avec une 
              technologie de curation avancée pour offrir une expérience sans couture.
            </p>
            <button className="btn-about-hero" onClick={() => navigate("/")}>
              Découvrir nos biens
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats">
          <div className="stat-item">
            <span className="stat-number">1 248</span>
            <span className="stat-label">Annonces actives</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3 400+</span>
            <span className="stat-label">Utilisateurs vérifiés</span>
          </div>
        </section>

        {/* Piliers */}
        <section className="about-piliers">
          <h2 className="section-title">Nos piliers fondamentaux</h2>
          <p className="section-desc">
            Chaque transaction sur ImmoConnect est guidée par notre engagement 
            envers l'excellence opérationnelle.
          </p>

          <div className="piliers-grid">
            <div className="pilier-card">
              <div className="pilier-icon-wrapper">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h3 className="pilier-title">Sécurité</h3>
              <p className="pilier-desc">
                Protocoles de vérification rigoureux pour garantir l'intégrité de chaque transaction.
              </p>
            </div>

            <div className="pilier-card">
              <div className="pilier-icon-wrapper">
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <h3 className="pilier-title">Confiance</h3>
              <p className="pilier-desc">
                Transparence totale sur les historiques et notation des acheteurs et des vendeurs.
              </p>
            </div>

            <div className="pilier-card">
              <div className="pilier-icon-wrapper">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h3 className="pilier-title">Efficacité</h3>
              <p className="pilier-desc">
                Des outils intelligents pour accélérer votre recherche sans compromis sur la qualité.
              </p>
            </div>
          </div>
        </section>

        {/* Parcours */}
        <section className="about-parcours">
          <div className="parcours-container">
            <h2 className="section-title" style={{ textAlign: "center" }}>Le parcours ImmoConnect</h2>
            <p className="section-desc" style={{ textAlign: "center" }}>
              Un processus fluide conçu pour éliminer la frustration entre le désir et l'acquisition.
            </p>

            <div className="parcours-grid">
              <div className="parcours-card">
                <span className="step-num">01. Exploration</span>
                <h3 className="step-title">Découvrez</h3>
                <p className="step-desc">
                  Naviguez parmi des sélections exclusives adaptées à votre style de vie.
                </p>
              </div>

              <div className="parcours-card">
                <span className="step-num">02. Connexion</span>
                <h3 className="step-title">Échangez</h3>
                <p className="step-desc">
                  Contactez directement la plateforme via notre interface sécurisée d'intermédiation.
                </p>
              </div>

              <div className="parcours-card">
                <span className="step-num">03. Vérification</span>
                <h3 className="step-title">Certifiez</h3>
                <p className="step-desc">
                  Nos experts examinent la conformité juridique et technique du bien.
                </p>
              </div>

              <div className="parcours-card parcours-card-highlight">
                <span className="step-num">04. Finalisation</span>
                <h3 className="step-title">Réalisez</h3>
                <p className="step-desc">
                  Concluez la transaction en toute sécurité avec notre accompagnement personnalisé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Model */}
        <section className="about-model">
          <div className="model-image-wrapper">
            <span className="material-symbols-outlined model-illustration">encrypted</span>
          </div>

          <div className="model-content">
            <span className="model-badge">Le modèle d'intermédiation</span>
            <h2 className="model-title">
              Une protection institutionnelle <br />
              pour des transactions privées.
            </h2>
            <p className="model-desc">
              Chez ImmoConnect, nous ne nous contentons pas de mettre en relation des acheteurs et des vendeurs.
              Nous agissons comme un tiers de confiance structurant.
            </p>

            <div className="model-features">
              <div className="model-feature">
                <div className="model-feature-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h4 className="model-feature-title">Séquestre Sécurisé</h4>
                  <p className="model-feature-desc">Fonds protégés jusqu'à la signature finale.</p>
                </div>
              </div>

              <div className="model-feature">
                <div className="model-feature-icon">
                  <span className="material-symbols-outlined">rule</span>
                </div>
                <div>
                  <h4 className="model-feature-title">Analyse de Conformité</h4>
                  <p className="model-feature-desc">Audit complet des diagnostics et titres de propriété.</p>
                </div>
              </div>

              <div className="model-feature">
                <div className="model-feature-icon">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h4 className="model-feature-title">Médiation Experte</h4>
                  <p className="model-feature-desc">Support multilingue pour faciliter les accords complexes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="about-cta">
          <h2 className="cta-title">Prêt à trouver votre prochain chef-d'œuvre ?</h2>
          <p className="cta-desc">
            Reignez une élite de curateurs et découvrez des propriétés qui racontent une histoire.
          </p>
          <button className="btn-cta" onClick={() => navigate("/")}>
            Explorer le catalogue
          </button>
        </section>
      </main>
    </div>
  );
}
