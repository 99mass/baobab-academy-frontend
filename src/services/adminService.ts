// services/adminService.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { UserResponse, ApiResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token aux requêtes
adminAPI.interceptors.request.use(
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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UsersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
}

export const adminService = {
  async getUsers(params: UsersParams = {}): Promise<ApiResponse<PageResponse<UserResponse>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params.search) queryParams.append('search', params.search);

    const response: AxiosResponse<ApiResponse<PageResponse<UserResponse>>> = 
      await adminAPI.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = 
      await adminAPI.delete(`/users/${userId}`);
    return response.data;
  },

  async changeUserRole(userId: string, role: string): Promise<ApiResponse<UserResponse>> {
    const response: AxiosResponse<ApiResponse<UserResponse>> = 
      await adminAPI.put(`/users/${userId}/role?role=${role}`);
    return response.data;
  },

  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    const response: AxiosResponse<ApiResponse<PlatformStats>> = 
      await adminAPI.get('/stats');
    return response.data;
  },
};