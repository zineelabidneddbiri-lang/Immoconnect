import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import "./style/Accueil.css";
import api from "../api";

const roomOptions = ["Toutes", "1+", "2+", "3+", "4+"];
const propertyTypes = ["Villas", "Appartements", "Riads", "Terrains"];
const navLinks = ["Annonces", "Aide"];

const defaultImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

export default function Accueil() {
  const navigate = useNavigate();
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // User auth state
  const [user, setUser] = useState(null);
  const [favoritesList, setFavoritesList] = useState([]);

  // Sorting state
  const [selectedSort, setSelectedSort] = useState("latest");

  // Search & filter states
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [searchListingType, setSearchListingType] = useState("all");
  const [searchKeywords, setSearchKeywords] = useState("");

  // Sidebar filters
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [surfaceMin, setSurfaceMin] = useState("");
  const [surfaceMax, setSurfaceMax] = useState("");
  const [activeRoom, setActiveRoom] = useState(0); // 0 = Toutes, 1 = 1+, etc.
  const [checkedTypes, setCheckedTypes] = useState([false, false, false, false]); // Villa, Appartement, Riad, Terrain
  
  // Active filter tags (display only)
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      const parsedUser = JSON.parse(userJson);
      setUser(parsedUser);
      fetchFavorites(parsedUser.id);
    }
  }, []);

  const fetchFavorites = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/favoris`);
      if (response.data.status === "success") {
        setFavoritesList(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Map rooms
      let roomsParam = "";
      if (activeRoom > 0) {
        roomsParam = activeRoom;
      }

      // Map property type from sidebar check
      let propertyTypeParam = "all";
      if (checkedTypes[0]) propertyTypeParam = "maison"; // Villas map to maison
      else if (checkedTypes[1]) propertyTypeParam = "appartement";
      else if (checkedTypes[2]) propertyTypeParam = "maison"; // Riads map to maison
      else if (checkedTypes[3]) propertyTypeParam = "terrain";

      // Build parameters
      const params = {
        page: currentPage,
        city: searchCity || undefined,
        property_type: searchType !== "all" ? searchType : (propertyTypeParam !== "all" ? propertyTypeParam : undefined),
        listing_type: searchListingType !== "all" ? searchListingType : undefined,
        rooms: roomsParam || undefined,
        price_min: priceMin || undefined,
        price_max: priceMax || undefined,
        surface_min: surfaceMin || undefined,
        surface_max: surfaceMax || undefined,
        status: "validee",
        sort: selectedSort
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

  useEffect(() => {
    fetchProperties();
  }, [currentPage, activeRoom, checkedTypes, selectedSort]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchProperties();
    
    // Update active filter tags
    const tags = [];
    if (searchCity) tags.push(searchCity);
    if (searchType !== "all") tags.push(searchType);
    if (searchListingType !== "all") tags.push(searchListingType);
    setActiveFilters(tags);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchProperties();
  };

  const handleClearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setSurfaceMin("");
    setSurfaceMax("");
    setActiveRoom(0);
    setCheckedTypes([false, false, false, false]);
    setSearchCity("");
    setSearchType("all");
    setSearchListingType("all");
    setActiveFilters([]);
    setCurrentPage(1);
  };

  const isFavorited = (propertyId) => {
    return favoritesList.some((fav) => fav.id === propertyId);
  };

  const toggleLike = async (e, propertyId) => {
    e.stopPropagation(); // Prevent card click navigation
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    const alreadyLiked = isFavorited(propertyId);
    try {
      if (alreadyLiked) {
        await api.delete(`/favoris/${propertyId}`);
        setFavoritesList((prev) => prev.filter((fav) => fav.id !== propertyId));
      } else {
        await api.post(`/favoris/${propertyId}`);
        // Add to local favorites list (just need the id property)
        setFavoritesList((prev) => [...prev, { id: propertyId }]);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
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
      setUser(null);
      setFavoritesList([]);
      navigate("/logged-out");
    }
  };

  const toggleTypeCheckbox = (i) => {
    setCheckedTypes((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <div className="accueil-container">
      {/* Nav */}
      <nav className="global-fixed-navbar">
        <div className="global-nav-brand" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined fill-icon">domain</span>
          ImmoConnect
        </div>
        <div className="global-nav-links">
          <Link to="/" className="global-nav-link global-nav-link-active">
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

      <main className="accueil-main-content">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot animate-pulse" />
              <span className="hero-badge-text">
                {totalCount} {totalCount > 1 ? "annonces disponibles" : "annonce disponible"}
              </span>
            </div>
            <h1 className="hero-title">
              Trouvez votre bien idéal <br />
              <span style={{ color: "#ebddff" }}>au Maroc</span>
            </h1>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-bar">
              <div className="search-fields">
                <div className="search-field search-field-border">
                  <label className="field-label">Type</label>
                  <select 
                    className="field-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="maison">Maisons / Villas</option>
                    <option value="appartement">Appartements</option>
                    <option value="terrain">Terrains</option>
                  </select>
                </div>
                <div className="search-field search-field-border">
                  <label className="field-label">Ville</label>
                  <select 
                    className="field-select"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  >
                    <option value="">Toutes les villes</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Essaouira">Essaouira</option>
                  </select>
                </div>
                <div className="search-field search-field-border">
                  <label className="field-label">Offre</label>
                  <select 
                    className="field-select"
                    value={searchListingType}
                    onChange={(e) => setSearchListingType(e.target.value)}
                  >
                    <option value="all">Vente & Location</option>
                    <option value="vente">Vente</option>
                    <option value="location">Location</option>
                  </select>
                </div>
                <div className="search-field">
                  <label className="field-label">Mots-clés</label>
                  <input
                    className="field-input"
                    placeholder="Piscine, Jardin..."
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="search-btn">
                <span className="material-symbols-outlined">search</span>
                Rechercher
              </button>
            </form>
          </div>
        </section>

        {/* Main Content */}
        <section className="content-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div>
              <h3 className="filter-title">Filtres</h3>
              <div className="filter-groups">
                {/* Price */}
                <div>
                  <label className="filter-label">Prix (MAD)</label>
                  <div className="range-inputs">
                    <input 
                      className="range-input" 
                      placeholder="Min" 
                      type="number" 
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <input 
                      className="range-input" 
                      placeholder="Max" 
                      type="number" 
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                </div>
                {/* Surface */}
                <div>
                  <label className="filter-label">Surface (m²)</label>
                  <div className="range-inputs">
                    <input 
                      className="range-input" 
                      placeholder="Min" 
                      type="number" 
                      value={surfaceMin}
                      onChange={(e) => setSurfaceMin(e.target.value)}
                    />
                    <input 
                      className="range-input" 
                      placeholder="Max" 
                      type="number" 
                      value={surfaceMax}
                      onChange={(e) => setSurfaceMax(e.target.value)}
                    />
                  </div>
                </div>
                {/* Rooms */}
                <div>
                  <label className="filter-label">Chambres</label>
                  <div className="button-group">
                    {roomOptions.map((r, i) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setActiveRoom(i)}
                        className={`room-btn ${
                          activeRoom === i
                            ? "room-btn-active"
                            : "room-btn-inactive"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Type */}
                <div>
                  <label className="filter-label">Type de bien</label>
                  <div className="checkbox-list">
                    {propertyTypes.map((type, i) => (
                      <label key={type} className="checkbox-label">
                        <input
                          checked={checkedTypes[i]}
                          onChange={() => toggleTypeCheckbox(i)}
                          className="checkbox-input"
                          type="checkbox"
                        />
                        <span className="checkbox-text">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button 
                  type="button" 
                  className="apply-filters-btn"
                  onClick={handleApplyFilters}
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            {/* Filters & Sort */}
            <div className="results-header">
              <div className="active-filters">
                {activeFilters.map((f) => (
                  <div key={f} className="active-filter-tag">
                    {f}
                    <span 
                      className="material-symbols-outlined text-[14px]" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (f === searchCity) setSearchCity("");
                        else if (f === searchType) setSearchType("all");
                        else if (f === searchListingType) setSearchListingType("all");
                        // Trigger fetch
                        setTimeout(() => handleSearchSubmit(), 0);
                      }}
                    >
                      close
                    </span>
                  </div>
                ))}
                {(activeFilters.length > 0 || priceMin || priceMax || surfaceMin || surfaceMax || activeRoom > 0) && (
                  <button className="clear-all-btn" onClick={handleClearFilters}>
                    Tout effacer
                  </button>
                )}
              </div>
              <div className="sort-by-wrapper">
                <span className="sort-by-label">Trier par:</span>
                <select 
                  className="sort-by-select"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="latest">Plus récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                Chargement des annonces...
              </div>
            ) : propertiesList.length === 0 ? (
              <div className="empty-state" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                Aucune annonce ne correspond à vos critères.
              </div>
            ) : (
              /* Cards */
              <div className="properties-grid">
                {propertiesList.map((p) => {
                  const hasImage = p.image_annonce && p.image_annonce.length > 0;
                  const propertyImage = hasImage 
                    ? (p.image_annonce[0].image_path.startsWith('http') 
                        ? p.image_annonce[0].image_path 
                        : `http://127.0.0.1:8000/storage/${p.image_annonce[0].image_path}`)
                    : defaultImg;

                  return (
                    <article 
                      key={p.id} 
                      className="property-card" 
                      onClick={() => navigate(`/annonce/${p.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-image-wrapper">
                        <img
                          src={propertyImage}
                          alt={p.title}
                          className="card-image"
                        />
                        <div className="card-tags">
                          <span className="tag-vente">
                            {p.listing_type === "vente" ? "Vente" : "Location"}
                          </span>
                          {p.price > 1500000 && (
                            <span className="tag-exclusive">
                              Exclusivité
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => toggleLike(e, p.id)}
                          className="btn-like"
                        >
                          <span>
                            {isFavorited(p.id) ? (
                              <MdFavorite color="red" size={20} />
                            ) : (
                              <MdFavoriteBorder color="red" size={20} />
                            )}
                          </span>
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="card-header">
                          <h2 className="card-title">{p.title}</h2>
                          <span className="card-price">
                            {Number(p.price).toLocaleString()} <span className="card-price-unit">MAD{p.listing_type === "location" ? "/Mois" : ""}</span>
                          </span>
                        </div>
                        <div className="card-location">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          {p.city}
                        </div>
                        <div className="card-details">
                          {[
                            { icon: "bed", val: `${p.rooms || 0} Ch.` },
                            { icon: "bathtub", val: `${p.bathrooms || 0} Sdb.` },
                            { icon: "square_foot", val: `${p.surface_area || 0} m²` },
                          ].map(({ icon, val }) => (
                            <div key={icon} className="card-detail-item">
                              <span className="material-symbols-outlined detail-icon">{icon}</span>
                              <span className="detail-text">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="pagination">
                <button 
                  className="page-chevron-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined"><FaChevronLeft /></span>
                </button>
                {Array.from({ length: lastPage }, (_, idx) => idx + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`page-num-btn ${
                      currentPage === n
                        ? "page-num-btn-active"
                        : "page-num-btn-inactive"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button 
                  className="page-chevron-btn"
                  onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage === lastPage}
                >
                  <span className="material-symbols-outlined"><FaChevronRight /></span>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>ImmoConnect</div>
          <div className="footer-links">
            <Link to="/legal?tab=mentions" className="footer-link">Mentions Légales</Link>
            <Link to="/legal?tab=confidentialite" className="footer-link">Confidentialité</Link>
            <Link to="/legal?tab=cookies" className="footer-link">Cookies</Link>
            <Link to="/legal?tab=presse" className="footer-link">Presse</Link>
          </div>
          <p className="footer-copy">© 2026 ImmoConnect. L'art de l'habitat d'exception.</p>
        </div>
      </footer>
    </div>
  );
}
