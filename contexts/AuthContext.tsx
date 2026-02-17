'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  login as loginAPI, 
  logout as logoutAPI,
  getAuthToken, 
  getAuthUser, 
  setAuthToken, 
  setAuthUser,
  AuthUser,
  LoginCredentials,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing auth on mount
  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();
    
    if (token && storedUser) {
      setUser(storedUser);
      console.log('🔐 User restored from storage:', storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔑 Attempting login...');
      const response = await loginAPI(credentials);
      
      console.log('✅ Login successful:', response);
      
      // Store token and user
      setAuthToken(response.token);
      setAuthUser(response.user);
      setUser(response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      console.error('❌ Login failed:', message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    console.log('👋 Logging out...');
    logoutAPI();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        error,
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