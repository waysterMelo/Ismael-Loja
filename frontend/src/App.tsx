import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Notes } from './pages/Notes';
import { AuditLogs } from './pages/AuditLogs';
import { PrintPromissoryNote } from './pages/PrintPromissoryNote';
import { Layout } from './components/Layout';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/print-note" element={<PrintPromissoryNote />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/notes" element={<Notes />} />
        <Route
          path="/audit"
          element={
            <AdminRoute>
              <AuditLogs />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
