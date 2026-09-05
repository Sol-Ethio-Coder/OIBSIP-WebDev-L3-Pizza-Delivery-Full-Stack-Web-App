import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Attach whichever token is present — user or admin — to every request.
api.interceptors.request.use(config => {
  const userToken = localStorage.getItem('forno_user_token');
  const adminToken = localStorage.getItem('forno_admin_token');
  const token = config.url?.startsWith('/admin') ? adminToken : userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
