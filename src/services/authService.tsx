// services/authService.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { RegisterRequest, LoginRequest, AuthResponse, UserResponse, ApiResponse, UpdateProfileRequest } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token aux requêtes
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les réponses et les erreurs
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Ne pas rediriger automatiquement, laisser le composant gérer
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await authAPI.post('/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await authAPI.post('/login', data);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    const response: AxiosResponse<ApiResponse<UserResponse>> = await authAPI.get('/me');
    return response.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await authAPI.post('/logout');
    return response.data;
  },

  async verifyToken(): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await authAPI.get('/verify');
    return response.data;
  },

   async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> {
    console.log('📤 Envoi de la requête updateProfile:', data);
    const response: AxiosResponse<ApiResponse<UserResponse>> = await authAPI.put('/profile', data);
    console.log('📥 Réponse updateProfile reçue:', response.data);
    return response.data;
  },
};