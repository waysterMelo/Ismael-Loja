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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('iwr_token');
    const storedUser = localStorage.getItem('iwr_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('iwr_user');
        localStorage.removeItem('iwr_token');
      }
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
