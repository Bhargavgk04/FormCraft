import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prefer sessionStorage so refresh persists and tab close clears
    let stored = sessionStorage.getItem('auth');
    // Migrate from localStorage if present (legacy)
    if (!stored) {
      const legacy = localStorage.getItem('auth');
      if (legacy) {
        try {
          sessionStorage.setItem('auth', legacy);
          localStorage.removeItem('auth');
          stored = legacy;
        } catch (error) {
          console.error('Failed to migrate auth from localStorage:', error);
        }
      }
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
      }
    }
    setLoading(false);
  }, []);

  // No beforeunload clearing; sessionStorage clears on tab close automatically

  const login = async (email, password, remember = false) => {
    const { token, user } = await api.login({ email, password });
    setUser(user);
    setToken(token);
    const payload = JSON.stringify({ token, user });
    if (remember) {
      localStorage.setItem('auth', payload);
      sessionStorage.removeItem('auth');
    } else {
      sessionStorage.setItem('auth', payload);
      localStorage.removeItem('auth');
    }
    return user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('auth');
    // Toast message will be handled in Navbar component where useToast is available
  };

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}



