import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Room from './components/Room';
import AllDiscs from './components/AllDiscs';
import AddDiscForm from './components/AddDiscForm';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] bg-[url('/background_garage.png')] bg-cover bg-center bg-fixed bg-no-repeat">
        <div className="min-h-screen bg-black/40">
          <Navbar />
          <div className="container mx-auto px-4 py-8 pt-24">
            <Routes>
              <Route path="/" element={<Room />} />
              <Route path="/all-discs" element={<AllDiscs />} />
              <Route path="/add-disc" element={<AddDiscForm />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
