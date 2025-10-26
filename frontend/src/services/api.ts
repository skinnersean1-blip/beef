import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const debateAPI = {
  getDebates: (params?: any) => api.get('/debates', { params }),
  getDebate: (id: string) => api.get(`/debates/${id}`),
  createDebate: (data: any) => api.post('/debates', data),
  acceptDebate: (id: string, data: any) => api.post(`/debates/${id}/accept`, data),
  finalizeDebate: (id: string, data: any) => api.post(`/debates/${id}/finalize`, data),
  addComment: (id: string, data: any) => api.post(`/debates/${id}/comments`, data),
  vote: (data: any) => api.post('/votes', data),
  placeBet: (data: any) => api.post('/bets', data),
};

export default api;
