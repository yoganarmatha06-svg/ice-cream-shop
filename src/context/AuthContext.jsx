import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI, userAuthAPI } from '../services/api';

const AuthContext = createContext();

// 7 Days Session Expiration Constant (7 days in milliseconds)
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getInitialAuthState = () => {
  try {
    const loginTime = localStorage.getItem('scoop_dreams_login_time');
    // If login time exists and is older than 7 days, expire the session
    if (loginTime && Date.now() - Number(loginTime) > SEVEN_DAYS_MS) {
      localStorage.removeItem('scoop_dreams_user');
      localStorage.removeItem('scoop_dreams_token');
      localStorage.removeItem('scoop_dreams_role');
      localStorage.removeItem('scoop_dreams_login_time');
      return { user: null, token: null, role: null };
    }

    const savedUser = localStorage.getItem('scoop_dreams_user');
    const savedToken = localStorage.getItem('scoop_dreams_token');
    const savedRole = localStorage.getItem('scoop_dreams_role');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken || null,
      role: savedRole || null,
    };
  } catch {
    return { user: null, token: null, role: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initial = getInitialAuthState();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [role, setRole] = useState(initial.role);
  const [loading, setLoading] = useState(true);

  // Auto-restore session from backend on mount or token change
  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem('scoop_dreams_token');
      const storedRole = localStorage.getItem('scoop_dreams_role');
      const storedUser = localStorage.getItem('scoop_dreams_user');
      const loginTime = localStorage.getItem('scoop_dreams_login_time');

      // Check if 7 days have passed since login
      if (loginTime && Date.now() - Number(loginTime) > SEVEN_DAYS_MS) {
        console.warn('Session has reached 7-day expiration limit.');
        logout();
        setLoading(false);
        return;
      }

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
            if (!loginTime) {
              localStorage.setItem('scoop_dreams_login_time', Date.now().toString());
            }
          }
        } catch (err) {
          console.warn('Session profile check notice:', err.message);
          // Only log out if the backend explicitly rejected the token with 401 Unauthorized
          if (err?.status === 401 || err?.response?.status === 401) {
            logout();
          } else if (storedUser) {
            // Maintain the logged-in session from localStorage across refreshes/network lags
            try {
              const parsed = JSON.parse(storedUser);
              setUser(parsed);
              setRole(storedRole || parsed.role || 'user');
            } catch {}
          }
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
      localStorage.setItem('scoop_dreams_login_time', Date.now().toString());
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
      localStorage.setItem('scoop_dreams_login_time', Date.now().toString());
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
      localStorage.setItem('scoop_dreams_login_time', Date.now().toString());
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
    localStorage.removeItem('scoop_dreams_login_time');
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
