'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

// Idle timeout in milliseconds (15 minutes)
const IDLE_TIMEOUT = 15 * 60 * 1000;
// Warning shows 2 minutes before logout
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000;

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

// Session Warning Modal Component
function SessionWarningModal({ 
  isOpen, 
  secondsRemaining, 
  onStayLoggedIn, 
  onLogout 
}: { 
  isOpen: boolean; 
  secondsRemaining: number; 
  onStayLoggedIn: () => void; 
  onLogout: () => void;
}) {
  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay = minutes > 0 
    ? `${minutes}:${seconds.toString().padStart(2, '0')}` 
    : `${seconds} seconds`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-amber-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Session Expiring</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Your session is about to expire due to inactivity.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-amber-700 mb-1">You will be logged out in</p>
            <p className="text-3xl font-bold text-amber-600">{timeDisplay}</p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Click &quot;Stay Logged In&quot; to continue your session.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Log Out
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const router = useRouter();
  
  // Refs for timers and state
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const showWarningRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Perform logout
  const performLogout = useCallback(() => {
    console.log('Logging out...');
    clearAllTimers();
    logoutFn();
    setUser(null);
    setPermissions(null);
    setShowWarning(false);
    router.push('/login');
  }, [router, clearAllTimers]);

  // Start the idle timer
  const startIdleTimer = useCallback(() => {
    // Clear any existing timers
    clearAllTimers();
    setShowWarning(false);

    // Set timer to show warning (13 minutes)
    warningTimerRef.current = setTimeout(() => {
      console.log('Session warning: 2 minutes until logout');
      setShowWarning(true);
      
      // Start countdown
      const warningSeconds = Math.floor(WARNING_BEFORE_LOGOUT / 1000);
      setSecondsRemaining(warningSeconds);
      
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set timer for actual logout (2 more minutes)
      logoutTimerRef.current = setTimeout(() => {
        console.log('Session expired due to inactivity');
        performLogout();
      }, WARNING_BEFORE_LOGOUT);

    }, IDLE_TIMEOUT - WARNING_BEFORE_LOGOUT);

    console.log('Idle timer started');
  }, [clearAllTimers, performLogout]);

  // Handle stay logged in
  const handleStayLoggedIn = useCallback(() => {
    console.log('User chose to stay logged in');
    startIdleTimer();
  }, [startIdleTimer]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    let lastActivity = Date.now();
    
    const handleActivity = () => {
      // Don't reset if warning is showing
      if (showWarningRef.current) return;
      
      const now = Date.now();
      if (now - lastActivity > 1000) {
        lastActivity = now;
        startIdleTimer();
      }
    };

    // Add listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer
    startIdleTimer();
    console.log('Idle timeout initialized (15 minutes, warning at 13 minutes)');

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [user, startIdleTimer, clearAllTimers]);

  // Check for existing auth on mount
  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();
    const storedPermissions = getAuthPermissions();
    
    if (token && storedUser) {
      setUser(storedUser);
      setPermissions(storedPermissions);
      console.log('User restored from storage:', storedUser);
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
      
      setAuthToken(response.token);
      setAuthUser(response.user);
      setAuthPermissions(response.permissions);
      setUser(response.user);
      setPermissions(response.permissions);
      
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
      console.log('Changing password...');
      const response = await changePasswordAPI(currentPassword, newPassword);
      
      console.log('Password changed successfully');
      
      setAuthToken(response.token);
      setAuthUser(response.user);
      setUser(response.user);
      
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
    performLogout();
  }, [performLogout]);

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
      
      <SessionWarningModal
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={performLogout}
      />
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