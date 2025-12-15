import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InputPage from './pages/InputPage';
import CategoryPage from './pages/CategoryPage';
import TemplatePage from './pages/TemplatePage';
import EditorPage from './pages/EditorPage';
import { ResumeProvider } from './context/ResumeContext';

function App() {
  return (
    <ResumeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/start" element={<InputPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/designs" element={<TemplatePage />} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        </div>
      </Router>
    </ResumeProvider>
  );
}

export default App;
