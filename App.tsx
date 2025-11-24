import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Notes } from './pages/Notes';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Initialize Mock DB
    storageService.init();
  }, []);

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
      <div className="fixed bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 p-1 rounded pointer-events-none">
        Frontend Demo Mode (Local Storage)
      </div>
    </Layout>
  );
};

export default App;