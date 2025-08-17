/* eslint-disable @typescript-eslint/no-explicit-any */
// services/courseService.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
    Course,
    Chapter,
    Lesson,
    Category,
    CourseCreateRequest,
    CourseUpdateRequest,
    ChapterCreateRequest,
    LessonCreateRequest,
    ApiResponse,
    PageResponse,
    CourseWithProgress
} from '../types/course';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Instance Axios pour les endpoints admin
const adminAPI = axios.create({
    baseURL: `${API_BASE_URL}/admin/courses`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Instance Axios pour les endpoints publics
const publicAPI = axios.create({
    baseURL: `${API_BASE_URL}/courses/public`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Instance Axios pour les catégories
const categoryAPI = axios.create({
    baseURL: `${API_BASE_URL}/categories`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token aux requêtes admin
adminAPI.interceptors.request.use(
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
[adminAPI, publicAPI, categoryAPI].forEach(api => {
    api.interceptors.response.use(
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
});

export const courseService = {
    // ==================== GESTION ADMIN ====================

    async createCourse(data: CourseCreateRequest): Promise<ApiResponse<Course>> {
        console.log('🎓 Création d\'un nouveau cours:', data);
        const response: AxiosResponse<ApiResponse<Course>> = await adminAPI.post('', data);
        return response.data;
    },

    async updateCourse(courseId: string, data: CourseUpdateRequest): Promise<ApiResponse<Course>> {
        console.log('✏️ Mise à jour du cours:', courseId, data);
        const response: AxiosResponse<ApiResponse<Course>> = await adminAPI.put(`/${courseId}`, data);
        return response.data;
    },

    async uploadCourseImage(courseId: string, file: File): Promise<ApiResponse<Course>> {
        console.log('📷 Upload image pour le cours:', courseId);
        const formData = new FormData();
        formData.append('file', file);

        const response: AxiosResponse<ApiResponse<Course>> = await adminAPI.post(
            `/${courseId}/cover-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    async addChapter(courseId: string, data: ChapterCreateRequest): Promise<ApiResponse<Chapter>> {
        console.log('📚 Ajout d\'un chapitre au cours:', courseId, data);
        const response: AxiosResponse<ApiResponse<Chapter>> = await adminAPI.post(
            `/${courseId}/chapters`,
            data
        );
        return response.data;
    },

    async updateChapter(chapterId: string, data: { title: string }): Promise<ApiResponse<Chapter>> {
        console.log('✏️ Mise à jour du chapitre:', chapterId, data);
        const response: AxiosResponse<ApiResponse<Chapter>> = await adminAPI.put(
            `/chapters/${chapterId}`,
            data
        );
        return response.data;
    },

    async addLesson(chapterId: string, data: LessonCreateRequest): Promise<ApiResponse<Lesson>> {
        console.log('📖 Ajout d\'une leçon au chapitre:', chapterId, data);
        const response: AxiosResponse<ApiResponse<Lesson>> = await adminAPI.post(
            `/chapters/${chapterId}/lessons`,
            data
        );
        return response.data;
    },

    // 🆕 NOUVEAU : Upload vidéo locale
    async uploadLessonVideo(lessonId: string, file: File): Promise<ApiResponse<Lesson>> {
        console.log('🎥 Upload vidéo pour la leçon:', lessonId);
        const formData = new FormData();
        formData.append('file', file);

        const response: AxiosResponse<ApiResponse<Lesson>> = await adminAPI.post(
            `/lessons/${lessonId}/video`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // 🆕 NOUVEAU : Définir URL vidéo externe
    async setLessonVideoUrl(lessonId: string, videoUrl: string): Promise<ApiResponse<Lesson>> {
        console.log('🔗 Définition URL vidéo externe:', lessonId, videoUrl);
        const response: AxiosResponse<ApiResponse<Lesson>> = await adminAPI.put(
            `/lessons/${lessonId}/video-url?videoUrl=${encodeURIComponent(videoUrl)}`
        );
        return response.data;
    },

    // 🆕 NOUVEAU : Upload document
    async uploadLessonDocument(lessonId: string, file: File): Promise<ApiResponse<Lesson>> {
        console.log('📄 Upload document pour la leçon:', lessonId);
        const formData = new FormData();
        formData.append('file', file);

        const response: AxiosResponse<ApiResponse<Lesson>> = await adminAPI.post(
            `/lessons/${lessonId}/document`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    async publishCourse(courseId: string): Promise<ApiResponse<Course>> {
        console.log('🚀 Publication du cours:', courseId);
        const response: AxiosResponse<ApiResponse<Course>> = await adminAPI.post(`/${courseId}/publish`);
        return response.data;
    },

    async getMyCourses(params?: {
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
    }): Promise<ApiResponse<PageResponse<Course>>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

        const queryString = queryParams.toString();
        const url = queryString ? `/my-courses?${queryString}` : '/my-courses';

        const response: AxiosResponse<ApiResponse<PageResponse<Course>>> = await adminAPI.get(url);
        return response.data;
    },

    async getCourseForEditing(courseId: string): Promise<ApiResponse<Course>> {
        console.log('📖 Récupération du cours pour édition:', courseId);
        const response: AxiosResponse<ApiResponse<Course>> = await adminAPI.get(`/${courseId}/edit`);
        return response.data;
    },

    async deleteCourse(courseId: string): Promise<ApiResponse<void>> {
        console.log('🗑️ Suppression du cours:', courseId);
        const response: AxiosResponse<ApiResponse<void>> = await adminAPI.delete(`/${courseId}`);
        return response.data;
    },

    // 🆕 NOUVEAU : Supprimer un chapitre
    async deleteChapter(chapterId: string): Promise<ApiResponse<void>> {
        console.log('🗑️ Suppression du chapitre:', chapterId);
        const response: AxiosResponse<ApiResponse<void>> = await adminAPI.delete(`/chapters/${chapterId}`);
        return response.data;
    },

    // 🆕 NOUVEAU : Supprimer une leçon
    async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
        console.log('🗑️ Suppression de la leçon:', lessonId);
        const response: AxiosResponse<ApiResponse<void>> = await adminAPI.delete(`/lessons/${lessonId}`);
        return response.data;
    },

    // 🆕 NOUVEAU : Modifier une leçon
    async updateLesson(lessonId: string, data: LessonCreateRequest): Promise<ApiResponse<Lesson>> {
        console.log('✏️ Modification de la leçon:', lessonId, data);
        const response: AxiosResponse<ApiResponse<Lesson>> = await adminAPI.put(`/lessons/${lessonId}`, data);
        return response.data;
    },

    // ==================== ACCÈS PUBLIC ====================

    async getPublishedCourses(params?: {
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
        categoryId?: string;
        search?: string;
    }): Promise<ApiResponse<PageResponse<Course>>> {
        console.log('📚 Récupération des cours publiés avec params:', params);
        
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
        if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
        if (params?.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const url = queryString ? `?${queryString}` : '';
        
        console.log('🔗 URL finale:', `${publicAPI.defaults.baseURL}${url}`);

        const response: AxiosResponse<ApiResponse<PageResponse<Course>>> = await publicAPI.get(url);
        return response.data;
    },

    async getPublishedCourseById(courseId: string): Promise<ApiResponse<Course>> {
        console.log('🔍 Récupération du cours publié:', courseId);
        const response: AxiosResponse<ApiResponse<Course>> = await publicAPI.get(`/${courseId}`);
        return response.data;
    },

    async getPopularCourses(limit: number = 6): Promise<ApiResponse<Course[]>> {
        console.log('🔥 Récupération des cours populaires, limite:', limit);
        const response: AxiosResponse<ApiResponse<Course[]>> = await publicAPI.get(
            `/popular?limit=${limit}`
        );
        return response.data;
    },

    async getTopRatedCourses(limit: number = 6): Promise<ApiResponse<Course[]>> {
        console.log('⭐ Récupération des cours top-rated, limite:', limit);
        const response: AxiosResponse<ApiResponse<Course[]>> = await publicAPI.get(
            `/top-rated?limit=${limit}`
        );
        return response.data;
    },

    async getLatestCourses(limit: number = 6): Promise<ApiResponse<Course[]>> {
        console.log('🆕 Récupération des derniers cours, limite:', limit);
        const response: AxiosResponse<ApiResponse<Course[]>> = await publicAPI.get(
            `/latest?limit=${limit}`
        );
        return response.data;
    },

    // ==================== CATÉGORIES ====================

    async getCategories(): Promise<ApiResponse<Category[]>> {
        console.log('📂 Récupération des catégories');
        const response: AxiosResponse<ApiResponse<Category[]>> = await categoryAPI.get('');
        return response.data;
    },

    // ==================== UTILITAIRES ====================

    formatDuration(duration: string): string {
        return duration;
    },

    getStatusLabel(status: string): string {
        const labels = {
            DRAFT: 'Brouillon',
            PUBLISHED: 'Publié',
            ARCHIVED: 'Archivé'
        };
        return labels[status as keyof typeof labels] || status;
    },

    getLevelLabel(level: string): string {
        const labels = {
            BEGINNER: 'Débutant',
            DEBUTANT: 'Débutant',
            INTERMEDIATE: 'Intermédiaire',
            INTERMEDIAIRE: 'Intermédiaire',
            ADVANCED: 'Avancé',
            AVANCE: 'Avancé'
        };
        return labels[level as keyof typeof labels] || level;
    },

    getContentTypeLabel(type: string): string {
        const labels = {
            TEXT: 'Texte',
            VIDEO: 'Vidéo',
            DOCUMENT: 'Document' // 🆕 AJOUTÉ
        };
        return labels[type as keyof typeof labels] || type;
    },

    // ==================== GESTION UTILISATEUR CONNECTÉ ====================

    async getCourseWithProgress(courseId: string): Promise<ApiResponse<CourseWithProgress>> {
        console.log('📊 Récupération du cours avec progression:', courseId);
        const token = localStorage.getItem('token');
        const response: AxiosResponse<ApiResponse<CourseWithProgress>> = await axios.get(
            `${API_BASE_URL}/courses/${courseId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Données reçues du backend:', response.data);
        return response.data;
    },

    async enrollInCourse(courseId: string): Promise<ApiResponse<any>> {
        console.log("🎯 Service: Inscription au cours", courseId);
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const response: AxiosResponse<ApiResponse<any>> = await axios.post(
            `${API_BASE_URL}/courses/${courseId}/enroll`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("✅ Service: Réponse inscription", response.data);
        return response.data;
    },

    async markLessonAsCompleted(lessonId: string): Promise<ApiResponse<Lesson>> {
        console.log('✅ Service: Marquage leçon comme complétée:', lessonId);
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const response: AxiosResponse<ApiResponse<Lesson>> = await axios.post(
            `${API_BASE_URL}/courses/lessons/${lessonId}/complete`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Service: Leçon marquée avec succès', response.data);
        return response.data;
    },

    async updateLessonProgress(lessonId: string, progressPercentage: number, watchTimeSeconds: number = 0): Promise<ApiResponse<Lesson>> {
        console.log('📈 Service: Mise à jour progression:', lessonId, progressPercentage + '%');
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const response: AxiosResponse<ApiResponse<any>> = await axios.put(
            `${API_BASE_URL}/courses/lessons/${lessonId}/progress?progressPercentage=${progressPercentage}&watchTimeSeconds=${watchTimeSeconds}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    },

};