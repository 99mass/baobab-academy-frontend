/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Clock,
  BookOpen,
  BarChart,
  Star,
  Play,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  Users,
  X,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../hooks/useAuth";
import type { Course } from "../types/course";
import CourseRatingComponent from "../components/courseRatingComponent";

interface CourseWithProgress {
  course: Course;
  enrolled: boolean;
  progressPercentage: number;
  completedLessons?: number;
  totalLessons?: number;
  isAdmin?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [courseData, setCourseData] = useState<CourseWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showRatingSection, setShowRatingSection] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id, isAuthenticated, user]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated && user) {
        console.log(
          "🔒 Utilisateur authentifié, chargement avec progression..."
        );

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token non trouvé");
        }

        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Réponse API status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("📋 Données reçues:", result);

          if (result.success && result.data) {
            setCourseData(result.data);
            setCurrentRating(result.data.course.rating || 0);
            setTotalRatings(result.data.course.totalRatings || 0);
            console.log("✅ Course data définie:", result.data);

            if (
              result.data.course?.chapters &&
              result.data.course.chapters.length > 0
            ) {
              setExpandedChapter(result.data.course.chapters[0].id);
            }
          } else {
            throw new Error(result.message || "Données invalides reçues");
          }
        } else {
          console.error("❌ Erreur API:", response.status, response.statusText);

          console.log("🔄 Tentative avec endpoint public...");
          const publicResponse = await courseService.getPublishedCourseById(
            id || ""
          );
          setCourseData({
            course: publicResponse.data!,
            enrolled: false,
            progressPercentage: 0,
            isAdmin: user.role === "ADMIN",
          });
          setCurrentRating(publicResponse.data?.rating || 0);
          setTotalRatings(publicResponse.data?.totalRatings || 0);
        }
      } else {
        console.log("🌐 Utilisateur non authentifié, chargement public...");

        const response = await courseService.getPublishedCourseById(id || "");
        const courseWithProgress = {
          course: response.data!,
          enrolled: false,
          progressPercentage: 0,
          isAdmin: false,
        };
        setCourseData(courseWithProgress);
        setCurrentRating(response.data?.rating || 0);
        setTotalRatings(response.data?.totalRatings || 0);

        if (response.data?.chapters && response.data.chapters.length > 0) {
          setExpandedChapter(response.data.chapters[0].id);
        }
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement du cours:", err);
      setError(err.message || "Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated || !id) {
      console.log("❌ Utilisateur non authentifié ou ID manquant");
      return;
    }

    try {
      setEnrolling(true);
      console.log("🎯 Début inscription au cours:", id);
      console.log("👤 Utilisateur:", user);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("🔑 Token présent, envoi de la requête...");

      const response = await fetch(`${API_BASE_URL}/courses/${id}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Réponse inscription status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Inscription réussie:", result);

        alert(
          "🎉 Inscription réussie ! Vous pouvez maintenant commencer le cours."
        );

        console.log("🔄 Rechargement des données du cours...");
        await loadCourse();
      } else {
        const errorData = await response.json();
        console.error("❌ Erreur inscription:", errorData);

        if (
          response.status === 400 &&
          errorData.message?.includes("déjà inscrit")
        ) {
          alert("ℹ️ Vous êtes déjà inscrit à ce cours !");
          await loadCourse();
        } else {
          throw new Error(errorData.message || "Erreur lors de l'inscription");
        }
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de l'inscription:", err);

      let errorMessage = "Erreur lors de l'inscription";

      if (err.message.includes("Token")) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (
        err.message.includes("network") ||
        err.message.includes("fetch")
      ) {
        errorMessage = "Problème de connexion. Vérifiez votre internet.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);

      if (err.message.includes("Token") || err.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
      }
    } finally {
      setEnrolling(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "DEBUTANT":
        return "bg-green-100 text-green-800";
      case "INTERMEDIAIRE":
        return "bg-yellow-100 text-yellow-800";
      case "AVANCE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "DEBUTANT":
        return "Débutant";
      case "INTERMEDIAIRE":
        return "Intermédiaire";
      case "AVANCE":
        return "Avancé";
      default:
        return level;
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const getTotalLessons = () => {
    if (!courseData?.course.chapters) return 0;
    return courseData.course.chapters.reduce(
      (total, chapter) => total + (chapter.lessons?.length || 0),
      0
    );
  };

  const getCompletedLessons = () => {
    return courseData?.completedLessons || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#0096F0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Cours non trouvé"}
          </h1>
          <Link
            to="/courses"
            className="text-[#0096F0] hover:text-[#0080D6] transition-colors"
          >
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  const { course } = courseData;

  const enrolled = courseData.enrolled || false;
  const progressPercentage = courseData.progressPercentage || 0;
  const isAdmin = courseData.isAdmin || user?.role === "ADMIN" || false;

  console.log("🎯 Rendu avec:", {
    isAuthenticated,
    enrolled,
    isAdmin,
    userRole: user?.role,
    progressPercentage,
    rawEnrolled: courseData.enrolled,
    courseDataFull: courseData,
  });

  console.log("DEBUG Enrollment Card:", {
    condition1: enrolled,
    condition2: isAdmin,
    condition3: enrolled || isAdmin,
    shouldShowEnrolledCard: enrolled || isAdmin,
    rawData: { enrolled: courseData.enrolled, isEnrolled: courseData.enrolled },
  });

  const handleRatingUpdate = (newRating: number) => {
    setCurrentRating(newRating);
    setTotalRatings((prevTotal) => prevTotal + 1);
    setShowRatingSection(false);
  };

  const handleRatingClick = () => {
    setShowRatingSection(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div className="h-96 bg-gradient-to-r from-black/60 to-black/40 relative overflow-hidden">
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0096F0]/80 to-[#DFB216]/80 absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="relative h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <div className="max-w-4xl">
                <nav className="mb-4">
                  <Link
                    to="/courses"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux cours
                  </Link>
                </nav>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#DFB216]/90 text-white rounded-full text-sm font-medium mb-4">
                    {course.categoryName || "Général"}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {course.title}
                </h1>

                <p className="text-xl text-white/90 mb-6 leading-relaxed max-w-3xl">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{getTotalLessons()} leçons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5" />
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(
                        course.level
                      )} text-gray-800`}
                    >
                      {getLevelLabel(course.level)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>
                      {course.students?.toLocaleString() || 0} étudiants
                    </span>
                  </div>
                  <button
                    onClick={handleRatingClick}
                    className="flex items-center space-x-2 cursor-pointer hover:text-[#DFB216] transition-colors"
                  >
                    <Star className="w-5 h-5 text-[#DFB216]" />
                    <span>{currentRating.toFixed(1)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {enrolled && !isAdmin && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Votre progression
                  </h2>
                  <span className="text-[#0096F0] font-medium">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#0096F0] to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {getCompletedLessons()} sur {getTotalLessons()} leçons
                  terminées
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-purple-800">
                    Mode Administrateur
                  </h2>
                </div>
                <p className="text-purple-700 text-sm">
                  Vous visualisez ce cours en tant qu'administrateur. Vous avez
                  accès à toutes les fonctionnalités.
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                À propos de ce cours
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">{course.description}</p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
                  Ce que vous allez apprendre
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Maîtriser les concepts fondamentaux du domaine</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Acquérir des compétences pratiques et applicables
                    </span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
                  Prérequis
                </h3>
                <ul className="space-y-2">
                  <li>• Motivation pour apprendre et pratiquer</li>
                  <li>
                    • Un ordinateur ou une tablette ou un smartphone avec accès
                    à Internet
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contenu du cours
              </h2>

              <div className="space-y-4">
                {course.chapters?.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="border border-gray-200 rounded-lg"
                  >
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#0096F0]/10 rounded-lg flex items-center justify-center">
                          <span className="text-[#0096F0] font-medium text-sm">
                            {chapter.orderIndex}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {chapter.lessons?.length || 0} leçons
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedChapter === chapter.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedChapter === chapter.id && chapter.lessons && (
                      <div className="border-t border-gray-200">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 pl-16 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Play className="w-5 h-5 text-gray-400" />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {lesson.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {lesson.contentType === "VIDEO"
                                    ? "Vidéo"
                                    : lesson.contentType === "TEXT"
                                    ? "Texte"
                                    : "Document"}
                                </p>
                              </div>
                            </div>
                            {(enrolled || isAdmin) && (
                              <Link
                                to={`/player/${course.id}/${lesson.id}`}
                                className="text-[#0096F0] hover:text-[#0080D6] transition-colors text-sm font-medium"
                              >
                                {isAdmin ? "Prévisualiser" : "Commencer"}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Le contenu du cours sera bientôt disponible.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
                {enrolled || isAdmin ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      {isAdmin ? "Aperçu Administrateur" : "Votre parcours"}
                    </h3>

                    {enrolled && !isAdmin && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progression
                          </span>
                          <span className="text-sm font-medium text-[#0096F0]">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#0096F0] to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/player/${course.id}`}
                      className="w-full bg-[#0096F0] text-white py-4 rounded-lg font-semibold hover:bg-[#0080D6] transition-colors flex items-center justify-center space-x-2 mb-4"
                    >
                      <Play className="w-5 h-5" />
                      <span>
                        {isAdmin
                          ? "Prévisualiser le cours"
                          : progressPercentage && progressPercentage > 0
                          ? "Continuer le cours"
                          : "Commencer le cours"}
                      </span>
                    </Link>

                    {isAdmin ?? (
                      <Link
                        to={`/admin/course/edit/${course.id}`}
                        className="w-full border border-[#0096F0] text-[#0096F0] py-3 rounded-lg font-medium hover:bg-[#0096F0]/10 transition-colors text-center block"
                      >
                        ⚙️ Modifier le cours
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        Gratuit
                      </div>
                      <p className="text-gray-600">Accès illimité à vie</p>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-[#0096F0] text-white py-4 rounded-lg font-semibold hover:bg-[#0080D6] transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Inscription en cours...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>S'inscrire gratuitement</span>
                          </div>
                        )}
                      </button>
                    ) : (
                      <Link to="/auth">
                        <button className="w-full bg-[#0096F0] text-white py-4 rounded-lg font-semibold hover:bg-[#0080D6] transition-colors mb-4">
                          S'inscrire gratuitement
                        </button>
                      </Link>
                    )}

                    <p className="text-center text-sm text-gray-500 mb-6">
                      Cours entièrement gratuit
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Accès illimité au cours</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Ressources téléchargeables</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Informations du cours
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Durée totale</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Niveau</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                        course.level
                      )}`}
                    >
                      {getLevelLabel(course.level)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dernière mise à jour</span>
                    <span className="font-medium">
                      {course.updatedAt
                        ? new Date(course.updatedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Récemment"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Catégorie</span>
                    <span className="font-medium">
                      {course.categoryName || "Général"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {id && (
        <Modal isOpen={showRatingSection} onClose={() => setShowRatingSection(false)}>
          <CourseRatingComponent
            courseId={id}
            isEnrolled={enrolled}
            isAuthenticated={isAuthenticated}
            currentRating={currentRating}
            totalRatings={totalRatings}
            onRatingUpdate={handleRatingUpdate}
            initialShowForm={true}
            onClose={() => setShowRatingSection(false)}
          />
        </Modal>
      )}
    </div>
  );
}