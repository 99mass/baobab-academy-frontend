/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, TrendingUp, Edit, Save, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { userProfileService, type EnrolledCourse, type UserStats } from '../services/userProfileService';
import CourseCard from '../components/CourseCard';

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<EnrolledCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  
  const [userInfo, setUserInfo] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Initialiser les données utilisateur
  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  // 🆕 Charger les données des cours au montage
  useEffect(() => {
    if (user) {
      loadUserCourseData();
    }
  }, [user]);

  // 🆕 Fonction pour charger toutes les données utilisateur
  const loadUserCourseData = async () => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      
      console.log('🔄 Chargement des données utilisateur...');
      
      // Charger les cours inscrits
      const enrolledResponse = await userProfileService.getEnrolledCourses();
      
      if (enrolledResponse.success && enrolledResponse.data) {
        const allEnrolledCourses = enrolledResponse.data;
        setEnrolledCourses(allEnrolledCourses);
        
        // Filtrer les cours en cours et terminés
        const inProgress = allEnrolledCourses.filter(course => 
          course.progressPercentage > 0 && course.progressPercentage < 100
        );
        const completed = allEnrolledCourses.filter(course => 
          course.isCompleted || course.progressPercentage >= 100
        );
        
        setInProgressCourses(inProgress);
        setCompletedCourses(completed);
        
        // Calculer les statistiques
        const stats = userProfileService.calculateStats(allEnrolledCourses);
        setUserStats(stats);
        
        console.log('✅ Données chargées:', {
          total: allEnrolledCourses.length,
          inProgress: inProgress.length,
          completed: completed.length,
          stats
        });
      } else {
        throw new Error(enrolledResponse.message || 'Erreur lors du chargement des cours');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setCoursesError(error.message || 'Erreur lors du chargement de vos cours');
      
      // En cas d'erreur, initialiser avec des valeurs par défaut
      setEnrolledCourses([]);
      setInProgressCourses([]);
      setCompletedCourses([]);
      setUserStats({
        totalEnrolledCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalWatchTimeHours: 0,
        completionRate: 0,
        certificatesEarned: 0
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      // Validation côté client
      if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
        throw new Error('Le prénom et le nom sont obligatoires');
      }

      if (!userInfo.email.trim()) {
        throw new Error('L\'email est obligatoire');
      }

      // Appel API pour mise à jour du profil
      console.log('🔄 Mise à jour du profil:', userInfo);
      
      const response = await authService.updateProfile(userInfo);
      
      if (response.success && response.data) {
        // Mise à jour du localStorage avec les nouvelles données
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setUpdateError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer l'erreur quand l'utilisateur tape
    if (updateError) {
      setUpdateError('');
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
    setUpdateError('');
  };

  // 🆕 Utiliser les vraies statistiques
  const getCompletionRate = () => {
    return userStats?.completionRate || 0;
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Conversion des cours pour CourseCard (adapter le format si nécessaire)
  const convertToCourseCardFormat = (enrolledCourse: EnrolledCourse) => {
    return {
      ...enrolledCourse,
      progress: enrolledCourse.progressPercentage,
      image: enrolledCourse.coverImage, // Mapper coverImage à image
      category: enrolledCourse.categoryName || '',
      lessonsCount: enrolledCourse.totalLessons || 0,
      isEnrolled: true,
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages de feedback */}
        {updateSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-green-700 font-medium">Profil mis à jour avec succès !</p>
          </div>
        )}

        {updateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{updateError}</p>
          </div>
        )}

        {/* Erreur de chargement des cours */}
        {coursesError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700">{coursesError}</p>
              <button 
                onClick={loadUserCourseData}
                className="text-sm text-yellow-800 underline hover:no-underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={userInfo.firstName}
                          onChange={handleInputChange}
                          disabled={isUpdating}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={userInfo.lastName}
                          onChange={handleInputChange}
                          disabled={isUpdating}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleInputChange}
                        disabled={isUpdating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
                        placeholder="votre.email@exemple.com"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-textPrimary mb-2">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-600 mb-1 text-sm">{user.email}</p>
                    {user.createdAt && (
                      <p className="text-sm text-gray-500 mb-4">
                        Membre depuis {formatMemberSince(user.createdAt)}
                      </p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{userStats?.totalEnrolledCourses || 0} cours inscrits</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Award className="w-4 h-4" />
                        <span>{userStats?.completedCourses || 0} terminés</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{getCompletionRate()}% de réussite</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 lg:mt-0">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Sauvegarder</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-textPrimary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Modifier le profil</span>
                </button>
              )}
            </div>
          </div>

          {/* Role Badge */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Rôle :</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'ADMIN' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours inscrits</p>
                <p className="text-3xl font-bold text-textPrimary">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    userStats?.totalEnrolledCourses || 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours terminés</p>
                <p className="text-3xl font-bold text-textPrimary">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    userStats?.completedCourses || 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temps d'étude</p>
                <p className="text-3xl font-bold text-textPrimary">
                  {loadingCourses ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `${userStats?.totalWatchTimeHours || 0}h`
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
                <p className="text-3xl font-bold text-textPrimary">
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-textPrimary hover:bg-gray-50'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('inProgress')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'inProgress'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-textPrimary hover:bg-gray-50'
            }`}
          >
            En cours ({loadingCourses ? '...' : inProgressCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'completed'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-textPrimary hover:bg-gray-50'
            }`}
          >
            Terminés ({loadingCourses ? '...' : completedCourses.length})
          </button>
        </div>

        {/* Loading State */}
        {loadingCourses && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos cours...</p>
          </div>
        )}

        {/* Tab Content */}
        {!loadingCourses && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Continue Learning */}
                {inProgressCourses.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-textPrimary mb-6">Continuer l'apprentissage</h2>
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

                {/* Recent Achievements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-semibold text-textPrimary mb-6">Accomplissements récents</h2>
                  {completedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {completedCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center space-x-4 p-4 bg-success/5 rounded-lg">
                          <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-textPrimary">Cours terminé</h3>
                            <p className="text-sm text-gray-600">{course.title}</p>
                            <p className="text-xs text-gray-500">
                              {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('fr-FR') : 'Récemment'}
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
                      <p className="text-gray-500">Aucun cours terminé pour le moment</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Terminez votre premier cours pour voir vos accomplissements ici
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inProgress' && (
              <div>
                <h2 className="text-2xl font-bold text-textPrimary mb-6">Cours en cours</h2>
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
                    <h3 className="text-lg font-medium text-textPrimary mb-2">Aucun cours en cours</h3>
                    <p className="text-gray-600 mb-4">Explorez nos cours pour commencer votre apprentissage</p>
                    <a 
                      href="/courses" 
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Découvrir les cours
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div>
                <h2 className="text-2xl font-bold text-textPrimary mb-6">Cours terminés</h2>
                {completedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((course) => (
                      <div key={course.id} className="relative">
                        <CourseCard course={convertToCourseCardFormat(course) as any} />
                        {/* Badge de completion */}
                        <div className="absolute top-2 right-2 bg-success text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Award className="w-3 h-3" />
                          <span>Terminé</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-textPrimary mb-2">Aucun cours terminé</h3>
                    <p className="text-gray-600 mb-4">Terminez vos premiers cours pour voir vos accomplissements ici</p>
                    {enrolledCourses.length > 0 ? (
                      <a 
                        href="/profile" 
                        onClick={() => setActiveTab('inProgress')}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Continuer mes cours
                      </a>
                    ) : (
                      <a 
                        href="/courses" 
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Découvrir les cours
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