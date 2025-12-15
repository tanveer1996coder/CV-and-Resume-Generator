import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import HowToUse from './pages/HowToUse';
import BuildResume from './pages/BuildResume';
import BuildCoverLetter from './pages/BuildCoverLetter';
import BuildCV from './pages/BuildCV';
import Blog from './pages/Blog';

function Navbar() {
  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'white' }}>
          Resume<span style={{ color: 'var(--primary)' }}>AI</span>
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Home</Link>
          <Link to="/how-to-use" style={{ color: '#e2e8f0', textDecoration: 'none' }}>How to Use</Link>
          <Link to="/build-resume" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Resume</Link>
          <Link to="/build-cv" style={{ color: '#e2e8f0', textDecoration: 'none' }}>CV</Link>
          <Link to="/build-cover-letter" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Cover Letter</Link>
          <Link to="/blog" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Blog</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/resume" element={<BuildResume />} />
        <Route path="/build-resume" element={<BuildResume />} />
        <Route path="/build-cover-letter" element={<BuildCoverLetter />} />
        <Route path="/build-cv" element={<BuildCV />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </Router>
  );
}

export default App;
