/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Mail,
} from "lucide-react";
import { courseService } from "../services/courseService";
import {
  adminService,
  type PageResponse as AdminPageResponse,
  type PlatformStats,
} from "../services/adminService";
import type { Course, PageResponse } from "../types/course";
import type { UserResponse } from "../types/auth";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../utils/translations";

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalCompletions: number;
  averageRating: number;
  monthlyRevenue: string;
  activeUsers: number;
}

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const { t } = useTranslation(lang);
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesPage, setCoursesPage] = useState<PageResponse<Course> | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] =
    useState<AdminPageResponse<UserResponse> | null>(null);
  const [usersCurrentPage, setUsersCurrentPage] = useState(0);
  const [usersSearchQuery, setUsersSearchQuery] = useState("");

  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null
  );
  const [stats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 2657,
    totalCompletions: 1456,
    averageRating: 4.8,
    monthlyRevenue: "36,300€",
    activeUsers: 1842,
  });

  useEffect(() => {
    if (activeTab === "courses") {
      loadCourses();
    } else if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "dashboard") {
      loadPlatformStats();
    }
  }, [activeTab, currentPage, usersCurrentPage]);

  useEffect(() => {
    if (activeTab === "users") {
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
        sortBy: "createdAt",
        sortDir: "desc",
      });

      if (response.success && response.data) {
        setCoursesPage(response.data);
        setCourses(response.data.content);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des cours:", error);
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
        sortBy: "createdAt",
        sortDir: "desc",
        search: usersSearchQuery || undefined,
      });

      if (response.success && response.data) {
        setUsersPage(response.data);
        setUsers(response.data.content);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
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
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(t('confirmDeleteCourse'))) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      loadCourses();
      alert(t('courseDeletedSuccessfully'));
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.response?.data?.message || t('deletionError'));
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `${t('confirmDeleteUser')} ${userEmail} ?`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      loadUsers();
      alert(t('userDeletedSuccessfully'));
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.response?.data?.message || t('deletionError'));
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    if (
      !confirm(`${t('confirmChangeRole')} ${newRole} ?`)
    ) {
      return;
    }

    try {
      await adminService.changeUserRole(userId, newRole);
      loadUsers();
      alert(t('roleChangedSuccessfully'));
    } catch (error: any) {
      console.error("Erreur lors du changement de rôle:", error);
      alert(
        error.response?.data?.message || t('roleChangeError')
      );
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.categoryName &&
        course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const recentActivities = [
    {
      type: "enrollment",
      message: 'Nouvel étudiant inscrit au cours "Développeur Web Full Stack"',
      time: "Il y a 5 min",
      user: "Aminata Diop",
    },
    {
      type: "completion",
      message: 'Cours "UX/UI Designer" terminé avec succès',
      time: "Il y a 1h",
      user: "Moussa Ba",
    },
    {
      type: "review",
      message: 'Nouvelle évaluation 5★ pour "Data Science & IA"',
      time: "Il y a 2h",
      user: "Fatou Sall",
    },
    {
      type: "course",
      message: 'Nouveau chapitre ajouté à "Marketing Digital"',
      time: "Il y a 4h",
      user: "Admin",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('adminDashboard')}
              </h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {t('today')},{" "}
                  {new Date().toLocaleDateString(lang === 'fr' ? "fr-FR" : "en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
                {t('platformActive')}
              </div>
              <Link
                to="/admin/course/new"
                className="flex items-center space-x-2 bg-[#0096F0] text-white px-6 py-3 rounded-xl hover:bg-[#0080D6] transition-all duration-300 hover:scale-105 font-semibold shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>{t('addNewCourse')}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200 w-fit">
          {[
            { id: "dashboard", label: t('overview'), icon: BarChart3 },
            { id: "courses", label: t('courses'), icon: BookOpen },
            { id: "users", label: t('studentsTab'), icon: Users },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#0096F0] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0096F0]/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#0096F0]" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.length}
                    </p>
                    <p className="text-sm text-gray-600">{t('coursesCreated')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-semibold">+2</span>
                    <span className="text-gray-600">{t('thisMonth')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#DFB216]/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#DFB216]" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {platformStats?.totalStudents || stats.totalStudents}
                    </p>
                    <p className="text-sm text-gray-600">{t('totalEnrolledStudents')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-semibold">+156</span>
                    <span className="text-gray-600">{t('thisMonth')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalCompletions.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{t('completedCourses')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-semibold">+89</span>
                    <span className="text-gray-600">{t('thisMonth')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageRating}/5
                    </p>
                    <p className="text-sm text-gray-600">{t('overallRating')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-semibold">+0.2</span>
                    <span className="text-gray-600">{t('thisMonth')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>{t('recentActivity')}</span>
                    </h3>
                    <button className="text-sm text-[#0096F0] hover:text-[#0080D6] font-medium">
                      {t('seeAll')}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === "enrollment"
                              ? "bg-[#0096F0]/10"
                              : activity.type === "completion"
                              ? "bg-green-100"
                              : activity.type === "review"
                              ? "bg-yellow-100"
                              : "bg-[#DFB216]/10"
                          }`}
                        >
                          {activity.type === "enrollment" && (
                            <Users className="w-5 h-5 text-[#0096F0]" />
                          )}
                          {activity.type === "completion" && (
                            <Award className="w-5 h-5 text-green-600" />
                          )}
                          {activity.type === "review" && (
                            <Star className="w-5 h-5 text-yellow-600" />
                          )}
                          {activity.type === "course" && (
                            <BookOpen className="w-5 h-5 text-[#DFB216]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {activity.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {activity.user}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {activity.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {t('monthlyPerformance')}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {t('newStudents')}
                      </span>
                      <span className="font-semibold text-gray-900">+156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {t('completionRate')}
                      </span>
                      <span className="font-semibold text-green-600">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {t('satisfaction')}
                      </span>
                      <span className="font-semibold text-yellow-600">
                        4.8★
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {t('popularCourses')}
                  </h4>
                  <div className="space-y-3">
                    {courses.slice(0, 3).map((course, index) => (
                      <div
                        key={course.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-[#0096F0]/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0096F0]">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {course.students} {t('students')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchCourse')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0096F0] focus:border-[#0096F0] transition-colors"
                    />
                  </div>
                </div>
                <Link
                  to="/admin/course/new"
                  className="flex items-center space-x-2 bg-[#0096F0] text-white px-6 py-3 rounded-lg hover:bg-[#0080D6] transition-all duration-300 hover:scale-105 font-semibold shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('addNewCourse')}</span>
                </Link>
              </div>
            </div>

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
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('course')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('category')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('status')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('studentsTab')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('rating')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('createdOn')}
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">
                              {t('actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredCourses.map((course) => (
                            <tr
                              key={course.id}
                              className="hover:bg-gray-50 transition-colors group"
                            >
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
                                      <div className="w-16 h-12 bg-gradient-to-br from-[#0096F0]/20 to-[#DFB216]/20 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-[#0096F0]/60" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-gray-900 group-hover:text-[#0096F0] transition-colors line-clamp-1">
                                      {course.title}
                                    </div>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          course.level === "DEBUTANT"
                                            ? "bg-green-100 text-green-700"
                                            : course.level === "INTERMEDIAIRE"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {courseService.getLevelLabel(
                                          course.level
                                        )}
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
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0096F0]/10 text-[#0096F0]">
                                  {course.categoryName || t('noCategory')}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                    course.status === "PUBLISHED"
                                      ? "bg-green-100 text-green-700"
                                      : course.status === "DRAFT"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      course.status === "PUBLISHED"
                                        ? "bg-green-600"
                                        : course.status === "DRAFT"
                                        ? "bg-yellow-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></div>
                                  {courseService.getStatusLabel(course.status)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {course.students.toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="font-medium text-gray-900">
                                    {course.rating.toFixed(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-600">
                                {course.createdAt
                                  ? new Date(
                                      course.createdAt
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : "--"}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end space-x-2">
                                  <Link
                                    to={`/course/${course.id}`}
                                    className="p-2 text-gray-600 hover:text-[#0096F0] hover:bg-[#0096F0]/10 rounded-lg transition-all duration-200"
                                    title={t('viewCourse')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    to={`/admin/course/edit/${course.id}`}
                                    className="p-2 text-gray-600 hover:text-[#DFB216] hover:bg-[#DFB216]/10 rounded-lg transition-all duration-200"
                                    title={t('editCourse')}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleDeleteCourse(course.id)
                                    }
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title={t('deleteCourse')}
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

                    {coursesPage && coursesPage.totalPages > 1 && (
                      <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          {t('displaying')}{" "}
                          {coursesPage.number * coursesPage.size + 1} {t('to')}{" "}
                          {Math.min(
                            (coursesPage.number + 1) * coursesPage.size,
                            coursesPage.totalElements
                          )}{" "}
                          {t('on')} {coursesPage.totalElements} {t('courses')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(0, prev - 1))
                            }
                            disabled={coursesPage.first}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('previous')}
                          </button>

                          <div className="flex items-center space-x-1">
                            {Array.from(
                              { length: Math.min(5, coursesPage.totalPages) },
                              (_, i) => {
                                const pageNum =
                                  i + Math.max(0, coursesPage.number - 2);
                                if (pageNum >= coursesPage.totalPages)
                                  return null;
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                      pageNum === coursesPage.number
                                        ? "bg-[#0096F0] text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                  >
                                    {pageNum + 1}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={coursesPage.last}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('next')}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery ? t('noCourseFound') : t('noCoursesCreated')}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery
                        ? t('noCourseFoundMessage')
                        : t('noCoursesMessage')}
                    </p>
                    {!searchQuery && (
                      <Link
                        to="/admin/course/new"
                        className="inline-flex items-center space-x-2 bg-[#0096F0] text-white px-6 py-3 rounded-xl hover:bg-[#0080D6] transition-all duration-300 hover:scale-105 font-semibold shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                        <span>{t('createFirstCourse')}</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={usersSearchQuery}
                      onChange={(e) => setUsersSearchQuery(e.target.value)}
                      placeholder={t('searchUser')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0096F0] focus:border-[#0096F0] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {platformStats && (
                      <span>
                        {platformStats.totalUsers} {t('totalUsers')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('user')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('email')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('role')}
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">
                              {t('registration')}
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">
                              {t('actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr
                              key={user.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-[#0096F0]/10 rounded-full flex items-center justify-center">
                                    <span className="text-[#0096F0] font-semibold">
                                      {user.firstName.charAt(0)}
                                      {user.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
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
                                  <span className="text-gray-700">
                                    {user.email}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === "ADMIN"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {user.role === "ADMIN" && (
                                    <Shield className="w-3 h-3 mr-1" />
                                  )}
                                  {user.role === "ADMIN"
                                    ? t('administrator')
                                    : t('student')}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-gray-700">
                                {new Date(user.createdAt).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end space-x-2">
                                  {user.role === "USER" ? (
                                    <button
                                      onClick={() =>
                                        handleChangeUserRole(user.id, "ADMIN")
                                      }
                                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                      title={t('promoteAdmin')}
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      <span>Admin</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleChangeUserRole(user.id, "USER")
                                      }
                                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                      title={t('demoteUser')}
                                    >
                                      <UserX className="w-4 h-4" />
                                      <span>User</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleDeleteUser(user.id, user.email)
                                    }
                                    className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t('deleteUser')}
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

                    {usersPage && usersPage.totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-4 py-4 border-t border-gray-200">
                        <button
                          onClick={() =>
                            setUsersCurrentPage((prev) => Math.max(0, prev - 1))
                          }
                          disabled={usersPage.first}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('previous')}
                        </button>

                        <span className="text-sm text-gray-600">
                          {t('page')} {usersPage.number + 1} {t('on')} {usersPage.totalPages}{" "}
                          ({usersPage.totalElements} {t('totalUsers')})
                        </span>

                        <button
                          onClick={() =>
                            setUsersCurrentPage((prev) => prev + 1)
                          }
                          disabled={usersPage.last}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('next')}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {usersSearchQuery
                        ? t('noUsersFound')
                        : t('noUsers')}
                    </h3>
                    <p className="text-gray-600">
                      {usersSearchQuery
                        ? t('noUsersFoundMessage')
                        : t('noUsersMessage')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {platformStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {t('totalUsers')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {platformStats.totalUsers}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('studentsTab')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {platformStats.totalStudents}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('totalAdministrators')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {platformStats.totalAdmins}
                      </p>
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
