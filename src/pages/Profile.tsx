/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Edit,
  Save,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import {
  userProfileService,
  type EnrolledCourse,
  type UserStats,
} from "../services/userProfileService";
import CourseCard from "../components/CourseCard";
import { useTranslation } from "../utils/translations";
import { useLanguage } from "../contexts/LanguageContext";

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { lang } = useLanguage();
  const { t } = useTranslation(lang);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<EnrolledCourse[]>(
    []
  );
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>(
    []
  );
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [userInfo, setUserInfo] = useState<UpdateProfileData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserCourseData();
    }
  }, [user]);

  const loadUserCourseData = async () => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);

      console.log("🔄 Chargement des données utilisateur...");

      const enrolledResponse = await userProfileService.getEnrolledCourses();

      if (enrolledResponse.success && enrolledResponse.data) {
        const allEnrolledCourses = enrolledResponse.data;
        setEnrolledCourses(allEnrolledCourses);

        const inProgress = allEnrolledCourses.filter(
          (course) =>
            course.progressPercentage > 0 && course.progressPercentage < 100
        );
        const completed = allEnrolledCourses.filter(
          (course) => course.isCompleted || course.progressPercentage >= 100
        );

        setInProgressCourses(inProgress);
        setCompletedCourses(completed);

        const stats = userProfileService.calculateStats(allEnrolledCourses);
        setUserStats(stats);

        console.log("✅ Données chargées:", {
          total: allEnrolledCourses.length,
          inProgress: inProgress.length,
          completed: completed.length,
          stats,
        });
      } else {
        throw new Error(
          enrolledResponse.message || "Erreur lors du chargement des cours"
        );
      }
    } catch (error: any) {
      console.error("❌ Erreur lors du chargement des données:", error);
      setCoursesError(
        error.message || "Erreur lors du chargement de vos cours"
      );

      setEnrolledCourses([]);
      setInProgressCourses([]);
      setCompletedCourses([]);
      setUserStats({
        totalEnrolledCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalWatchTimeHours: 0,
        completionRate: 0,
        certificatesEarned: 0,
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
        throw new Error(t('firstNameRequired'));
      }

      if (!userInfo.email.trim()) {
        throw new Error(t('emailRequired'));
      }

      console.log("🔄 Mise à jour du profil:", userInfo);

      const response = await authService.updateProfile(userInfo);

      if (response.success && response.data) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          ...response.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      await refreshUser();

      setUpdateSuccess(true);
      setIsEditing(false);

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      setUpdateError(
        error.message || "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (updateError) {
      setUpdateError("");
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setUserInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
    setIsEditing(false);
    setUpdateError("");
  };

  const getCompletionRate = () => {
    return userStats?.completionRate || 0;
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    });
  };

  const convertToCourseCardFormat = (enrolledCourse: EnrolledCourse) => {
    return {
      ...enrolledCourse,
      progress: enrolledCourse.progressPercentage,
      image: enrolledCourse.coverImage,
      category: enrolledCourse.categoryName || "",
      lessonsCount: enrolledCourse.totalLessons || 0,
      isEnrolled: true,
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0096F0] mx-auto mb-4" />
          <p className="text-gray-600">{t('loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {updateSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-green-700 font-medium">
              {t('profileUpdatedSuccess')}
            </p>
          </div>
        )}

        {updateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{updateError}</p>
          </div>
        )}

        {coursesError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700">{coursesError}</p>
              <button
                onClick={loadUserCourseData}
                className="text-sm text-yellow-800 underline hover:no-underline"
              >
                {t('tryAgain')}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0096F0] to-[#0080D6] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('firstName')}
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={userInfo.firstName}
                          onChange={handleInputChange}
                          disabled={isUpdating}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0096F0] focus:border-[#0096F0] transition-colors disabled:opacity-50"
                          placeholder={t('yourFirstName')}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('lastName')}
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={userInfo.lastName}
                          onChange={handleInputChange}
                          disabled={isUpdating}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0096F0] focus:border-[#0096F0] transition-colors disabled:opacity-50"
                          placeholder={t('yourLastName')}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('emailAddress')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleInputChange}
                        disabled={isUpdating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0096F0] focus:border-[#0096F0] transition-colors disabled:opacity-50"
                        placeholder={t('yourEmail')}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-600 mb-1 text-sm">{user.email}</p>
                    {user.createdAt && (
                      <p className="text-sm text-gray-500 mb-4">
                        {t('memberSince')} {formatMemberSince(user.createdAt)}
                      </p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {userStats?.totalEnrolledCourses || 0} {t('coursesEnrolled')}
                        </span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Award className="w-4 h-4" />
                        <span>{userStats?.completedCourses || 0} {t('coursesCompleted')}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{getCompletionRate()}% {t('successRatePercent')}</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    <span>{t('cancel')}</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0096F0] text-white rounded-lg hover:bg-[#0080D6] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('saving')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t('save')}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>{t('editProfile')}</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">{t('profileRole')} :</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role === "ADMIN" ? t('profileAdministrator') : t('profileStudent')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('profileEnrolledCourses')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    userStats?.totalEnrolledCourses || 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#0096F0]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#0096F0]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('profileCompletedCourses')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    userStats?.completedCourses || 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('studyTime')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `${userStats?.totalWatchTimeHours || 0}h`
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#DFB216]/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#DFB216]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('profileSuccessRateLabel')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `${getCompletionRate()}%`
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "overview"
                ? "bg-[#0096F0] text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {t('profileOverview')}
          </button>
          <button
            onClick={() => setActiveTab("inProgress")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "inProgress"
                ? "bg-[#0096F0] text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {t('profileInProgress')} ({loadingCourses ? "..." : inProgressCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "completed"
                ? "bg-[#0096F0] text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {t('completed')} ({loadingCourses ? "..." : completedCourses.length})
          </button>
        </div>

        {loadingCourses && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0096F0] mx-auto mb-4" />
            <p className="text-gray-600">{t('profileLoadingCourses')}</p>
          </div>
        )}

        {!loadingCourses && (
          <>
            {activeTab === "overview" && (
              <div className="space-y-8">
                {inProgressCourses.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-[#CD010A] mb-6">
                      {t('continuelearning')}
                    </h2>
                    <div className="space-y-4">
                      {inProgressCourses.slice(0, 3).map((course) => (
                        <CourseCard
                          key={course.id}
                          course={convertToCourseCardFormat(course) as any}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('recentAchievements')}
                  </h2>
                  {completedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {completedCourses.slice(0, 3).map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {t('profileCourseCompleted')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {course.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {course.enrolledAt
                                ? new Date(
                                    course.enrolledAt
                                  ).toLocaleDateString("fr-FR")
                                : t('recently')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl">🏆</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {t('noCompletedCourses')}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {t('finishFirstCourse')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "inProgress" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('coursesInProgress')}
                </h2>
                {inProgressCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={convertToCourseCardFormat(course) as any}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('noCoursesInProgress')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('exploreCoursesToStart')}
                    </p>
                    <a
                      href="/courses"
                      className="inline-flex items-center px-4 py-2 bg-[#0096F0] text-white rounded-lg hover:bg-[#0080D6] transition-colors"
                    >
                      {t('discoverCourses')}
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "completed" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('completedCourses')}
                </h2>
                {completedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((course) => (
                      <div key={course.id} className="relative">
                        <CourseCard
                          course={convertToCourseCardFormat(course) as any}
                        />
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Award className="w-3 h-3" />
                          <span>{t('completed')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('noCoursesCompleted')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('finishCoursesToSeeHere')}
                    </p>
                    {enrolledCourses.length > 0 ? (
                      <a
                        href="/profile"
                        onClick={() => setActiveTab("inProgress")}
                        className="inline-flex items-center px-4 py-2 bg-[#0096F0] text-white rounded-lg hover:bg-[#0080D6] transition-colors"
                      >
                        {t('continueMyCourses')}
                      </a>
                    ) : (
                      <a
                        href="/courses"
                        className="inline-flex items-center px-4 py-2 bg-[#0096F0] text-white rounded-lg hover:bg-[#0080D6] transition-colors"
                      >
                        {t('discoverCourses')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
