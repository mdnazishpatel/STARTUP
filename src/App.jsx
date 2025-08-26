// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Create from './components/Create';
import ErrorBoundary from './components/ErrorBoundary';
import CodePage from './components/CodePage'; // Import CodePage from the correct path
import LikedIdeaPage from './components/LikedIdeaPage'; // Corrected path to match your previous messages
import './App.css';
import PremiumPage from './components/PremiumPage';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<Create />} />
            <Route
          path="/code"
          element={
            <ErrorBoundary>
              <CodePage />
            </ErrorBoundary>
          }
        />
        <Route path="/premium" element={<PremiumPage />} />
          <Route path="/liked-ideas" element={<LikedIdeaPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;