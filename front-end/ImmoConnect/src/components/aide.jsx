import { useState, useEffect } from "react";
import "./style/aide.css";
import {
  FaBuilding,
  FaUserCircle,
  FaHome,
  FaCreditCard,
  FaShieldAlt,
  FaGlobe,
  FaShareAlt,
} from "react-icons/fa";

import { IoChevronDown } from "react-icons/io5";

const categories = [
  {
    icon: <FaUserCircle size={30} />,
    title: "Mon Compte",
    description:
      "Gérez vos informations personnelles et préférences.",
  },
  {
    icon: <FaHome size={30} />,
    title: "Annonces",
    description:
      "Publiez, modifiez ou supprimez vos biens immobiliers.",
  },
  {
    icon: <FaCreditCard size={30} />,
    title: "Paiements",
    description:
      "Facturation, abonnements et options de mise en avant.",
  },
  {
    icon: <FaShieldAlt size={30} />,
    title: "Sécurité",
    description:
      "Confidentialité, vérification d'identité et signalements.",
  },
];

const faqs = [
  {
    question:
      "Comment fonctionne la vérification des annonces ?",
    answer:
      "Toutes nos annonces passent par un processus de validation manuel et automatique pour garantir l'authenticité des biens.",
  },
  {
    question:
      "Quels sont les frais pour publier un bien d'exception ?",
    answer:
      "La publication standard est gratuite. Des options premium permettent d'augmenter la visibilité.",
  },
  {
    question:
      "Puis-je modifier mon annonce après sa publication ?",
    answer:
      "Oui, vous pouvez modifier votre annonce à tout moment depuis votre tableau de bord.",
  },
  {
    question:
      "Comment contacter un propriétaire en toute sécurité ?",
    answer:
      "Utilisez notre messagerie interne pour protéger vos données personnelles.",
  },
  {
    question:
      "Comment obtenir de l'aide ou contacter le support ?",
    answer:
      "Si vous avez besoin d'aide ou d'assistance, vous pouvez nous envoyer un message directement depuis le formulaire de contact en bas de cette page de FAQ, ou par email à support@immoconnect.com.",
  },
  {
    question:
      "Comment fonctionne le service de conciergerie ?",
    answer:
      "La conciergerie d'ImmoConnect vous accompagne dans toutes vos démarches de recherche, d'estimation et de validation de biens de luxe.",
  },
  {
    question:
      "Comment créer et publier une nouvelle annonce ?",
    answer:
      "Pour publier une annonce, rendez-vous dans votre espace client, cliquez sur le bouton 'Publier un bien' dans le menu de gauche, et remplissez les informations et coordonnées de votre bien.",
  },
];

import { useNavigate, Link } from "react-router-dom";

export default function Aide() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="aide-container">
      {/* Navbar */}
      <nav className="global-fixed-navbar">
        <div className="global-nav-brand" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined fill-icon">domain</span>
          ImmoConnect
        </div>

        <div className="global-nav-links">
          <Link to="/" className="global-nav-link">Annonces</Link>
          <Link to="/about" className="global-nav-link">À propos</Link>
          <Link to="/aide" className="global-nav-link global-nav-link-active">Aide & FAQ</Link>
        </div>

        <div className="global-nav-actions">
          <button className="global-btn-contact-simple" onClick={() => navigate("/dashboard/demandes")}>
            Conciergerie
          </button>

          {isAuthenticated ? (
            <button className="global-btn-contact" onClick={() => navigate("/dashboard")}>
              Mon Espace
            </button>
          ) : (
            <button className="global-btn-contact" onClick={() => navigate("/login")}>
              Se connecter
            </button>
          )}
        </div>
      </nav>

      <main className="aide-main-content">
        {/* Hero */}
        <section className="hero-section" style={{ paddingBottom: '40px', marginBottom: '40px' }}>
          <h1 className="hero-title">
            Aide - ImmoConnect
          </h1>
        </section>

        {/* Categories */}
        <section className="categories-grid">
          {categories.map((item) => (
            <div
              key={item.title}
              className="category-card"
            >
              <div className="icon-box">
                {item.icon}
              </div>

              <h3 className="category-title">
                {item.title}
              </h3>

              <p className="category-description">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="faq-title">
            Questions populaires
          </h2>

          <div className="faq-list">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="faq-item"
              >
                <summary className="faq-header">
                  {faq.question}
                  <IoChevronDown />
                </summary>

                <div className="faq-content">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-container">
          <div>
            <h3 className="footer-brand">
              ImmoConnect
            </h3>

            <p className="footer-copy">
              © 2026 ImmoConnect
            </p>
          </div>

          <div className="footer-links">
            <Link to="/legal?tab=mentions" className="footer-link">Mentions Légales</Link>
            <Link to="/legal?tab=confidentialite" className="footer-link">Confidentialité</Link>
            <Link to="/legal?tab=cookies" className="footer-link">Cookies</Link>
            <Link to="/legal?tab=presse" className="footer-link">Presse</Link>
          </div>

          <div className="footer-icons">
            <span className="footer-icon-btn" onClick={() => navigate("/")} title="Retourner à l'accueil">
              <FaGlobe />
            </span>
            <span className="footer-icon-btn" onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              alert("Lien du site copié dans le presse-papiers !");
            }} title="Partager le site">
              <FaShareAlt />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}