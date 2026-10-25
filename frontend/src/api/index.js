import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ─── Trips ────────────────────────────────
export const tripsAPI = {
  create: (data) => api.post('/trips', data),
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  generate: (id) => api.post(`/trips/${id}/generate`),
  share: (id) => api.post(`/trips/${id}/share`),
};

// ─── Itineraries ──────────────────────────
export const itinerariesAPI = {
  getByTrip: (tripId) => api.get(`/itineraries/${tripId}`),
  getShared: (token) => api.get(`/itineraries/shared/${token}`),
};

// ─── Places ───────────────────────────────
export const placesAPI = {
  save: (data) => api.post('/places', data),
  getAll: () => api.get('/places'),
  delete: (id) => api.delete(`/places/${id}`),
};

// ─── History ──────────────────────────────
export const historyAPI = {
  getHistory: () => api.get('/history'),
  getTrips: () => api.get('/history/trips'),
};

export default api;
