import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Bag from './components/Bag';
import Shelf from './components/Shelf';
import WallOfFame from './components/WallOfFame';
import AddDiscForm from './components/AddDiscForm';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/bag" replace />} />
            <Route path="/bag" element={<Bag />} />
            <Route path="/shelf" element={<Shelf />} />
            <Route path="/wall-of-fame" element={<WallOfFame />} />
            <Route path="/add-disc" element={<AddDiscForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
