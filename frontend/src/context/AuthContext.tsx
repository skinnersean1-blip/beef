import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    displayName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
          setToken(savedToken);
          socketService.connect(savedToken);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { user, token } = response.data;

    localStorage.setItem('token', token);
    setUser(user);
    setToken(token);
    socketService.connect(token);
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    displayName: string;
  }) => {
    const response = await authAPI.register(data);
    const { user, token } = response.data;

    localStorage.setItem('token', token);
    setUser(user);
    setToken(token);
    socketService.connect(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    socketService.disconnect();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
