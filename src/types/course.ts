// // types/course.ts

// ==================== INTERFACES DE BASE ====================

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  level: CourseLevel;
  duration: string;
  students: number;
  rating: number;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
  totalRatings?: number; // 🆕 Nouveau champ pour le nombre total d'évaluations
}

export interface Chapter {
  id: string;
  title: string;
  courseId: string;
  orderIndex: number;
  createdAt: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  contentType: ContentType;
  videoUrl?: string;
  documentUrl?: string;
  chapterId: string;
  orderIndex: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

// ==================== INTERFACES DE NOTATION ====================

export interface CourseRating {
  id: string;
  courseId: string;
  userId: string;
  rating: number; // 1-5 étoiles
  comment?: string;
  createdAt: string;
  updatedAt: string;
  // Informations utilisateur (optionnel pour l'affichage)
  userFirstName?: string;
  userLastName?: string;
}

export interface UserRatingRequest {
  rating: number;
  comment?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number; // nombre de votes par étoile (1-5)
  };
}

// ==================== INTERFACES DE PROGRESSION ====================

export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  progressPercentage: number;
  watchTimeSeconds: number;
}

export interface CourseWithProgress {
  course: Course;
  enrolled: boolean;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  userProgress: UserLessonProgress[];
}

// ==================== ENUMS ====================

export enum CourseLevel {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE'
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum ContentType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

// ==================== REQUEST DTOs ====================

export interface CourseCreateRequest {
  title: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  duration: string;
}

export interface CourseUpdateRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  level?: CourseLevel;
  duration?: string;
  status?: CourseStatus;
}

export interface ChapterCreateRequest {
  title: string;
  orderIndex?: number;
}

export interface ChapterUpdateRequest {
  title?: string;
  orderIndex?: number;
}

export interface LessonCreateRequest {
  title: string;
  content?: string;
  contentType: ContentType;
  videoUrl?: string; // Pour les URLs externes (YouTube, Vimeo, etc.)
  orderIndex?: number;
}

// ==================== RESPONSE DTOs ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ==================== INTERFACES UI SPÉCIFIQUES ====================

export interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progress?: number;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
}

export interface RatingComponentProps {
  courseId: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
  currentRating: number;
  totalRatings: number;
  onRatingUpdate: (newRating: number) => void;
}

export interface RatingFormData {
  rating: number;
  comment: string;
}

export interface RatingDisplayProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

// ==================== TYPES UTILITAIRES ====================

export type ViewMode = 'grid' | 'list';

export type SortDirection = 'asc' | 'desc';

export type SortBy = 'title' | 'createdAt' | 'rating' | 'students' | 'duration';

export interface CourseFilters {
  search?: string;
  categoryId?: string;
  level?: CourseLevel;
  minRating?: number;
  sortBy?: SortBy;
  sortDirection?: SortDirection;
}

export interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: string;
}

// ==================== INTERFACES D'ÉTAT ====================

export interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  filters: CourseFilters;
}

export interface RatingState {
  userRating: CourseRating | null;
  courseRatings: CourseRating[];
  ratingStats: RatingStats | null;
  loading: boolean;
  error: string | null;
}

// ==================== INTERFACES DE VALIDATION ====================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// ==================== TYPES POUR LES HOOKS ====================

export interface UseCourseReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCourseWithProgressReturn {
  courseData: CourseWithProgress | null;
  loading: boolean;
  error: string | null;
  enroll: () => Promise<void>;
  markLessonCompleted: (lessonId: string) => Promise<void>;
  updateProgress: (lessonId: string, progress: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseRatingReturn {
  userRating: CourseRating | null;
  courseRatings: CourseRating[];
  ratingStats: RatingStats | null;
  loading: boolean;
  error: string | null;
  submitRating: (rating: UserRatingRequest) => Promise<void>;
  deleteRating: () => Promise<void>;
  loadRatings: () => Promise<void>;
}

// ==================== CONSTANTES ====================

export const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export const RATING_LABELS: Record<number, string> = {
  1: 'Très décevant',
  2: 'Décevant',
  3: 'Correct',
  4: 'Très bien',
  5: 'Excellent'
};

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  [CourseLevel.DEBUTANT]: 'Débutant',
  [CourseLevel.INTERMEDIAIRE]: 'Intermédiaire',
  [CourseLevel.AVANCE]: 'Avancé'
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: 'Brouillon',
  [CourseStatus.PUBLISHED]: 'Publié',
  [CourseStatus.ARCHIVED]: 'Archivé'
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  [ContentType.TEXT]: 'Texte',
  [ContentType.VIDEO]: 'Vidéo',
  [ContentType.DOCUMENT]: 'Document'
};

// ==================== TYPES POUR LES ÉVÉNEMENTS ====================

export interface CourseEvent {
  type: 'enroll' | 'complete_lesson' | 'rate_course' | 'update_progress';
  courseId: string;
  lessonId?: string;
  rating?: number;
  progress?: number;
  timestamp: string;
}

// ==================== INTERFACES POUR LES STATISTIQUES ====================

export interface CourseAnalytics {
  totalViews: number;
  totalEnrollments: number;
  completionRate: number;
  averageProgress: number;
  topPerformingLessons: string[];
  engagementMetrics: {
    averageWatchTime: number;
    dropOffPoints: number[];
    userRetention: number;
  };
}

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

// ==================== TYPES POUR LES NOTIFICATIONS ====================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  courseId?: string;
  lessonId?: string;
}

// ==================== EXPORT DES TYPES UTILITAIRES ====================

export type CourseId = string;
export type UserId = string;
export type LessonId = string;
export type ChapterId = string;
export type CategoryId = string;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ==================== INTERFACES POUR LES COMPOSANTS COMPLEXES ====================

export interface CourseDetailTabProps {
  courseData: CourseWithProgress;
  activeTab: 'overview' | 'curriculum' | 'reviews';
  onTabChange: (tab: 'overview' | 'curriculum' | 'reviews') => void;
}

export interface LessonPlayerProps {
  lesson: Lesson;
  courseId: string;
  onProgress: (progress: number) => void;
  onComplete: () => void;
  userProgress?: UserLessonProgress;
}

export interface CourseSearchFilters {
  query: string;
  categories: string[];
  levels: CourseLevel[];
  minRating: number;
  priceRange: [number, number];
  duration: string;
  features: string[];
}