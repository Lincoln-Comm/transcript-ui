'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  login as loginAPI, 
  logout as logoutFn,
  changePasswordAPI,
  getAuthToken, 
  getAuthUser, 
  getAuthPermissions,
  setAuthToken, 
  setAuthUser,
  setAuthPermissions,
  AuthUser,
  LoginCredentials,
  Permissions,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  permissions: Permissions | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (resource: keyof Permissions, action: string) => boolean;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing auth on mount
  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();
    const storedPermissions = getAuthPermissions();
    
    if (token && storedUser) {
      setUser(storedUser);
      setPermissions(storedPermissions);
      console.log('🔐 User restored from storage:', storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login...');
      const response = await loginAPI(credentials);
      
      console.log('Login successful:', response);
      
      // Store token, user, and permissions
      setAuthToken(response.token);
      setAuthUser(response.user);
      setAuthPermissions(response.permissions);
      setUser(response.user);
      setPermissions(response.permissions);
      
      // Redirect based on must_change_password
      if (response.must_change_password) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      console.error('Login failed:', message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔑 Changing password...');
      const response = await changePasswordAPI(currentPassword, newPassword);
      
      console.log('✅ Password changed successfully');
      
      // Update token and user
      setAuthToken(response.token);
      setAuthUser(response.user);
      setUser(response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      console.error('Password change failed:', message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    console.log('👋 Logging out...');
    logoutFn();
    setUser(null);
    setPermissions(null);
    router.push('/login');
  }, [router]);

  const hasPermission = useCallback((resource: keyof Permissions, action: string): boolean => {
    if (!permissions) return false;
    return permissions[resource]?.includes(action) || false;
  }, [permissions]);

  const isAdmin = user?.role === 'admin';
  const mustChangePassword = user?.must_change_password || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        mustChangePassword,
        login,
        logout,
        changePassword,
        hasPermission,
        isAdmin,
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

// 'use client';

// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   login as loginAPI, 
//   logout as logoutAPI,
//   changePasswordAPI,
//   getAuthToken, 
//   getAuthUser, 
//   getAuthPermissions,
//   setAuthToken, 
//   setAuthUser,
//   setAuthPermissions,
//   AuthUser,
//   LoginCredentials,
//   Permissions,
// } from '@/lib/auth';

// interface AuthContextType {
//   user: AuthUser | null;
//   permissions: Permissions | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   mustChangePassword: boolean;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => void;
//   changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
//   hasPermission: (resource: keyof Permissions, action: string) => boolean;
//   isAdmin: boolean;
//   error: string | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [permissions, setPermissions] = useState<Permissions | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   // Check for existing auth on mount
//   useEffect(() => {
//     const token = getAuthToken();
//     const storedUser = getAuthUser();
//     const storedPermissions = getAuthPermissions();
    
//     if (token && storedUser) {
//       setUser(storedUser);
//       setPermissions(storedPermissions);
//       console.log('🔐 User restored from storage:', storedUser);
//     }
//     setIsLoading(false);
//   }, []);

//   const login = useCallback(async (credentials: LoginCredentials) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       console.log('🔑 Attempting login...');
//       const response = await loginAPI(credentials);
      
//       console.log('✅ Login successful:', response);
      
//       // Store token, user, and permissions
//       setAuthToken(response.token);
//       setAuthUser(response.user);
//       setAuthPermissions(response.permissions);
//       setUser(response.user);
//       setPermissions(response.permissions);
      
//       // Redirect based on must_change_password
//       if (response.must_change_password) {
//         router.push('/change-password');
//       } else {
//         router.push('/dashboard');
//       }
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Login failed';
//       console.error('❌ Login failed:', message);
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [router]);

//   const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       console.log('🔑 Changing password...');
//       const response = await changePasswordAPI(currentPassword, newPassword);
      
//       console.log('✅ Password changed successfully');
      
//       // Update token and user
//       setAuthToken(response.token);
//       setAuthUser(response.user);
//       setUser(response.user);
      
//       // Redirect to dashboard
//       router.push('/dashboard');
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Failed to change password';
//       console.error('❌ Password change failed:', message);
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [router]);

//   const logout = useCallback(() => {
//     console.log('👋 Logging out...');
//     logoutAPI();
//     setUser(null);
//     setPermissions(null);
//     router.push('/login');
//   }, [router]);

//   const hasPermission = useCallback((resource: keyof Permissions, action: string): boolean => {
//     if (!permissions) return false;
//     return permissions[resource]?.includes(action) || false;
//   }, [permissions]);

//   const isAdmin = user?.role === 'admin';
//   const mustChangePassword = user?.must_change_password || false;

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         permissions,
//         isLoading,
//         isAuthenticated: !!user,
//         mustChangePassword,
//         login,
//         logout,
//         changePassword,
//         hasPermission,
//         isAdmin,
//         error,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// 'use client';

// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   login as loginAPI, 
//   logout as logoutAPI,
//   getAuthToken, 
//   getAuthUser, 
//   setAuthToken, 
//   setAuthUser,
//   AuthUser,
//   LoginCredentials,
// } from '@/lib/auth';

// interface AuthContextType {
//   user: AuthUser | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => void;
//   error: string | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   // Check for existing auth on mount
//   useEffect(() => {
//     const token = getAuthToken();
//     const storedUser = getAuthUser();
    
//     if (token && storedUser) {
//       setUser(storedUser);
//       console.log('🔐 User restored from storage:', storedUser);
//     }
//     setIsLoading(false);
//   }, []);

//   const login = useCallback(async (credentials: LoginCredentials) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       console.log('🔑 Attempting login...');
//       const response = await loginAPI(credentials);
      
//       console.log('✅ Login successful:', response);
      
//       // Store token and user
//       setAuthToken(response.token);
//       setAuthUser(response.user);
//       setUser(response.user);
      
//       // Redirect to dashboard
//       router.push('/dashboard');
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Login failed';
//       console.error('❌ Login failed:', message);
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [router]);

//   const logout = useCallback(() => {
//     console.log('👋 Logging out...');
//     logoutAPI();
//     setUser(null);
//     router.push('/login');
//   }, [router]);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         isAuthenticated: !!user,
//         login,
//         logout,
//         error,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }