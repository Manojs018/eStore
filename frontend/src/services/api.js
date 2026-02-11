import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.estore.com' : '/api'),
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF Token
    const csrfToken = getCookie('XSRF-TOKEN') || localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get('/csrf-token');
    localStorage.setItem('csrfToken', data.csrfToken);
    api.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token', error);
  }
};