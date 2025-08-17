/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Users, 
  BarChart3, 
  Edit, 
  Eye,
  TrendingUp,
  Award,
  Search,
  Calendar,
  Clock,
  Star,
  Activity,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Mail
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { adminService, type PageResponse as AdminPageResponse, type PlatformStats } from '../services/adminService';
import type { Course, PageResponse } from '../types/course';
import type { UserResponse } from '../types/auth';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalCompletions: number;
  averageRating: number;
  monthlyRevenue: string;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour les cours
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesPage, setCoursesPage] = useState<PageResponse<Course> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // États pour les utilisateurs
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState<AdminPageResponse<UserResponse> | null>(null);
  const [usersCurrentPage, setUsersCurrentPage] = useState(0);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  
  // États pour les statistiques
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [stats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 2657,
    totalCompletions: 1456,
    averageRating: 4.8,
    monthlyRevenue: "36,300€",
    activeUsers: 1842
  });

  // Chargement initial
  useEffect(() => {
    if (activeTab === 'courses') {
      loadCourses();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'dashboard') {
      loadPlatformStats();
    }
  }, [activeTab, currentPage, usersCurrentPage]);

  // Recherche utilisateurs avec debounce
  useEffect(() => {
    if (activeTab === 'users') {
      const timeoutId = setTimeout(() => {
        setUsersCurrentPage(0);
        loadUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [usersSearchQuery]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await courseService.getMyCourses({
        page: currentPage,
        size: 12,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      
      if (response.success && response.data) {
        setCoursesPage(response.data);
        setCourses(response.data.content);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await adminService.getUsers({
        page: usersCurrentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
        search: usersSearchQuery || undefined
      });
      
      if (response.success && response.data) {
        setUsersPage(response.data);
        setUsers(response.data.content);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadPlatformStats = async () => {
    try {
      const response = await adminService.getPlatformStats();
      if (response.success && response.data) {
        setPlatformStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      // Recharger la liste
      loadCourses();
      alert('Cours supprimé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      loadUsers();
      alert('Utilisateur supprimé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle vers ${newRole} ?`)) {
      return;
    }

    try {
      await adminService.changeUserRole(userId, newRole);
      loadUsers();
      alert('Rôle modifié avec succès !');
    } catch (error: any) {
      console.error('Erreur lors du changement de rôle:', error);
      alert(error.response?.data?.message || 'Erreur lors du changement de rôle');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.categoryName && course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const recentActivities = [
    { 
      type: 'enrollment', 
      message: 'Nouvel étudiant inscrit au cours "Développeur Web Full Stack"', 
      time: 'Il y a 5 min',
      user: 'Aminata Diop'
    },
    { 
      type: 'completion', 
      message: 'Cours "UX/UI Designer" terminé avec succès', 
      time: 'Il y a 1h',
      user: 'Moussa Ba'
    },
    { 
      type: 'review', 
      message: 'Nouvelle évaluation 5★ pour "Data Science & IA"', 
      time: 'Il y a 2h',
      user: 'Fatou Sall'
    },
    { 
      type: 'course', 
      message: 'Nouveau chapitre ajouté à "Marketing Digital"', 
      time: 'Il y a 4h',
      user: 'Admin'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header moderne */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary mb-2">
                Tableau de bord
              </h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">
                <span className="w-2 h-2 bg-success rounded-full inline-block mr-2"></span>
                Plateforme active
              </div>
              <Link
                to="/admin/course/new"
                className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 font-semibold shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau cours</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation moderne */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200 w-fit">
          {[
            { id: 'dashboard', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'courses', label: 'Cours', icon: BookOpen },
            { id: 'users', label: 'Étudiants', icon: Users }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-textPrimary hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-textPrimary">{courses.length}</p>
                    <p className="text-sm text-gray-600">Cours créés</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-semibold">+2</span>
                    <span className="text-gray-600">ce mois</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-textPrimary">{platformStats?.totalStudents || stats.totalStudents}</p>
                    <p className="text-sm text-gray-600">Étudiants inscrits</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-semibold">+156</span>
                    <span className="text-gray-600">ce mois</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-success" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-textPrimary">{stats.totalCompletions.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Cours complétés</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-semibold">+89</span>
                    <span className="text-gray-600">ce mois</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-textPrimary">{stats.averageRating}/5</p>
                    <p className="text-sm text-gray-600">Note moyenne</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-semibold">+0.2</span>
                    <span className="text-gray-600">ce mois</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section avec 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activité récente */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-textPrimary flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Activité récente</span>
                    </h3>
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'enrollment' ? 'bg-primary/10' :
                          activity.type === 'completion' ? 'bg-success/10' :
                          activity.type === 'review' ? 'bg-yellow-100' :
                          'bg-accent/10'
                        }`}>
                          {activity.type === 'enrollment' && <Users className="w-5 h-5 text-primary" />}
                          {activity.type === 'completion' && <Award className="w-5 h-5 text-success" />}
                          {activity.type === 'review' && <Star className="w-5 h-5 text-yellow-600" />}
                          {activity.type === 'course' && <BookOpen className="w-5 h-5 text-accent" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-textPrimary text-sm">{activity.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{activity.user}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-textPrimary mb-4">Performance mensuelle</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nouveaux étudiants</span>
                      <span className="font-semibold text-textPrimary">+156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux de completion</span>
                      <span className="font-semibold text-success">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Satisfaction</span>
                      <span className="font-semibold text-yellow-600">4.8★</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-textPrimary mb-4">Cours populaires</h4>
                  <div className="space-y-3">
                    {courses.slice(0, 3).map((course, index) => (
                      <div key={course.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-textPrimary truncate">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.students} étudiants</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Management avec API */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Header avec recherche et filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un cours..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <Link
                  to="/admin/course/new"
                  className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 font-semibold shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouveau cours</span>
                </Link>
              </div>
            </div>

            {/* Courses Table avec API - Design élégant */}
            {coursesLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                        <div className="w-24 h-6 bg-gray-200 rounded"></div>
                        <div className="w-32 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredCourses.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Cours</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Catégorie</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Étudiants</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Note</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Créé le</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    {course.coverImage ? (
                                      <img
                                        src={course.coverImage}
                                        alt={course.title}
                                        className="w-16 h-12 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-16 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-primary/60" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-textPrimary group-hover:text-primary transition-colors line-clamp-1">
                                      {course.title}
                                    </div>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        course.level === 'DEBUTANT' ? 'bg-green-100 text-green-700' :
                                        course.level === 'INTERMEDIAIRE' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {courseService.getLevelLabel(course.level)}
                                      </span>
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {course.duration}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                                  {course.categoryName || 'Sans catégorie'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  course.status === 'PUBLISHED' 
                                    ? 'bg-success/10 text-success' 
                                    : course.status === 'DRAFT'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    course.status === 'PUBLISHED' ? 'bg-success' :
                                    course.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-gray-500'
                                  }`}></div>
                                  {courseService.getStatusLabel(course.status)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-textPrimary">
                                    {course.students.toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="font-medium text-textPrimary">
                                    {course.rating.toFixed(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-600">
                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                }) : '--'}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end space-x-2">
                                  <Link
                                    to={`/course/${course.id}`}
                                    className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                                    title="Voir le cours"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    to={`/admin/course/edit/${course.id}`}
                                    className="p-2 text-gray-600 hover:text-accent hover:bg-accent/10 rounded-lg transition-all duration-200"
                                    title="Modifier le cours"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Supprimer le cours"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination courses */}
                    {coursesPage && coursesPage.totalPages > 1 && (
                      <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Affichage de {(coursesPage.number * coursesPage.size) + 1} à {Math.min((coursesPage.number + 1) * coursesPage.size, coursesPage.totalElements)} sur {coursesPage.totalElements} cours
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={coursesPage.first}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Précédent
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, coursesPage.totalPages) }, (_, i) => {
                              const pageNum = i + Math.max(0, coursesPage.number - 2);
                              if (pageNum >= coursesPage.totalPages) return null;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                    pageNum === coursesPage.number
                                      ? 'bg-primary text-white'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {pageNum + 1}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={coursesPage.last}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Suivant
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-textPrimary mb-2">
                      {searchQuery ? 'Aucun cours trouvé' : 'Aucun cours créé'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery 
                        ? 'Essayez de modifier votre recherche ou de créer un nouveau cours.' 
                        : 'Commencez par créer votre premier cours pour vos étudiants et développez votre catalogue de formation.'
                      }
                    </p>
                    {!searchQuery && (
                      <Link
                        to="/admin/course/new"
                        className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 font-semibold shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Créer votre premier cours</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Users Management avec API */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header avec recherche */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={usersSearchQuery}
                      onChange={(e) => setUsersSearchQuery(e.target.value)}
                      placeholder="Rechercher un utilisateur..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {platformStats && (
                      <span>{platformStats.totalUsers} utilisateurs au total</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        <div className="w-24 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {users.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Utilisateur</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Rôle</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Inscription</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-semibold">
                                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-textPrimary">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {user.id.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{user.email}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'ADMIN' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                                  {user.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-gray-700">
                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end space-x-2">
                                  {user.role === 'USER' ? (
                                    <button
                                      onClick={() => handleChangeUserRole(user.id, 'ADMIN')}
                                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                      title="Promouvoir admin"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      <span>Admin</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleChangeUserRole(user.id, 'USER')}
                                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                      title="Rétrograder utilisateur"
                                    >
                                      <UserX className="w-4 h-4" />
                                      <span>User</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                    className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer utilisateur"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination utilisateurs */}
                    {usersPage && usersPage.totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-4 py-4 border-t border-gray-200">
                        <button
                          onClick={() => setUsersCurrentPage(prev => Math.max(0, prev - 1))}
                          disabled={usersPage.first}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Précédent
                        </button>
                        
                        <span className="text-sm text-gray-600">
                          Page {usersPage.number + 1} sur {usersPage.totalPages} ({usersPage.totalElements} utilisateurs)
                        </span>
                        
                        <button
                          onClick={() => setUsersCurrentPage(prev => prev + 1)}
                          disabled={usersPage.last}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-textPrimary mb-2">
                      {usersSearchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                    </h3>
                    <p className="text-gray-600">
                      {usersSearchQuery 
                        ? 'Essayez de modifier votre recherche.' 
                        : 'Les nouveaux utilisateurs apparaîtront ici.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stats rapides des utilisateurs */}
            {platformStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total utilisateurs</p>
                      <p className="text-2xl font-bold text-textPrimary">{platformStats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Étudiants</p>
                      <p className="text-2xl font-bold text-textPrimary">{platformStats.totalStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Administrateurs</p>
                      <p className="text-2xl font-bold text-textPrimary">{platformStats.totalAdmins}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}