import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./style/LegalPage.css";

const tabMetadata = [
  { id: "mentions", label: "Mentions Légales", icon: "gavel" },
  { id: "confidentialite", label: "Confidentialité", icon: "security" },
  { id: "cookies", label: "Gestion des Cookies", icon: "cookie" },
  { id: "presse", label: "Espace Presse", icon: "newspaper" },
];

export default function LegalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("mentions");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");
    if (tabParam && tabMetadata.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/legal?tab=${tabId}`);
  };

  return (
    <div className="legal-container">
      {/* Hero Header */}
      <header className="legal-hero">
        <div className="legal-hero-content">
          <button className="btn-back-home" onClick={() => navigate("/")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Retour à l'accueil
          </button>
          <h1 className="legal-hero-title">Centre de Confidentialité & Légal</h1>
          <p className="legal-hero-subtitle">
            Consultez les conditions légales, notre charte de protection de la vie privée et de gestion des cookies.
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="legal-layout">
        {/* Navigation Tabs */}
        <aside className="legal-tabs">
          {tabMetadata.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`legal-tab-btn ${activeTab === tab.id ? "legal-tab-btn-active" : ""}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Card */}
        <div className="legal-content-card">
          {activeTab === "mentions" && (
            <div className="legal-content-section">
              <div className="legal-title-group">
                <h2>Mentions Légales</h2>
                <p className="legal-last-updated">Dernière mise à jour : 14 Juin 2026</p>
              </div>
              <div className="legal-richtext">
                <h3>1. Éditeur de la Plateforme</h3>
                <p>
                  Le site internet <strong>ImmoConnect</strong> est édité par la société <strong>ImmoConnect SAS</strong>, 
                  société par actions simplifiée au capital de 100 000 MAD, dont le siège social est situé à 
                  Casablanca, Boulevard Anfa, immatriculée au Registre du Commerce de Casablanca sous le numéro RC 123456.
                </p>
                <p>
                  <strong>Directeur de la publication :</strong> Assia Connect, Présidente Directrice Générale.
                </p>

                <h3>2. Hébergement</h3>
                <p>
                  Ce site est hébergé par la société <strong>Amazon Web Services (AWS) Europe</strong>, 
                  dont les serveurs sont situés au sein de l'Union Européenne, garantissant un haut niveau de 
                  sécurité et de conformité réglementaire.
                </p>

                <h3>3. Propriété Intellectuelle</h3>
                <p>
                  L'ensemble des contenus (textes, graphismes, logos, photos, vidéos, icônes) présents sur le site 
                  ImmoConnect sont la propriété exclusive de la société ImmoConnect SAS ou de ses partenaires. 
                  Toute reproduction ou diffusion non autorisée constitue une contrefaçon sanctionnée par la loi.
                </p>

                <h3>4. Contact</h3>
                <p>
                  Pour toute question concernant l'utilisation du site, vous pouvez nous écrire directement à : 
                  <a href="mailto:legal@immoconnect.com" style={{ color: "var(--primary-color)", marginLeft: "4px" }}>legal@immoconnect.com</a>.
                </p>
              </div>
            </div>
          )}

          {activeTab === "confidentialite" && (
            <div className="legal-content-section">
              <div className="legal-title-group">
                <h2>Politique de Confidentialité</h2>
                <p className="legal-last-updated">Dernière mise à jour : 14 Juin 2026</p>
              </div>
              <div className="legal-richtext">
                <h3>1. Collecte des Données Personnelles</h3>
                <p>
                  Nous collectons uniquement les données personnelles strictement nécessaires à la fourniture de nos services, notamment :
                </p>
                <ul>
                  <li>Vos informations de profil (Nom, Email, Téléphone, Ville) lors de la création d'un compte.</li>
                  <li>Vos critères et biens favoris afin de personnaliser vos alertes et espaces de recherche.</li>
                  <li>Vos coordonnées dans le cadre des demandes d'intermédiation avec nos courtiers partenaires.</li>
                </ul>

                <h3>2. Utilisation de vos Données</h3>
                <p>
                  Vos données personnelles sont traitées pour les finalités suivantes :
                </p>
                <ul>
                  <li>La gestion et la sécurisation de votre compte client.</li>
                  <li>La mise en relation pour les demandes de contact de biens immobiliers (Conciergerie).</li>
                  <li>L'amélioration technique et fonctionnelle de notre application.</li>
                </ul>

                <h3>3. Vos Droits d'Accès, de Rectification et de Suppression</h3>
                <p>
                  Conformément à la réglementation relative à la protection des données personnelles, vous disposez d'un droit total d'accès, de modification et de suppression de vos données :
                </p>
                <p>
                  Vous pouvez à tout moment modifier vos informations depuis l'onglet <strong>Paramètres</strong>. 
                  De plus, nous mettons à votre disposition une option de <strong>suppression définitive de compte</strong> directement accessible dans le menu utilisateur. 
                  Cette action supprimera irrévocablement toutes vos informations de nos serveurs sous 24 heures.
                </p>

                <h3>4. Partage avec des Tiers</h3>
                <p>
                  Vos données ne sont jamais vendues ou partagées avec des tiers à des fins publicitaires. 
                  Elles sont partagées uniquement avec nos conseillers agréés pour le traitement de vos demandes de visite de biens.
                </p>
              </div>
            </div>
          )}

          {activeTab === "cookies" && (
            <div className="legal-content-section">
              <div className="legal-title-group">
                <h2>Gestion des Cookies</h2>
                <p className="legal-last-updated">Dernière mise à jour : 14 Juin 2026</p>
              </div>
              <div className="legal-richtext">
                <h3>1. Qu'est-ce qu'un cookie ?</h3>
                <p>
                  Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou mobile) lors de la visite d'un site internet. 
                  Il permet à son émetteur d'identifier le terminal et de mémoriser des préférences.
                </p>

                <h3>2. Les cookies que nous utilisons</h3>
                <p>
                  Nous utilisons principalement des cookies fonctionnels essentiels au fonctionnement de la plateforme :
                </p>
                <ul>
                  <li><strong>Cookies de session (Authentification) :</strong> Permettent de maintenir votre connexion active d'une page à l'autre sans devoir vous reconnecter.</li>
                  <li><strong>Cookies de préférences :</strong> Conservent vos filtres de recherche ou l'état d'ouverture de votre menu sidebar mobile.</li>
                  <li><strong>Cookies de géolocalisation :</strong> Mémorisent vos préférences géographiques pour charger la carte interactive de Marrakech, Casablanca, etc.</li>
                </ul>

                <h3>3. Désactivation des cookies</h3>
                <p>
                  Vous pouvez à tout moment configurer votre navigateur pour bloquer les cookies ou être informé de leur dépôt. 
                  Notez cependant que bloquer nos cookies de session vous empêchera de vous connecter à votre espace personnel.
                </p>
              </div>
            </div>
          )}

          {activeTab === "presse" && (
            <div className="legal-content-section">
              <div className="legal-title-group">
                <h2>Espace Presse</h2>
                <p className="legal-last-updated">Dernière mise à jour : 14 Juin 2026</p>
              </div>
              <div className="legal-richtext">
                <h3>1. À propos d'ImmoConnect</h3>
                <p>
                  Fondée en 2026, <strong>ImmoConnect</strong> réinvente l'accès à l'immobilier d'exception et haut de gamme. 
                  Grâce à des outils cartographiques de pointe et un service de conciergerie personnalisé, nous offrons à nos clients premium 
                  une expérience fluide et confidentielle pour acquérir leurs biens coups de cœur.
                </p>

                <h3>2. Communiqués de Presse</h3>
                <p>
                  Retrouvez nos dernières actualités économiques, nos levées de fonds et nos innovations technologiques :
                </p>
                <ul>
                  <li><strong>Juin 2026 :</strong> Lancement national de notre service de carte interactive de biens immobiliers avec Leaflet.</li>
                  <li><strong>Mars 2026 :</strong> Levée de fonds de 5 Millions MAD pour accélérer notre développement en Afrique du Nord.</li>
                </ul>

                <h3>3. Kit Média</h3>
                <p>
                  Vous êtes journaliste ou créateur de contenu ? Vous pouvez télécharger nos logos HD, charte graphique et pack de photographies 
                  officielles en écrivant à : 
                  <a href="mailto:press@immoconnect.com" style={{ color: "var(--primary-color)", marginLeft: "4px" }}>press@immoconnect.com</a>.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
