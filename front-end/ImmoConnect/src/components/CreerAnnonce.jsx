import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/CreerAnnonce.css";
import api from "../api";

export default function CreerAnnonce() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [propertyType, setPropertyType] = useState("maison"); // maison, appartement, terrain, commerce
  const [city, setCity] = useState("Marrakech");
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [surface, setSurface] = useState("");
  const [rooms, setRooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [listingType, setListingType] = useState("vente"); // vente, location
  
  // Simulated files upload
  const [imageUrls, setImageUrls] = useState([
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
  ]);
  const [markerCoords, setMarkerCoords] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userJson));
  }, [navigate]);

  useEffect(() => {
    if (currentStep !== 2) return;

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
      
      const defaultCenter = cityCenters[city] || [31.6295, -7.9811];
      const container = document.getElementById("picker-map");
      if (container) {
        container.innerHTML = "";
      }

      map = L.map("picker-map").setView(defaultCenter, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      let marker;

      // If coordinates already exist, place the marker
      if (markerCoords) {
        const markerIcon = L.divIcon({
          html: `<span class="material-symbols-outlined" style="color: #630ed4; font-size: 36px; transform: translate(-12px, -36px); font-variation-settings: 'FILL' 1;">location_on</span>`,
          className: "custom-leaflet-icon",
          iconSize: [24, 40],
          iconAnchor: [12, 40]
        });
        marker = L.marker([markerCoords.lat, markerCoords.lng], { icon: markerIcon }).addTo(map);
        map.setView([markerCoords.lat, markerCoords.lng], 15);
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setMarkerCoords({ lat, lng });

        const markerIcon = L.divIcon({
          html: `<span class="material-symbols-outlined" style="color: #630ed4; font-size: 36px; transform: translate(-12px, -36px); font-variation-settings: 'FILL' 1;">location_on</span>`,
          className: "custom-leaflet-icon",
          iconSize: [24, 40],
          iconAnchor: [12, 40]
        });

        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng, { icon: markerIcon }).addTo(map);
        }

        setAddress(`Point sur la carte (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      });
    };

    return () => {
      if (map) {
        map.remove();
      }
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [currentStep, city]);

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

  // Attractiveness score calculation
  const calculateAttractiveness = () => {
    let score = 20; // Base score
    if (title.length > 5) score += 20;
    if (description.length > 20) score += 20;
    if (address.length > 10) score += 20;
    if (imageUrls.length > 1) score += 20;
    return Math.min(score, 100);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !propertyType) return;
    if (currentStep === 2 && !address) {
      setError("Veuillez renseigner l'adresse exacte.");
      return;
    }
    if (currentStep === 3 && (!title || !price || !surface || !description)) {
      setError("Veuillez renseigner tous les champs obligatoires (Titre, Prix, Surface, Description).");
      return;
    }
    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleAddDemoImage = () => {
    const demoPool = [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
    ];
    const nextImg = demoPool[imageUrls.length - 1] || demoPool[0];
    if (imageUrls.length < 4) {
      setImageUrls((prev) => [...prev, nextImg]);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      if (imageUrls.length >= 4) {
        alert("Vous ne pouvez pas ajouter plus de 4 photos.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (index) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description,
        price: parseFloat(price.toString().replace(/\s/g, "")),
        property_type: propertyType,
        listing_type: listingType,
        city,
        address,
        rooms,
        bathrooms,
        surface_area: parseFloat(surface),
        status: "en_attente", // Default status, requires curator approval
        images: imageUrls // Send array of images (Base64 or URL)
      };

      const response = await api.post("/annonces", payload);
      if (response.data.status === "success") {
        navigate(user?.role === "admin" ? "/admin" : "/dashboard");
      } else {
        setError(response.data.message || "Erreur lors de la création de l'annonce.");
      }
    } catch (err) {
      console.error(err);
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const messages = Object.values(validationErrors).flat().join(" ");
        setError(messages);
      } else {
        setError(
          err.response?.data?.message || 
          "Une erreur est survenue lors de la publication de l'annonce."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="creer-container">
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
      <main className="creer-content">
        {/* Left Form Panel */}
        <div className="wizard-box">
          {/* Stepper Indicator */}
          <div className="stepper-indicator">
            <div className="stepper-line">
              <div className="stepper-line-progress" style={{ width: `${progressPercentage}%` }} />
            </div>
            
            <div className={`step-node ${currentStep >= 1 ? "step-node-active" : ""} ${currentStep > 1 ? "step-node-completed" : ""}`}>
              <div className="step-circle">1</div>
              <span className="step-label">Général</span>
            </div>

            <div className={`step-node ${currentStep >= 2 ? "step-node-active" : ""} ${currentStep > 2 ? "step-node-completed" : ""}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Localisation</span>
            </div>

            <div className={`step-node ${currentStep >= 3 ? "step-node-active" : ""} ${currentStep > 3 ? "step-node-completed" : ""}`}>
              <div className="step-circle">3</div>
              <span className="step-label">Détails & Photos</span>
            </div>

            <div className={`step-node ${currentStep === 4 ? "step-node-active" : ""}`}>
              <div className="step-circle">4</div>
              <span className="step-label">Validation</span>
            </div>
          </div>

          {error && (
            <div className="error-banner" style={{
              padding: "10px 14px",
              backgroundColor: "rgba(229, 62, 62, 0.1)",
              borderLeft: "4px solid #e53e3e",
              color: "#e53e3e",
              borderRadius: "4px",
              fontSize: "0.85rem",
              marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          {/* Step 1: Type Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="form-step-title">Quel type de bien proposez-vous ?</h2>
              <p className="form-step-desc">Sélectionnez la catégorie qui correspond le mieux à votre annonce.</p>
              
              <div className="type-grid">
                <div 
                  className={`type-card ${propertyType === "maison" ? "type-card-active" : ""}`}
                  onClick={() => setPropertyType("maison")}
                >
                  <span className="material-symbols-outlined type-icon">home</span>
                  <span className="type-label">Maison / Villa</span>
                </div>

                <div 
                  className={`type-card ${propertyType === "appartement" ? "type-card-active" : ""}`}
                  onClick={() => setPropertyType("appartement")}
                >
                  <span className="material-symbols-outlined type-icon">apartment</span>
                  <span className="type-label">Appartement</span>
                </div>

                <div 
                  className={`type-card ${propertyType === "terrain" ? "type-card-active" : ""}`}
                  onClick={() => setPropertyType("terrain")}
                >
                  <span className="material-symbols-outlined type-icon">landscape</span>
                  <span className="type-label">Terrain</span>
                </div>

                <div 
                  className={`type-card ${propertyType === "commerce" ? "type-card-active" : ""}`}
                  onClick={() => setPropertyType("commerce")}
                >
                  <span className="material-symbols-outlined type-icon">storefront</span>
                  <span className="type-label">Commerce</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="form-group-list">
              <div>
                <h2 className="form-step-title">Où se situe votre bien ?</h2>
                <p className="form-step-desc">Précisez la ville et l'adresse de localisation du bien immobilier.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Ville</label>
                <select 
                  className="form-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="Marrakech">Marrakech</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Essaouira">Essaouira</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Adresse exacte</label>
                <input 
                  type="text" 
                  className="form-input-text" 
                  placeholder="ex: 24, Rue Al Bousten, Palmeraie"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Interactive Leaflet Map */}
              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label">
                  Localisation sur la carte {markerCoords ? `(${markerCoords.lat.toFixed(4)}, ${markerCoords.lng.toFixed(4)})` : ""}
                </label>
                <div 
                  id="picker-map" 
                  style={{ 
                    height: "240px", 
                    width: "100%", 
                    borderRadius: "16px", 
                    border: "1px solid var(--border-color)",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                    position: "relative",
                    zIndex: 10
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Chargement de la carte...
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                  💡 Cliquez n'importe où sur la carte pour épingler la localisation exacte. Cela mettra à jour l'adresse.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Details & Media */}
          {currentStep === 3 && (
            <div className="form-group-list">
              <div>
                <h2 className="form-step-title">Décrivez votre propriété</h2>
                <p className="form-step-desc">Remplissez les détails techniques, le prix et importez vos photos.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Titre de l'annonce</label>
                <input 
                  type="text" 
                  className="form-input-text" 
                  placeholder="ex: Maison Contemporaine d'Architecte"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description détaillée</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Caractéristiques, points forts du bien, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="type-grid" style={{ gap: "20px" }}>
                <div className="form-group">
                  <label className="form-label">Prix de vente (MAD)</label>
                  <input 
                    type="number" 
                    className="form-input-text" 
                    placeholder="1250000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Surface habitable (m²)</label>
                  <input 
                    type="number" 
                    className="form-input-text" 
                    placeholder="120"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Bed / Bath counters */}
              {propertyType !== "terrain" && (
                <div className="counter-grid">
                  <div className="counter-control">
                    <span className="counter-label">Chambres</span>
                    <div className="counter-actions">
                      <button className="btn-counter" type="button" onClick={() => setRooms(Math.max(0, rooms - 1))}>-</button>
                      <span className="counter-value">{rooms}</span>
                      <button className="btn-counter" type="button" onClick={() => setRooms(rooms + 1)}>+</button>
                    </div>
                  </div>

                  <div className="counter-control">
                    <span className="counter-label">Salles de bain</span>
                    <div className="counter-actions">
                      <button className="btn-counter" type="button" onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}>-</button>
                      <span className="counter-value">{bathrooms}</span>
                      <button className="btn-counter" type="button" onClick={() => setBathrooms(bathrooms + 1)}>+</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Type d'offre</label>
                <select 
                  className="form-select"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                >
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Photos du bien (Max 4)</label>
                <input
                  type="file"
                  id="image-file-upload"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <div 
                  className="drag-drop-zone" 
                  onClick={() => document.getElementById("image-file-upload").click()}
                  style={{ cursor: "pointer" }}
                >
                  <span className="material-symbols-outlined upload-icon">cloud_upload</span>
                  <span className="upload-title">Cliquez pour importer des photos depuis votre PC</span>
                  <span className="upload-subtitle">Formats acceptés : PNG, JPG, JPEG. (Photo {imageUrls.length}/4)</span>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="global-btn-contact-simple" 
                    style={{ fontSize: '0.8rem', padding: '4px 8px', textDecoration: 'underline' }} 
                    onClick={handleAddDemoImage}
                  >
                    + Ajouter une photo de démonstration
                  </button>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="preview-images-grid">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="preview-image-container">
                        <img src={url} className="preview-img" alt="Preview upload" />
                        <button className="btn-delete-img" type="button" onClick={() => handleDeleteImage(index)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Final Validation */}
          {currentStep === 4 && (
            <div className="form-group-list">
              <div>
                <h2 className="form-step-title">Soumettre votre annonce</h2>
                <p className="form-step-desc">Votre annonce va être transmise à un curateur pour modération juridique et technique avant d'être publiée.</p>
              </div>

              <div className="attract-card" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                <span className="model-badge">Validation du dossier</span>
                <p className="model-desc" style={{ fontSize: "0.9rem", margin: 0 }}>
                  En soumettant cette demande, vous certifiez l'exactitude des informations fournies. 
                  Notre équipe prendra contact avec vous si des documents complémentaires (titre foncier, diagnostic énergétique) sont nécessaires.
                </p>
              </div>

              <label className="checkbox-label" style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" required style={{ marginTop: "4px" }} />
                <span>
                  Je certifie être le propriétaire légal ou détenir un mandat exclusif de vente pour ce bien immobilier.
                </span>
              </label>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="wizard-nav-actions">
            {currentStep > 1 ? (
              <button className="btn-wizard-back" type="button" onClick={handleBackStep}>
                Retour
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button className="btn-wizard-next" type="button" onClick={handleNextStep}>
                Continuer
              </button>
            ) : (
              <button className="btn-wizard-next" type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Soumission..." : "Soumettre la demande"}
              </button>
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="preview-col">
          <span className="preview-card-title">Aperçu en direct de votre fiche</span>
          
          <div className="property-preview-card">
            <div className="property-preview-image-wrapper">
              <img 
                src={imageUrls[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"} 
                className="property-preview-img" 
                alt="Property preview" 
              />
              <span className="property-preview-badge">
                {listingType === "vente" ? "Vente" : "Location"}
              </span>
              <span className="property-preview-price">
                {price ? parseFloat(price).toLocaleString() : "0"} MAD {listingType === "location" && "/Mois"}
              </span>
            </div>
            
            <div className="property-preview-info">
              <h3 className="property-preview-name">{title || "Maison Contemporaine d'Architecte"}</h3>
              <div className="property-preview-location">
                <span className="material-symbols-outlined">location_on</span>
                {city}, Maroc
              </div>

              {propertyType !== "terrain" && (
                <div className="property-preview-specs">
                  <div className="spec-item">
                    <span className="material-symbols-outlined">bed</span>
                    {rooms} Ch.
                  </div>
                  <div className="spec-item">
                    <span className="material-symbols-outlined">bathtub</span>
                    {bathrooms} Sdb.
                  </div>
                  <div className="spec-item">
                    <span className="material-symbols-outlined">square_foot</span>
                    {surface || "0"} m²
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attractiveness Index Card */}
          <div className="attract-card">
            <div className="attract-header">
              <span>Indice d'attractivité</span>
              <span style={{ color: "var(--primary-color)" }}>{calculateAttractiveness()}%</span>
            </div>
            
            <div className="attract-bar-wrapper">
              <div className="attract-bar-progress" style={{ width: `${calculateAttractiveness()}%` }} />
            </div>

            <p className="attract-text">
              Un score de 100% assure une mise en valeur optimale de votre annonce sur notre flux d'exception. 
              Ajoutez des photos de haute qualité et une description détaillée pour l'augmenter.
            </p>
          </div>

          {/* Advice Box */}
          <div className="advice-box">
            <span className="material-symbols-outlined advice-icon">info</span>
            <div className="advice-content">
              <span className="advice-title">Conseil ImmoConnect</span>
              <p className="advice-desc">
                Les propriétés avec au moins 3 photos haute résolution se vendent en moyenne 40% plus rapidement.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
