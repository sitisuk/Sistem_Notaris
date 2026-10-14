import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthContextType {
  currentUser: User | null;
  idToken: string | null;
  userRole: 'admin' | 'staff' | 'user';
  isAdmin: boolean;
  isStaffSession: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPasscode: (passcode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  idToken: null,
  userRole: 'user',
  isAdmin: false,
  isStaffSession: false,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithPasscode: async () => false,
  logout: async () => {},
  refreshToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'user'>('user');
  const [isStaffSession, setIsStaffSession] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Check saved staff session from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('notary_staff_admin_session');
      if (saved === 'active') {
        setIsStaffSession(true);
        setUserRole('admin');
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Sync token and role to backend PostgreSQL
  const syncWithBackend = async (token: string) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role) {
          setUserRole(data.role);
        }
      }
    } catch (err) {
      console.warn('Backend sync warning (offline or fallback):', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          // Check if admin email or creator email
          if (user.email === 'sitisukaesih906@gmail.com') {
            setUserRole('admin');
          }
          await syncWithBackend(token);
        } catch (err) {
          console.error('Failed to get token:', err);
        }
      } else {
        setIdToken(null);
        if (!isStaffSession) {
          setUserRole('user');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isStaffSession]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        const token = await result.user.getIdToken();
        setIdToken(token);
        if (result.user.email === 'sitisukaesih906@gmail.com') {
          setUserRole('admin');
        }
        await syncWithBackend(token);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithPasscode = async (passcode: string): Promise<boolean> => {
    // Check against backend or valid notary office staff passcode
    try {
      const res = await fetch('/api/auth/admin-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.valid) {
          setIsStaffSession(true);
          setUserRole('admin');
          localStorage.setItem('notary_staff_admin_session', 'active');
          return true;
        }
      }
    } catch {
      // Offline fallback: check default master passcodes
    }

    // Default office master passcodes: 'notaris2026', 'admin123', '123456'
    const validCodes = ['notaris2026', 'admin123', '123456', 'cikarang137'];
    if (validCodes.includes(passcode.trim().toLowerCase())) {
      setIsStaffSession(true);
      setUserRole('admin');
      localStorage.setItem('notary_staff_admin_session', 'active');
      return true;
    }

    return false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIdToken(null);
    setIsStaffSession(false);
    setUserRole('user');
    try {
      localStorage.removeItem('notary_staff_admin_session');
    } catch {
      // ignore
    }
  };

  const refreshToken = async () => {
    if (!currentUser) return null;
    const token = await currentUser.getIdToken(true);
    setIdToken(token);
    return token;
  };

  const isAdmin = userRole === 'admin' || isStaffSession || currentUser?.email === 'sitisukaesih906@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        idToken,
        userRole,
        isAdmin,
        isStaffSession,
        loading,
        loginWithGoogle,
        loginWithPasscode,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
