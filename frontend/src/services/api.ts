import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const beefAPI = {
  getBeefs: (params?: any) => api.get('/beefs', { params }),
  getBeef: (id: string) => api.get(`/beefs/${id}`),
  createBeef: (data: any) => api.post('/beefs', data),
  acceptBeef: (id: string, data: any) => api.post(`/beefs/${id}/accept`, data),
  addPost: (id: string, data: any) => api.post(`/beefs/${id}/posts`, data),
  withdrawBeef: (id: string) => api.post(`/beefs/${id}/withdraw`),
  concede: (id: string) => api.post(`/beefs/${id}/concede`),
  toggleLike: (id: string, isLike: boolean) => api.post(`/beefs/${id}/like`, { isLike }),
};

export default api;
