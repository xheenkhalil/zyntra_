// /frontend/src/context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  login as apiLogin,
  apiLogout,
  checkSession,
} from '../services/authService';

// ==== Interfaces ====
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface IAuthContext {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
}

// ==== Create Context ====
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// ==== Provider ====
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    () => JSON.parse(localStorage.getItem('user') || 'null')
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // === Check existing session on mount ===
  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await checkSession();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.warn('Session check failed:', error);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  // === Login ===
  const login = async (credentials: LoginCredentials) => {
    try {
      const data = await apiLogin(credentials);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      throw error;
    }
  };

  // === Logout ===
  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API failed, forcing local logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login'); // 🔁 optional redirect
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ==== Hook ====
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
