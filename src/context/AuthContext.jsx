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
    
    // --- UPDATED LOGIC ---
    const userEmail = res.data.email.toLowerCase();

    // 1. Check specific admin email
    // 2. Check if starts with 'ecom@'
    // 3. Check if domain is '@delitechecom.com'
    if (
        userEmail === 'admin@delitech.com' || 
        userEmail.startsWith('ecom@') || 
        userEmail.endsWith('@ecom.com')
    ) {
      res.data.business_type = 'ecommerce';
    }
    // ---------------------

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