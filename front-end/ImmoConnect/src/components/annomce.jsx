import { useState, useEffect } from "react";
import "./style/annomce.css";
import {
  FaBuilding,
  FaShareAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCar,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { MdStairs } from "react-icons/md";
import api from "../api";

const features = [
  "Piscine privée",
  "Climatisation centrale",
  "Cuisine équipée",
  "Domotique",
  "Chambre de service",
  "Sécurité 24/7",
];

import { useParams, useNavigate, Link } from "react-router-dom";

export default function PropertyDetails({ onNavigate, annonceId }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const activeId = id || annonceId;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  // Contact form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setFullName(user.full_name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
      }
    }
    fetchPropertyDetails();
  }, [activeId]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr && activeId) {
        const user = JSON.parse(userStr);
        try {
          const response = await api.get(`/users/${user.id}/favoris`);
          if (response.data.status === "success") {
            const list = response.data.data;
            setIsLiked(list.some(fav => fav.id === parseInt(activeId)));
          }
        } catch (err) {
          console.error("Error checking favorite status:", err);
        }
      }
    };
    checkFavoriteStatus();
  }, [activeId, isAuthenticated]);

  useEffect(() => {
    if (!property) return;

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    document.body.appendChild(script);

    let map;

    script.onload = () => {
      const L = window.L;
      if (!L) return;

      const cityCenters = {
        Marrakech: [31.6295, -7.9811],
        Casablanca: [33.5731, -7.5898],
        Rabat: [34.0208, -6.8416],
        Tanger: [35.7595, -5.8340],
        Essaouira: [31.5125, -9.7700],
      };

      // Extract coordinates from address if possible
      let coords = null;
      if (property.address) {
        const match = property.address.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
        if (match) {
          coords = [parseFloat(match[1]), parseFloat(match[2])];
        }
      }

      const defaultCenter = cityCenters[property.city] || [31.6295, -7.9811];
      const mapCenter = coords || defaultCenter;

      const container = document.getElementById("details-map");
      if (container) {
        container.innerHTML = "";
      }

      map = L.map("details-map").setView(mapCenter, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      // Place pin
      const markerIcon = L.divIcon({
        html: `<span class="material-symbols-outlined" style="color: #630ed4; font-size: 36px; transform: translate(-12px, -36px); font-variation-settings: 'FILL' 1;">location_on</span>`,
        className: "custom-leaflet-icon",
        iconSize: [24, 40],
        iconAnchor: [12, 40]
      });

      L.marker(mapCenter, { icon: markerIcon }).addTo(map);
    };

    return () => {
      if (map) {
        map.remove();
      }
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [property]);

  const fetchPropertyDetails = async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const response = await api.get(`/annonces/${activeId}`);
      if (response.data.status === "success") {
        setProperty(response.data.data);
      } else {
        setError("Impossible de charger les détails.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur serveur lors de la récupération des détails.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      if (isLiked) {
        await api.delete(`/favoris/${activeId}`);
        setIsLiked(false);
      } else {
        await api.post(`/favoris/${activeId}`);
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!fullName || !email || !phone || !messageText) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    setSending(true);
    setSuccessMsg("");
    try {
      const response = await api.post("/demandes", {
        annonce_id: activeId,
        contact_name: fullName,
        contact_phone: phone,
        message: messageText,
      });
      if (response.data.success) {
        setSuccessMsg("Votre message a été envoyé avec succès. Un agent vous contactera.");
        setMessageText("");
      } else {
        alert(response.data.message || "Erreur lors de l'envoi.");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Une erreur est survenue lors de l'envoi.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        Chargement...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>{error || "Annonce non trouvée."}</p>
        <button className="global-btn-contact" onClick={() => navigate("/")} style={{ marginTop: "20px" }}>Retour à l'accueil</button>
      </div>
    );
  }

  const galleryImages = property.images && property.images.length > 0 
    ? property.images.map(img => img.image_url) 
    : [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"
      ];

  return (
    <div className="annomce-container">
      {/* Navbar */}
      <nav className="global-fixed-navbar">
        <div className="global-nav-brand" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined fill-icon">domain</span>
          ImmoConnect
        </div>

        <div className="global-nav-links">
          <Link to="/" className="global-nav-link">Annonces</Link>
          <Link to="/about" className="global-nav-link">À propos</Link>
          <Link to="/aide" className="global-nav-link">Aide & FAQ</Link>
        </div>

        <div className="global-nav-actions">
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

      <main className="annonce-main-content">
        {/* Breadcrumb */}
        <div className="breadcrumb-wrapper">
          <div className="breadcrumb-text">
            Accueil / {property.listing_type === "vente" ? "Vente" : "Location"} / {property.title}
          </div>

          <div className="breadcrumb-actions">
            <button 
              className="action-pill" 
              onClick={handleToggleLike}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <FaHeart color={isLiked ? '#ef4444' : 'currentColor'} style={{ transition: 'transform 0.2s', transform: isLiked ? 'scale(1.1)' : 'scale(1)' }} />
              {isLiked ? 'Favori' : 'Ajouter aux favoris'}
            </button>
            <button className="action-pill" onClick={handleShare}>
              <FaShareAlt />
              Partager
            </button>
          </div>
        </div>

        {/* Gallery */}
        <section className="gallery-grid">
          <div className="gallery-main">
            <img
              src={galleryImages[0] || "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200"}
              alt=""
              className="gallery-main-img"
            />
          </div>

          <div className="gallery-side">
            <img
              src={galleryImages[1] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"}
              alt=""
              className="gallery-side-img"
            />

            <div className="gallery-side-grid">
              <img
                src={galleryImages[2] || "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"}
                alt=""
                className="gallery-side-img"
              />

              <div className="gallery-side-sub-wrapper">
                <img
                  src={galleryImages[3] || "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"}
                  alt=""
                  className="gallery-side-sub-img"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="details-layout">
          {/* Left */}
          <div className="details-left">
            <section className="property-header">
              <h1 className="property-title">
                {property.title}
              </h1>

              <div className="property-location-flex">
                <FaMapMarkerAlt />
                {property.address || property.city}, Maroc
              </div>
            </section>

            {/* Stats */}
            <section className="property-stats">
              <Stat icon={<FaBed />} value={property.rooms || "0"} label="Chambres" />
              <Stat icon={<FaBath />} value={property.bathrooms || "0"} label="Bains" />
              <Stat icon={<FaRulerCombined />} value={`${property.surface_area || "0"} m²`} label="Surface" />
              <Stat icon={<MdStairs />} value="R+1" label="Étages" />
              <Stat icon={<FaCar />} value="2" label="Parking" />
            </section>

            {/* Description */}
            <section>
              <h2 className="section-title">
                Description du bien
              </h2>

              <p className="description-text">
                Ce bien d'exception situé dans la magnifique région de {property.city} vous offre des prestations
                haut de gamme et des finitions impeccables. Il dispose d'un espace généreux de {property.surface_area} m²
                réparti idéalement pour un confort absolu. L'architecture moderne de type {property.property_type} 
                saura séduire les plus exigeants à la recherche d'un cadre de vie unique.
              </p>
            </section>

            {/* Features */}
            <section>
              <h2 className="section-title">
                Caractéristiques & Équipements
              </h2>

              <div className="features-grid">
                {features.map((item) => (
                  <div
                    key={item}
                    className="feature-item"
                  >
                    <FaCheckCircle className="feature-check" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Map */}
            <section>
              <h2 className="section-title">
                Localisation
              </h2>

              <div 
                id="details-map" 
                style={{ 
                  height: '350px', 
                  width: '100%', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  overflow: 'hidden',
                  zIndex: 10,
                  position: 'relative',
                  backgroundColor: '#2d1b4e'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#a78bfa', fontSize: '0.95rem' }}>
                  Chargement de la carte de {property.city}...
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="details-right">
            <div className="price-card">
              <div className="mb-8">
                <p className="price-label">
                  {property.listing_type === "vente" ? "Prix de vente" : "Loyer mensuel"}
                </p>

                <h2 className="price-amount">
                  {Number(property.price).toLocaleString()} MAD {property.listing_type === "location" ? "/Mois" : ""}
                </h2>
              </div>

              {successMsg ? (
                <div style={{ color: '#10b981', padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid #10b981', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {successMsg}
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  {error && (
                    <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.85rem' }}>
                      {error}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Nom complet"
                    className="input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Téléphone"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <textarea
                    rows="4"
                    placeholder="Votre message"
                    className="input-field"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%' }}
                    disabled={sending}
                  >
                    {sending ? "Envoi..." : (isAuthenticated ? "Envoyer la demande" : "Se connecter pour demander")}
                  </button>
                </form>
              )}
            </div>

            <div className="security-alert">
              <FaShieldAlt className="security-icon" />

              <div>
                <h4 className="security-title">
                  Garantie de Sécurité
                </h4>

                <p className="security-desc">
                  Votre demande est traitée uniquement par notre administration certifiée.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showShareToast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1e1b4b",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "9999px",
          boxShadow: "0 10px 25px rgba(99, 14, 212, 0.2)",
          border: "1px solid rgba(99, 14, 212, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.9rem",
          fontWeight: "600",
          zIndex: 10000
        }}>
          <span className="material-symbols-outlined" style={{ color: "#a78bfa" }}>check_circle</span>
          Lien copié dans le presse-papiers !
        </div>
      )}
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="stat-box">
      <div className="stat-icon">
        {icon}
      </div>

      <h3 className="stat-value">{value}</h3>

      <p className="stat-label">
        {label}
      </p>
    </div>
  );
}