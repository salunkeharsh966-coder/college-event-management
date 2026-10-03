import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api.js';

/**
 * Keeps track of who is logged in.
 *
 * The user object is stored in localStorage under "ce_user" so that a
 * page refresh does not log the person out. This is intentionally simple
 * for a mini project - a production app would use a JWT or a session
 * cookie instead, because localStorage can be read by any script on the
 * page.
 *
 * The stored object looks like:
 *   { userId: 2, fullName: "Rahul Sharma", email: "...", role: "STUDENT" }
 */
const AuthContext = createContext(null);

const STORAGE_KEY = 'ce_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first render.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    // The backend wraps everything in ApiResponse: { success, message, data }
    const account = data.data;
    persist(account);
    return account;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data.data; // do not log the user in automatically; they log in next
  };

  const logout = () => persist(null);

  const value = {
    user,
    loading,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isStudent: user?.role === 'STUDENT',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Shortcut so components can write: const { user } = useAuth(); */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}
