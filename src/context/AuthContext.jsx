import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI, userAuthAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('scoop_dreams_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('scoop_dreams_token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('scoop_dreams_role') || null);
  const [loading, setLoading] = useState(true);

  // Auto-restore session from backend on mount or token change
  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem('scoop_dreams_token');
      const storedRole = localStorage.getItem('scoop_dreams_role');

      if (storedToken) {
        try {
          let res;
          if (storedRole === 'admin') {
            res = await adminAuthAPI.getProfile();
          } else {
            res = await userAuthAPI.getProfile();
          }

          if (res?.success && res.data) {
            setUser(res.data);
            setRole(res.data.role);
            localStorage.setItem('scoop_dreams_user', JSON.stringify(res.data));
            localStorage.setItem('scoop_dreams_role', res.data.role);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  // Dedicated Admin Login (calls /api/admin/login)
  const adminLogin = async (email, password) => {
    const res = await adminAuthAPI.login({ email, password });
    if (res?.success && res.data) {
      const adminData = res.data;
      const authToken = res.token;
      setUser(adminData);
      setRole('admin');
      setToken(authToken);
      localStorage.setItem('scoop_dreams_user', JSON.stringify(adminData));
      localStorage.setItem('scoop_dreams_role', 'admin');
      localStorage.setItem('scoop_dreams_token', authToken);
      return adminData;
    }
    throw new Error(res?.message || 'Admin authentication failed');
  };

  // Dedicated User / Customer Login (calls /api/users/login)
  const userLogin = async (email, password) => {
    const res = await userAuthAPI.login({ email, password });
    if (res?.success && res.data) {
      const userData = res.data;
      const authToken = res.token;
      setUser(userData);
      setRole('user');
      setToken(authToken);
      localStorage.setItem('scoop_dreams_user', JSON.stringify(userData));
      localStorage.setItem('scoop_dreams_role', 'user');
      localStorage.setItem('scoop_dreams_token', authToken);
      return userData;
    }
    throw new Error(res?.message || 'Login failed');
  };

  // Dedicated Customer Registration (calls /api/users/register)
  const userRegister = async (userData) => {
    const res = await userAuthAPI.register(userData);
    if (res?.success && res.data) {
      const newUser = res.data;
      const authToken = res.token;
      setUser(newUser);
      setRole('user');
      setToken(authToken);
      localStorage.setItem('scoop_dreams_user', JSON.stringify(newUser));
      localStorage.setItem('scoop_dreams_role', 'user');
      localStorage.setItem('scoop_dreams_token', authToken);
      return newUser;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  // Backward compatible aliases
  const login = (email, password) => userLogin(email, password);
  const register = (userData) => userRegister(userData);

  // Logout - clears all auth state and stored credentials
  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('scoop_dreams_user');
    localStorage.removeItem('scoop_dreams_token');
    localStorage.removeItem('scoop_dreams_role');
  };

  const updateProfile = async (formData) => {
    // Keep local user profile updated
    setUser((prev) => ({ ...prev, ...formData }));
    localStorage.setItem(
      'scoop_dreams_user',
      JSON.stringify({ ...user, ...formData })
    );
    return { ...user, ...formData };
  };

  const isAdmin = role === 'admin' || user?.role === 'admin';
  const isUser = role === 'user' || user?.role === 'user';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isAuthenticated,
        isAdmin,
        isUser,
        adminLogin,
        userLogin,
        userRegister,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
