// types/course.ts
export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  progressPercentage: number;
  watchTimeSeconds: number;
}

//  Interface pour la réponse avec progression
export interface CourseWithProgress {
  course: Course;
  enrolled: boolean;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  userProgress: UserLessonProgress[]; 
}

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
  documentUrl?: string; //  NOUVEAU CHAMP
  chapterId: string;
  orderIndex: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

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

// Request DTOs
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

// API Response
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