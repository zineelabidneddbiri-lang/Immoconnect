import { useState, useEffect } from "react";
import "./style/message.css";
import api from "../api";

const conversations = [
  {
    id: 1,
    name: "Elena Valois",
    preview: "C'est parfait pour la visite de demain.",
    time: "14:20",
    online: true,
    unread: true,
    active: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB10XRr9AMquNpbLCOh_G5WQWg1qM6ufkCjxopfo3gXj_ITPWBtOe59L7XPbGMCEMDWKCyzoDVEifiP0JRBjIg5hkTxVSqrq3YrkyrmoZgnkKeHfiMXKg5IEjmMSKcatm0tOQw9jXk0V5G8BWtDL6sDzgimUnXmmIF1fkoO3oqumi0i56slYxJLZuXz00Z3xTy5ZzH_vbBCMBCJo1Mtdwfiq4lECzBR4Ee3ErzXPq3qYDsBc1cvYOaQcC-OgoUc2zZ4dORBKDcqkvg",
  },
  {
    id: 2,
    name: "Marc Dupont",
    preview: "Le dossier est complet, je l'envoie.",
    time: "Hier",
    online: false,
    unread: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgtbugx7O74vHxXUqb-3KIkCp3MCAsc1gk-XZkdr0P7jk2NkJE2cufh7z2CMQ2LHyxiR6RUKPiz9XlOjv3KpYEb_dejx8YDA8Kq6HHKoLsc45v9TAI-JHAKlxgcm4yXmbIAvsXGqaO_A6ZqB2-tkroqsqu_mll0vN6CWLeHsOJlK1ExXd8urMmTTAmvf0b6P5MB82O5pmeLHQGfP5vIBvZIza_vv-RkEVwMK36lCOf9swNThnjeBicBIipeFVAzBQ9uQ2yB2lptwY",
  },
  {
    id: 3,
    name: "Sophie Arthaud",
    preview: "Merci pour votre retour rapide !",
    time: "Lun",
    online: false,
    unread: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRThR-ZjO7KMrDqjsjtYcy5WqMuXHBrTNR3tCbqQmHxQRGdMo0FcKXFc-thCyaCQn9pwOQjVauzi28xYyI7hkGFzfZ-wwEJ6ZwUKQL2WDjZLWiR7I85x_wNkgZFuhxsNX7Sc2dOoqjuR0rASvxgJmRa770ueEN7gwA-oyXyW9cj6YvtZgddphCWQsq-xaXskh09NXF67Mz4dNSVEAi-LXUxbpaENA3FxgZwRIUQL6dPLXnjGA2AcYg2e81pEurJHCurKhXsM3GMcI",
  },
  {
    id: 4,
    name: "Julien Meyer",
    preview: "L'offre a été acceptée par les clients.",
    time: "22 Mai",
    online: false,
    unread: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUuYEiYfJruawSMVoFRcLmgFw0OYAKqeYvdA2zpnuA8QCW8UgsXDRbE1eKAkphUANPSaMaMiAxJzD38iQrud5Jk3aiVWNG3H1CXVOxeq-60CqRFYzp8S-0jLzqOi-ATUTfVnaUI8O_T2p3iKxsjOeMnkHwCcBTN4qELANXfeSAwm1Hjz8kl1eL_jj979adw6K2ogFtiI5qG1girnTjIbs6lHMdkgFKdUBmCM1GHUCBiGa81M5pr0YZQEhCY6Yo7JTWLKWuF_im7_I",
  },
];

const initialMessages = [
  { id: 1, from: "elena", text: "Bonjour ! J'ai bien reçu vos documents pour la Villa Azure. Tout semble en ordre.", time: "10:15" },
  { id: 2, from: "me", text: "C'est une excellente nouvelle. Est-ce possible d'organiser une contre-visite avec mon architecte demain après-midi ?", time: "10:42" },
  { id: 3, from: "me", type: "card" },
  { id: 4, from: "elena", text: "C'est parfait pour la visite de demain à 15h. Je vous attends devant l'entrée principale.", time: "14:20" },
];

const sideNavItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "mail", label: "Messages", active: true, filled: true },
  { icon: "favorite", label: "Favoris" },
];

import { useNavigate } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userJson));
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "me", text: input.trim(), time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

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

  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  if (!user) return null;

  return (
    <div className="messaging-page-container">
      {/* Sidebar */}
      <aside className="purple-sidebar">
        <div className="sidebar-logo" onClick={() => onNavigate("accueil")} style={{ cursor: "pointer" }}>
          <h1 className="logo-title">ImmoConnect</h1>
        </div>
        <div className="profile-section">
          <div className="profile-initials" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', marginRight: '12px' }}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p className="profile-name">{user.full_name.split(" ")[0]}</p>
            <p className="profile-role">{user.role === 'admin' ? 'Administrateur' : 'Client Premium'}</p>
          </div>
        </div>
        <nav className="nav-menu">
          {sideNavItems.map(({ icon, label, active, filled }) => {
            const handleNav = (e) => {
              e.preventDefault();
              if (label === "Dashboard") {
                navigate(user.role === 'admin' ? '/admin' : '/dashboard');
              } else if (label === "Favoris") {
                navigate("/dashboard/favoris");
              } else if (label === "Messages") {
                navigate("/dashboard/messages");
              }
            };
            return (
              <a key={label} href="#"
                onClick={handleNav}
                className={`nav-item ${active ? "active" : "inactive"}`}>
                <span className={`material-symbols-outlined ${active && filled ? "fill-icon" : ""}`}>{icon}</span>
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
        <div className="publish-btn-container">
          <button className="publish-btn" onClick={() => onNavigate("annonce")}>
            Publier un bien
          </button>
        </div>
        <div className="sidebar-bottom">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("aide"); }} className="bottom-link">
            <span className="material-symbols-outlined">help</span> <span>Aide</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="bottom-link">
            <span className="material-symbols-outlined">logout</span> <span>Déconnexion</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="main-chat-panel">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-partner-info">
            <div className="partner-avatar-wrapper">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWqsx2RA4JEtTqvv96EXV368wbIS5fnSuG2aDtvfcfofkZDiuStEvjObTOIxXZHNkun5ZvNnS7p4a4lcQ_4Ug9Sd1gdqlguyxPS8or8R18HPiEbb8UcL8VHude1pnuQ7Cz7e5TXqOnPCIF6u4yRo4eNOUN_HdcWdJUAaBzi-FR-DFNk1qcBaXWtsJOTNF0Gc43AwSxLXumF3dU_-G6Zz0IuS7RNdbKsoM4kbg90YKuhiO5DlE1VeDgGK2cyCFykl5mddmHaR40gzU"
                alt="Elena" className="partner-avatar" />
              <span className="status-indicator" />
            </div>
            <div>
              <h2 className="partner-name">Elena Valois</h2>
              <p className="partner-status">En ligne • Propriétaire "Villa Azure"</p>
            </div>
          </div>
        </header>

        <div className="chat-body-layout">
          {/* Conversation List */}
          <section className="conversations-sidebar">
            <div className="search-wrapper">
              <div className="search-container">
                <span className="search-icon">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                  placeholder="Rechercher..." />
              </div>
            </div>
            <div className="conversations-list">
              {filtered.map((c) => (
                <div key={c.id}
                  className={`convo-card ${c.active ? "active" : "inactive"}`}>
                  <div className="convo-avatar-wrapper">
                    <img src={c.img} alt={c.name} className="convo-avatar" />
                    {c.online && <span className="convo-online-dot" />}
                  </div>
                  <div className="convo-details">
                    <div className="convo-header">
                      <h3 className="convo-name">{c.name}</h3>
                      <span className="convo-time">{c.time}</span>
                    </div>
                    <p className={`convo-preview ${c.active ? "active" : "inactive"}`}>{c.preview}</p>
                  </div>
                  {c.unread && <div className="unread-dot" />}
                </div>
              ))}
            </div>
          </section>

          {/* Chat Window */}
          <section className="chat-window">
            <div className="dot-bg" />
            <div className="messages-container">
              <div className="day-divider">
                <span className="day-badge">
                  Aujourd'hui
                </span>
              </div>

              {messages.map((msg) => {
                if (msg.type === "card") return (
                  <div key={msg.id} className="message-item card">
                    <div className="card-message-body">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT_efullc721CcPD_aXcLTzGMBO7LS5teO_JQPc99MmahSuqIGFvfkAzseobPaWHt5p_A7CEFUk9xv5RjD8WUgs2rijCrPNqyh2GrJ_3zmGDpOgubOf9M8qP8k8qulfmroRack1Yue3rkTHK1ev0VFrD3U1obRvUnJExZFB2FxV1bDW8ppYy5LFfDNw_gZ4FXhaLW1pX7S7Rmtw0RnGP884FTBO7Xn5mtNVYRZYWrG5WRxOa62weF9aWsk-XC6IxLqR99MMZ6iB8Q"
                        alt="Villa Azure" className="card-message-img" />
                      <div className="card-message-content">
                        <h4 className="card-title">Villa Azure • Antibes</h4>
                        <p className="card-subtitle">Confirmation de visite envoyée</p>
                        <button className="card-message-btn" onClick={() => onNavigate("accueil")}>
                          Voir l'annonce
                        </button>
                      </div>
                    </div>
                  </div>
                );

                if (msg.from === "me") return (
                  <div key={msg.id} className="message-item sent">
                    <div className="sent-wrapper">
                      <div className="sent-bubble">
                        <p>{msg.text}</p>
                      </div>
                      <div className="sent-status">
                        <p className="sent-time">{msg.time}</p>
                        <span className="material-symbols-outlined">done_all</span>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div key={msg.id} className="message-item received">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaCsZcwVwzzBqPH9CVQnjir53HSq_LbbDIYS6gkWVKN-KeWG3IrXesusQFqqCHBrZUv3jlfnk11XfiE9aSgFFoh2mHCr0STESLlh5oOjwYp4q6AraF5Scw_i4zJ3NwL49RMH1Ds7GKGGZj__q1c_bZECp3kUG0Z4cYneAHXdNaUH0oGsTiCvRthCljmwRd6YWNidXqNiyz8gGavuWm63VChgWyxiUXN3QSLwMoVKwu9xHEq83Cznkbo481fGvEfT4dQjnsYnMauUU"
                      alt="Elena" className="received-avatar" />
                    <div className="received-wrapper">
                      <div className="received-bubble">
                        <p>{msg.text}</p>
                      </div>
                      <p className="received-time">{msg.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="input-bar-container">
              <div className="input-bar-wrapper">
                <div className="input-actions">
                  {["add_circle", "image"].map((ic) => (
                    <button key={ic} className="input-action-btn" type="button">
                      <span className="material-symbols-outlined">{ic}</span>
                    </button>
                  ))}
                </div>
                <div className="input-field-wrapper">
                  <input value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    className="message-input"
                    placeholder="Écrivez votre message..." />
                  <button className="emoji-btn" type="button">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </button>
                </div>
                <button onClick={send} className="btn-send" type="button">
                  <span className="material-symbols-outlined fill-icon">send</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        {[
          { icon: "dashboard", label: "Accueil" },
          { icon: "home_work", label: "Biens" },
          { icon: "mail", label: "Messages", active: true },
          { icon: "favorite", label: "Favoris" },
          { icon: "person", label: "Profil" },
        ].map(({ icon, label, active }) => {
          const handleNav = () => {
            if (label === "Accueil") onNavigate("accueil");
            else if (label === "Biens") onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
            else if (label === "Messages") onNavigate("messages");
            else if (label === "Favoris") onNavigate("favorites");
            else if (label === "Profil") onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
          };
          return (
            <button key={label} onClick={handleNav} className={`mobile-nav-btn ${active ? "active" : "inactive"}`}>
              <span className={`material-symbols-outlined ${active ? "fill-icon" : ""}`}>{icon}</span>
              <span className="mobile-nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}