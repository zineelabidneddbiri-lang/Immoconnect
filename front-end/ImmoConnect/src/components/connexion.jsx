import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/login.css";
import logPhoto from "../assets/logPhoto.jpeg";
import api from "../api";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerCity, setRegisterCity] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e, customEmail, customPassword) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    const emailToUse = customEmail || email;
    const passwordToUse = customPassword || password;
    if (!emailToUse || !passwordToUse) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/login", { email: emailToUse, password: passwordToUse });
      if (response.data.status === "success") {
        const { token, data: user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.data.message || "Identifiants incorrects.");
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
          "Une erreur est survenue lors de la connexion. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (!registerName || !registerEmail || !registerPassword || !registerPhone || !registerCity) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/register", {
        full_name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone,
        city: registerCity,
      });
      if (response.data.status === "success") {
        const { token, data: user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Erreur lors de l'inscription.");
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
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="connexion-main">
      {/* Visual Section */}
      <div className="visual-section">
        <div className="visual-overlay"></div>

        <img 
          src={logPhoto}
          className="visual-img"
          alt="Immobilier d'exception"
        />

        <div className="visual-caption-wrapper">
          <div className="glass-panel">
            <h2 className="visual-title">
              L'art de l'habitat d'exception.
            </h2>

            <p className="visual-desc">
              Découvrez une collection de biens soigneusement sélectionnés pour
              leur caractère unique et leur architecture remarquable.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <div className="form-container">
          {/* Brand */}
          <div className="brand-wrapper" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <span className="brand-name">
              ImmoConnect
            </span>
          </div>

          {/* Tabs */}
          <div className="tabs-wrapper">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`tab-btn ${
                isLogin
                  ? "tab-btn-active"
                  : "tab-btn-inactive"
              }`}
            >
              Connexion
            </button>

            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`tab-btn ${
                !isLogin
                  ? "tab-btn-active"
                  : "tab-btn-inactive"
              }`}
            >
              Inscription
            </button>
          </div>

          {error && (
            <div className="error-banner" style={{
              padding: "10px 14px",
              backgroundColor: "rgba(229, 62, 62, 0.1)",
              borderLeft: "4px solid #e53e3e",
              color: "#e53e3e",
              borderRadius: "4px",
              fontSize: "0.85rem",
              marginBottom: "15px"
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="form-fields-wrapper">
              <div>
                <h1 className="form-title">
                  Bon retour parmi nous.
                </h1>

                <p className="form-desc">
                  Accédez à votre espace curateur immobilier.
                </p>
              </div>

              <div className="inputs-list">
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  className="input-text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="form-fields-wrapper">
              <div>
                <h1 className="form-title">
                  Créer un compte.
                </h1>

                <p className="form-desc">
                  Rejoignez la première plateforme immobilière premium.
                </p>
              </div>

              <div className="inputs-list">
                <div className="input-grid">
                  <input
                    type="text"
                    placeholder="Jean Dupont"
                    className="input-text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />

                  <input
                    type="tel"
                    placeholder="0600000000"
                    className="input-text"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="Ville (ex: Casablanca)"
                  className="input-text"
                  value={registerCity}
                  onChange={(e) => setRegisterCity(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  className="input-text"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-text"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>

              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  J'accepte les Conditions Générales et la Politique de
                  Confidentialité.
                </span>
              </label>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </form>
          )}

          {/* Social Login */}
          <div>
            <div className="divider-wrapper">
              <div className="divider-line"></div>

              <div className="divider-text-wrapper">
                <span className="divider-text">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <div className="social-grid">
              <button className="btn-social" type="button" onClick={() => { setEmail("user@immoconnect.com"); setPassword("password"); handleLogin(null, "user@immoconnect.com", "password"); }}>
                Démo User
              </button>

              <button className="btn-social" type="button" onClick={() => { setEmail("admin@immoconnect.com"); setPassword("password"); handleLogin(null, "admin@immoconnect.com", "password"); }}>
                Démo Admin
              </button>
            </div>
          </div>

          <p className="help-text">
            Besoin d'aide ?{" "}
            <span onClick={() => navigate("/aide")} className="help-link" style={{ cursor: "pointer" }}>
              Contacter le support
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}