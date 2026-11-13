import axios from 'axios';

// Render backend URL (configured from Vercel env or default deployed URL)
export const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'https://ice-cream-shop-rpze.onrender.com';

// Use local proxy in dev, direct Render backend URL in production
const API_BASE = import.meta.env.DEV
  ? '/api'
  : `${BACKEND_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper for resolving image uploads
export const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/uploads')) {
    return `${BACKEND_URL.replace(/\/$/, '')}${path}`;
  }
  return path;
};

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scoop_dreams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    const customErr = new Error(message);
    customErr.status = error.response?.status;
    customErr.response = error.response;
    return Promise.reject(customErr);
  }
);

// API Modules
export const adminAuthAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/admin/profile'),
};

export const userAuthAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
};

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (data) => api.post('/cart/coupon/apply', data),
};

export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

export const customersAPI = {
  getAll: (params) => api.get('/admin/customers', { params }),
  getById: (id) => api.get(`/admin/customers/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  updatePassword: (data) => api.put('/admin/settings/password', data),
  updateProfile: (data) => api.put('/admin/settings/profile', data),
  resetData: () => api.post('/admin/settings/reset-data'),
  getReports: (params) => api.get('/admin/reports', { params }),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  uploadImage: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const iceCreamsAPI = {
  getAll: (params) => api.get('/icecreams', { params }),
  getById: (id) => api.get(`/icecreams/${id}`),
  create: (data) => api.post('/icecreams', data),
  update: (id, data) => api.put(`/icecreams/${id}`, data),
  delete: (id) => api.delete(`/icecreams/${id}`),
};

export const flavorsAPI = {
  getAll: (params) => api.get('/flavors', { params }),
  getById: (id) => api.get(`/flavors/${id}`),
  create: (data) => api.post('/flavors', data),
  update: (id, data) => api.put(`/flavors/${id}`, data),
  delete: (id) => api.delete(`/flavors/${id}`),
};

export const uploadAPI = {
  uploadImage: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
