import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Notes } from './pages/Notes';
import { Login } from './pages/Login';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Mock DB
    storageService.init();

    // Check for existing session
    const token = localStorage.getItem('iwr_token');
    if (token) {
      setIsAuthenticated(true);
    }
    
    // Fake loading for smoothness
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('iwr_token');
    setIsAuthenticated(false);
  };

  // Prevent flash of content
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'customers': return <Customers />;
      case 'pos': return <POS />;
      case 'notes': return <Notes />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
      
      {/* Dev Note */}
      <div className="fixed bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 p-1 rounded pointer-events-none z-50">
        Frontend Demo Mode (Local Storage)
      </div>
    </Layout>
  );
};

export default App;