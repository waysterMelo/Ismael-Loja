import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { get } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('iwr_token');

    if (token) {
      // Buscar dados atualizados do backend ao invés de confiar no localStorage
      get<{ user: User }>('/api/auth/me')
        .then((response) => {
          setUser(response.user);
          localStorage.setItem('iwr_user', JSON.stringify(response.user));
        })
        .catch(() => {
          // Token inválido ou expirado
          localStorage.removeItem('iwr_token');
          localStorage.removeItem('iwr_user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('iwr_token');
    localStorage.removeItem('iwr_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('iwr_token');
    if (!token) {
      logout();
      return;
    }

    try {
      const response = await get<{ user: User }>('/api/auth/me');
      setUser(response.user);
      localStorage.setItem('iwr_user', JSON.stringify(response.user));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
