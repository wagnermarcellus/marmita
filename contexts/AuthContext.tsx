import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockService } from '../services/mockService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  loginWithSocial: (provider: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedUser = localStorage.getItem('marmita_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const savedTheme = localStorage.getItem('marmita_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('marmita_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const loggedUser = await mockService.login(email, password);
      setUser(loggedUser);
      localStorage.setItem('marmita_user', JSON.stringify(loggedUser));
    } catch (error) {
      console.error("Login failed", error);
      alert(error instanceof Error ? error.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const newUser = await mockService.register(name, email, password, role);
      setUser(newUser);
      localStorage.setItem('marmita_user', JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration failed", error);
      alert(error instanceof Error ? error.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  const loginWithSocial = async (provider: string) => {
    setLoading(true);
    try {
      const loggedUser = await mockService.socialLogin(provider);
      setUser(loggedUser);
      localStorage.setItem('marmita_user', JSON.stringify(loggedUser));
    } catch (error) {
      alert("Erro ao conectar com " + provider);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marmita_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = await mockService.updateUser(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('marmita_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithSocial, logout, updateProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};