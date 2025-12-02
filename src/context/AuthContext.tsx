// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

type AuthUser = {
  email: string;
  name?: string;
  role?: string;
  photoURL?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setAuthFromBackend: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setAuthFromBackend: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // অ্যাপ start হলে AsyncStorage থেকে user+token লোড করি
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');

        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const setAuthFromBackend = async (backendUser: AuthUser, token: string) => {
    // axios header
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    // AsyncStorage
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(backendUser));
    // Context state
    setUser(backendUser);
  };

  const logout = async () => {
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setAuthFromBackend,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
