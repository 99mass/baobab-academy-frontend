/* eslint-disable @typescript-eslint/no-explicit-any */
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
    CourseWithProgress,
    CourseRating,
    UserRatingRequest,
    RatingStats
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

// Instance Axios pour les endpoints utilisateur connecté
const userAPI = axios.create({
    baseURL: `${API_BASE_URL}/courses`,
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

// Intercepteur pour ajouter le token aux requêtes admin et user
[adminAPI, userAPI].forEach(api => {
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
});

// Intercepteur pour gérer les erreurs
[adminAPI, publicAPI, userAPI, categoryAPI].forEach(api => {
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

    async setLessonVideoUrl(lessonId: string, videoUrl: string): Promise<ApiResponse<Lesson>> {
        console.log('🔗 Définition URL vidéo externe:', lessonId, videoUrl);
        const response: AxiosResponse<ApiResponse<Lesson>> = await adminAPI.put(
            `/lessons/${lessonId}/video-url?videoUrl=${encodeURIComponent(videoUrl)}`
        );
        return response.data;
    },

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

    async deleteChapter(chapterId: string): Promise<ApiResponse<void>> {
        console.log('🗑️ Suppression du chapitre:', chapterId);
        const response: AxiosResponse<ApiResponse<void>> = await adminAPI.delete(`/chapters/${chapterId}`);
        return response.data;
    },

    async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
        console.log('🗑️ Suppression de la leçon:', lessonId);
        const response: AxiosResponse<ApiResponse<void>> = await adminAPI.delete(`/lessons/${lessonId}`);
        return response.data;
    },

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

    // ==================== GESTION UTILISATEUR CONNECTÉ ====================

    async getCourseWithProgress(courseId: string): Promise<ApiResponse<CourseWithProgress>> {
        console.log('📊 Récupération du cours avec progression:', courseId);
        const response: AxiosResponse<ApiResponse<CourseWithProgress>> = await userAPI.get(`/${courseId}`);
        
        console.log('✅ Données reçues du backend:', response.data);
        return response.data;
    },

    async enrollInCourse(courseId: string): Promise<ApiResponse<any>> {
        console.log("🎯 Service: Inscription au cours", courseId);
        const response: AxiosResponse<ApiResponse<any>> = await userAPI.post(`/${courseId}/enroll`, {});
        
        console.log("✅ Service: Réponse inscription", response.data);
        return response.data;
    },

    async markLessonAsCompleted(lessonId: string): Promise<ApiResponse<Lesson>> {
        console.log('✅ Service: Marquage leçon comme complétée:', lessonId);
        const response: AxiosResponse<ApiResponse<Lesson>> = await userAPI.post(
            `/lessons/${lessonId}/complete`,
            {}
        );
        
        console.log('✅ Service: Leçon marquée avec succès', response.data);
        return response.data;
    },

    async updateLessonProgress(lessonId: string, progressPercentage: number, watchTimeSeconds: number = 0): Promise<ApiResponse<Lesson>> {
        console.log('📈 Service: Mise à jour progression:', lessonId, progressPercentage + '%');
        const response: AxiosResponse<ApiResponse<any>> = await userAPI.put(
            `/lessons/${lessonId}/progress?progressPercentage=${progressPercentage}&watchTimeSeconds=${watchTimeSeconds}`,
            {}
        );
        
        return response.data;
    },

    // ==================== SYSTÈME DE NOTATION ====================

    async rateCourse(courseId: string, rating: UserRatingRequest): Promise<ApiResponse<CourseRating>> {
        console.log('⭐ Service: Noter le cours:', courseId, rating);
        
        const response: AxiosResponse<ApiResponse<CourseRating>> = await userAPI.post(
            `/${courseId}/rate`,
            rating
        );
        
        console.log('✅ Service: Note ajoutée avec succès', response.data);
        return response.data;
    },

    async getUserRating(courseId: string): Promise<ApiResponse<CourseRating | null>> {
        console.log('📊 Service: Récupération note utilisateur:', courseId);
        
        try {
            const response: AxiosResponse<ApiResponse<CourseRating>> = await userAPI.get(
                `/${courseId}/my-rating`
            );
            
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // L'utilisateur n'a pas encore noté ce cours
                return { 
                    success: true, 
                    message: 'Aucune note trouvée', 
                    data: null, 
                    timestamp: new Date().toISOString() 
                };
            }
            throw error;
        }
    },

    async getCourseRatings(courseId: string, page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<CourseRating>>> {
        console.log('📝 Service: Récupération des commentaires:', courseId);
        
        const response: AxiosResponse<ApiResponse<PageResponse<CourseRating>>> = await userAPI.get(
            `/${courseId}/ratings?page=${page}&size=${size}`
        );
        
        return response.data;
    },

    async getCourseRatingStats(courseId: string): Promise<ApiResponse<RatingStats>> {
        console.log('📈 Service: Récupération des statistiques de notation:', courseId);
        
        const response: AxiosResponse<ApiResponse<RatingStats>> = await userAPI.get(
            `/${courseId}/rating-stats`
        );
        
        return response.data;
    },

    async deleteMyRating(courseId: string): Promise<ApiResponse<void>> {
        console.log('🗑️ Service: Suppression de ma note:', courseId);
        
        const response: AxiosResponse<ApiResponse<void>> = await userAPI.delete(
            `/${courseId}/my-rating`
        );
        
        console.log('✅ Service: Note supprimée avec succès');
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
            DOCUMENT: 'Document'
        };
        return labels[type as keyof typeof labels] || type;
    },

    getRatingLabel(rating: number): string {
        const labels = {
            1: 'Très décevant',
            2: 'Décevant', 
            3: 'Correct',
            4: 'Très bien',
            5: 'Excellent'
        };
        return labels[rating as keyof typeof labels] || '';
    },

    // Fonction utilitaire pour formater les dates
    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Fonction utilitaire pour formater les dates avec l'heure
    formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Fonction pour valider un rating
    isValidRating(rating: number): boolean {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    },

    // Fonction pour calculer la distribution des notes
    calculateRatingDistribution(ratings: CourseRating[]): { [key: number]: number } {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        ratings.forEach(rating => {
            if (rating.rating >= 1 && rating.rating <= 5) {
                (distribution as any)[rating.rating]++;
            }
        });
        
        return distribution;
    },

    // Fonction pour obtenir l'URL d'image avec fallback
    getImageUrl(coverImage: string | undefined): string | null {
        if (!coverImage) return null;

        if (coverImage.startsWith('http')) {
            return coverImage;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        return `${API_BASE_URL}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
    }
};