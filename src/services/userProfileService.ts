/* eslint-disable @typescript-eslint/no-explicit-any */
// services/userProfileService.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  level: string; 
  duration: string;
  students: number;
  rating: number;
  status: string; 
  createdAt: string;
  updatedAt?: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  isCompleted: boolean;
}

// Interface pour les statistiques utilisateur
export interface UserStats {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalWatchTimeHours: number;
  completionRate: number;
  certificatesEarned: number;
}

// Instance Axios pour les endpoints utilisateur
const userAPI = axios.create({
  baseURL: `${API_BASE_URL}/user`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
userAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const userProfileService = {
  // Récupérer tous les cours de l'utilisateur avec progression
  async getEnrolledCourses(): Promise<ApiResponse<EnrolledCourse[]>> {
    console.log('📚 Récupération des cours inscrits...');
    const response: AxiosResponse<ApiResponse<EnrolledCourse[]>> = await userAPI.get('/courses/enrolled');
    console.log('✅ Cours inscrits récupérés:', response.data);
    return response.data;
  },

  // Récupérer les cours en cours (progression > 0 et < 100)
  async getInProgressCourses(): Promise<ApiResponse<EnrolledCourse[]>> {
    console.log('🔄 Récupération des cours en cours...');
    const response: AxiosResponse<ApiResponse<EnrolledCourse[]>> = await userAPI.get('/courses/in-progress');
    console.log('✅ Cours en cours récupérés:', response.data);
    return response.data;
  },

  // Récupérer les cours terminés (progression = 100)
  async getCompletedCourses(): Promise<ApiResponse<EnrolledCourse[]>> {
    console.log('🏆 Récupération des cours terminés...');
    const response: AxiosResponse<ApiResponse<EnrolledCourse[]>> = await userAPI.get('/courses/completed');
    console.log('✅ Cours terminés récupérés:', response.data);
    return response.data;
  },

  // Récupérer les statistiques utilisateur
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    console.log('📊 Récupération des statistiques utilisateur...');
    const response: AxiosResponse<ApiResponse<UserStats>> = await userAPI.get('/stats');
    console.log('✅ Statistiques récupérées:', response.data);
    return response.data;
  },

  // Récupérer l'activité récente de l'utilisateur
  async getRecentActivity(): Promise<ApiResponse<any[]>> {
    console.log('🔔 Récupération de l\'activité récente...');
    const response: AxiosResponse<ApiResponse<any[]>> = await userAPI.get('/activity/recent');
    console.log('✅ Activité récente récupérée:', response.data);
    return response.data;
  },

  // Calculer les statistiques à partir des cours (si les endpoints backend n'existent pas encore)
  calculateStats(enrolledCourses: EnrolledCourse[]): UserStats {
    const completedCourses = enrolledCourses.filter(course => course.isCompleted || course.progressPercentage >= 100);
    const inProgressCourses = enrolledCourses.filter(course => 
      course.progressPercentage > 0 && course.progressPercentage < 100
    );
    
    const totalWatchTime = enrolledCourses.reduce((total, course) => {
      // Estimation basée sur la progression et la durée
      const durationMatch = course.duration.match(/(\d+)/);
      const estimatedHours = durationMatch ? parseInt(durationMatch[1]) : 0;
      return total + (estimatedHours * (course.progressPercentage / 100));
    }, 0);

    return {
      totalEnrolledCourses: enrolledCourses.length,
      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      totalWatchTimeHours: Math.round(totalWatchTime),
      completionRate: enrolledCourses.length > 0 
        ? Math.round((completedCourses.length / enrolledCourses.length) * 100) 
        : 0,
      certificatesEarned: completedCourses.length
    };
  }
};