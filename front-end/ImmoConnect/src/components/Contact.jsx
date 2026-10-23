import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/Contact.css";
import api from "../api";

export default function Contact() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Demande d'information");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // FAQ states
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      setUser(parsedUser);
      setName(parsedUser.full_name || "");
      setEmail(parsedUser.email || "");
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate server request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setMessage("");
      // Reset success banner after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }, 1200);
  };

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: "Comment est mis en lien bien ?",
      a: "Chaque bien publié sur ImmoConnect fait l'objet d'une analyse rigoureuse. Les coordonnées du vendeur ne sont jamais directement communiquées afin de préserver la confidentialité et de garantir une intermédiation sécurisée."
    },
    {
      q: "Quels sont vos frais d'agence ?",
      a: "Nos commissions d'intermédiation varient entre 2% et 5% de la valeur finale de la transaction, couvrant l'analyse juridique complète du bien et l'encadrement du séquestre."
    },
    {
      q: "Proposez-vous des biens hors-marché ?",
      a: "Oui, la majorité de notre catalogue d'exception (riads historiques à Marrakech, lofts exclusifs à Anfa) est confidentiel et n'apparaît que sur demande expresse auprès de nos curateurs."
    }
  ];

  return (
    <div className="contact-container">
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
          <Link to="/about" className="global-nav-link">
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
      <main className="contact-main">
        <section className="contact-hero">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Entrons en contact.</h1>
            <p className="contact-hero-desc">
              Une question sur un bien d'exception ou besoin d'un accompagnement personnalisé ? 
              Notre équipe de curateurs est à votre entière disposition.
            </p>
          </div>
        </section>

        <section className="contact-layout">
          {/* Left Form */}
          <div className="contact-form-wrapper">
            <div>
              <h2 className="contact-form-title">Envoyez-nous un message</h2>
              <p className="contact-form-desc">Nous vous répondrons sous 24 heures ouvrées.</p>
            </div>

            {success && (
              <div className="success-banner" style={{
                padding: "12px 16px",
                backgroundColor: "var(--success-bg)",
                borderLeft: "4px solid var(--success-color)",
                color: "var(--success-text)",
                borderRadius: "4px",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}>
                ✓ Votre message a bien été envoyé ! Un curateur vous contactera très prochainement.
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="form-group-list">
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input 
                  type="text" 
                  className="form-input-text" 
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input-text" 
                  placeholder="jean@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sujet</label>
                <select 
                  className="form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="Demande d'information">Demande d'information</option>
                  <option value="Estimation de bien">Estimation de bien</option>
                  <option value="Support technique">Support technique / FAQ</option>
                  <option value="Autre">Autre demande</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-form-submit" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le message"}
              </button>
            </form>
          </div>

          {/* Right Info Column */}
          <div className="contact-info-col">
            <div className="info-card">
              <h2 className="info-card-title">Informations de contact</h2>

              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <span className="info-label">Téléphone</span>
                    <p className="info-value">+212 (0) 5 22 45 67 89</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <span className="info-label">Email</span>
                    <p className="info-value">concierge@immoconnect.ma</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <span className="info-label">Siège social</span>
                    <p className="info-value">12 Boulevard d'Anfa, 20250 Casablanca, Maroc</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <a href="#" className="social-btn"><span className="material-symbols-outlined">share</span></a>
                <a href="#" className="social-btn"><span className="material-symbols-outlined">language</span></a>
                <a href="#" className="social-btn"><span className="material-symbols-outlined">alternate_email</span></a>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="faq-section">
              <h2 className="faq-title">Questions fréquentes</h2>
              <div className="faq-list">
                {faqs.map((faq, i) => (
                  <div key={i} className={`faq-item ${activeFaq === i ? "faq-active" : ""}`}>
                    <button className="faq-trigger" type="button" onClick={() => toggleFaq(i)}>
                      {faq.q}
                      <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </button>
                    {activeFaq === i && (
                      <div className="faq-content">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="contact-map-card">
              <span className="map-placeholder-text">Voir sur Google Maps</span>
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
                className="map-image" 
                alt="Carte Casablanca Anfa"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
