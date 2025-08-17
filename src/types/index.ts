export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  lessonsCount: number;
  progress?: number;
  isEnrolled?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledCourses: string[];
  completedCourses: string[];
  totalStudyTime: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  isCompleted?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}