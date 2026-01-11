import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    
    // --- UPDATED LOGIC START ---
    const userEmail = res.data.email.toLowerCase();

    // Check if email starts with 'ecom@' OR ends with '@delitechecom.com'
    // This covers: ecom@delitech.com, admin@delitechecom.com, ecom@gmail.com etc.
    if (userEmail.startsWith('ecom@') || userEmail.endsWith('@delitechecom.com')) {
      res.data.business_type = 'ecommerce';
    }
    // --- UPDATED LOGIC END ---

    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);