import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('forno_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('forno_admin');
    return raw ? JSON.parse(raw) : null;
  });

  function loginUser(token, userData) {
    localStorage.setItem('forno_user_token', token);
    localStorage.setItem('forno_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logoutUser() {
    localStorage.removeItem('forno_user_token');
    localStorage.removeItem('forno_user');
    setUser(null);
  }

  function loginAdmin(token, adminData) {
    localStorage.setItem('forno_admin_token', token);
    localStorage.setItem('forno_admin', JSON.stringify(adminData));
    setAdmin(adminData);
  }

  function logoutAdmin() {
    localStorage.removeItem('forno_admin_token');
    localStorage.removeItem('forno_admin');
    setAdmin(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, admin, loginUser, logoutUser, loginAdmin, logoutAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
