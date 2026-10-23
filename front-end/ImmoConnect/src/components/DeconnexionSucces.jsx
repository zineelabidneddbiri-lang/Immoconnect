import { useNavigate } from "react-router-dom";
import "./style/DeconnexionSucces.css";

export default function DeconnexionSucces() {
  const navigate = useNavigate();

  return (
    <div className="logout-container">
      <div className="logout-card">
        <div className="logout-icon-wrapper">
          <span className="material-symbols-outlined">logout</span>
        </div>
        
        <h1 className="logout-title">Vous avez été déconnecté</h1>
        
        <p className="logout-desc">
          À bientôt sur ImmoConnect pour vos futurs projets immobiliers d'exception.
        </p>
        
        <button 
          className="btn-logout-redirect" 
          onClick={() => navigate("/")}
        >
          Retour à l'accueil
        </button>

        <span className="logout-footer">
          ImmoConnect © {new Date().getFullYear()} — L'art de l'habitat d'exception.
        </span>
      </div>
    </div>
  );
}
