import { Link } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact';
}

export default function CourseCard({ course  , variant = 'default' }: CourseCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return 'bg-green-100 text-green-800';
      case 'Intermédiaire':
        return 'bg-yellow-100 text-yellow-800';
      case 'Avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration: string) => {
    const totalMinutes = parseInt(duration, 10);
    if (isNaN(totalMinutes) || totalMinutes <= 0) {
      return '';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0) {
      result += `${minutes}min`;
    }

    return result.trim();
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-4">
        <div className="flex items-center space-x-4">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-textPrimary mb-1 line-clamp-1">{course.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.duration)}</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>
            {course.progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{course.progress}% terminé</span>
              </div>
            )}
          </div>
          <Link 
            to={`/course/${course.id}`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {course.progress && course.progress > 0 ? 'Continuer' : 'Commencer'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
        {course.isEnrolled && course.progress !== undefined && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <div className="w-full bg-white/20 rounded-full h-2 mb-1">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span className="text-white text-xs">{course.progress}% terminé</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="text-sm text-accent font-medium">{course.category}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-textPrimary mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(course.duration)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonsCount} leçons</span>
          </span>
        </div>
        
        <Link 
          to={`/course/${course.id}`}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center block"
        >
          {course.isEnrolled && course.progress && course.progress > 0 ? 'Continuer le cours' : 'Commencer le cours'}
        </Link>
      </div>
    </div>
  );
}