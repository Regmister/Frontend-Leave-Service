import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwt');
    return token ? decodeJwt(token) : null;
  });

  useEffect(() => {
    if (!user) return;
    const msUntilExpiry = user.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(logout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [user]);

  const storeToken = useCallback((jwt) => {
    localStorage.setItem('jwt', jwt);
    setUser(decodeJwt(jwt));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setUser(null);
  }, []);

  const value = {
    user,
    isLoggedIn: !!user,
    storeToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
