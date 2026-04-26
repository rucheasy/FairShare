import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import GroupPage from './pages/GroupPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group/:id" element={<GroupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
