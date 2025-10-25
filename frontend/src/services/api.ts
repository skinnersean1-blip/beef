import axios from 'axios';
import type { Debate, Comment, Bet, User, AuthResponse, DebateStats } from '../types';

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

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    displayName: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  getProfile: () => api.get<User>('/auth/profile'),

  updateProfile: (data: { displayName?: string; bio?: string; avatar?: string }) =>
    api.patch<User>('/auth/profile', data),
};

// Debate API
export const debateAPI = {
  getDebates: (params?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => api.get<{ debates: Debate[]; total: number }>('/debates', { params }),

  getDebate: (id: string) => api.get<Debate>(`/debates/${id}`),

  createDebate: (data: {
    topic: string;
    description: string;
    category: string;
    initialAnte: number;
    creatorPosition: string;
  }) => api.post<Debate>('/debates', data),

  acceptDebate: (id: string, data: { challengerPosition: string; challengerAnte: number }) =>
    api.post<Debate>(`/debates/${id}/accept`, data),

  extendDebate: (id: string, additionalAnte: number) =>
    api.post<Debate>(`/debates/${id}/extend`, { additionalAnte }),

  endDebate: (id: string, useAI: boolean) =>
    api.post<Debate>(`/debates/${id}/end`, { useAI }),

  getStats: (id: string) => api.get<DebateStats>(`/debates/${id}/stats`),
};

// Comment API
export const commentAPI = {
  getComments: (debateId: string) =>
    api.get<Comment[]>(`/debates/${debateId}/comments`),

  createComment: (
    debateId: string,
    data: {
      content: string;
      type: 'ARGUMENT' | 'REBUTTAL' | 'EVIDENCE' | 'SPECTATOR';
      sources?: string[];
      parentId?: string;
    }
  ) => api.post<Comment>(`/debates/${debateId}/comments`, data),

  voteOnComment: (commentId: string, type: string) =>
    api.post(`/comments/${commentId}/vote`, { type }),

  voteOnDebate: (debateId: string, type: string) =>
    api.post(`/debates/${debateId}/vote`, { type }),
};

// Bet API
export const betAPI = {
  placeBet: (debateId: string, data: { amount: number; predictedWinner: string }) =>
    api.post<Bet>(`/debates/${debateId}/bets`, data),

  getUserBets: (status?: string) =>
    api.get<Bet[]>('/bets', { params: { status } }),

  getOdds: (debateId: string, predictedWinner: string) =>
    api.get<{ odds: number }>(`/debates/${debateId}/odds/${predictedWinner}`),
};

export default api;
