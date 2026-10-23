import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Accueil from './components/Accueil';
import Connect from './components/connexion';
import AdminDashboard from './components/adminDashbord';
import Aide from './components/aide';
import PropertyDetails from './components/annomce';
import AdminUsers from './components/gestionUser';
import ContactRequests from './components/ContactRequests';
import Messages from './components/message';
import Dashboard from './components/dashborduser';
import Favorites from './components/favories';
import Apropos from './components/Apropos';
import Contact from './components/Contact';
import DeconnexionSucces from './components/DeconnexionSucces';
import CreerAnnonce from './components/CreerAnnonce';
import AdminStats from './components/AdminStats';
import AdminSettings from './components/AdminSettings';
import UserSettings from './components/UserSettings';
import LegalPage from './components/LegalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Accueil />} />
        <Route path="/about" element={<Apropos />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/aide" element={<Aide />} />
        <Route path="/annonce/:id" element={<PropertyDetails />} />
        <Route path="/login" element={<Connect />} />
        <Route path="/logged-out" element={<DeconnexionSucces />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* Client Space Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/publier" element={<CreerAnnonce />} />
        <Route path="/dashboard/demandes" element={<ContactRequests />} />
        <Route path="/dashboard/favoris" element={<Favorites />} />
        <Route path="/dashboard/messages" element={<Messages />} />
        <Route path="/dashboard/profile" element={<UserSettings />} />


        {/* Admin Space Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/annonces" element={<AdminDashboard />} />
        <Route path="/admin/utilisateurs" element={<AdminUsers />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/demandes" element={<ContactRequests />} />

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
