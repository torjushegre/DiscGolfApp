import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Room from './components/Room';
import AllDiscs from './components/AllDiscs';
import AddDiscForm from './components/AddDiscForm';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import ProfilePage from './components/ProfilePage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Routes>
          <Route path="/" element={<Room />} />
          <Route path="/all-discs" element={<AllDiscs />} />
          <Route path="/add-disc" element={<AddDiscForm />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0f172a] bg-[url('/background_garage.png')] bg-cover bg-center bg-fixed bg-no-repeat">
          <div className="min-h-screen bg-black/40">
            <AppContent />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
