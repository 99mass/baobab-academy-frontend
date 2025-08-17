/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Menu,
  X,
  FileText,
  Video,
  Download,
  Clock,
  FolderOpen,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../hooks/useAuth";
import type { Chapter, Lesson, CourseWithProgress } from "../types/course";

export default function CoursePlayer() {
  const { id, lessonId } = useParams<{ id: string; lessonId?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [courseData, setCourseData] = useState<CourseWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Charger le cours avec progression
  useEffect(() => {
    if (id) {
      loadCourseWithProgress();
    }
  }, [id, isAuthenticated]);

  // Définir la leçon courante
  useEffect(() => {
    if (courseData && lessonId) {
      setCurrentLessonId(lessonId);
    } else if (courseData && !lessonId && courseData.course.chapters) {
      // Si pas de lessonId dans l'URL, prendre la première leçon
      const firstChapter = courseData.course.chapters[0];
      if (firstChapter?.lessons && firstChapter.lessons.length > 0) {
        const firstLessonId = firstChapter.lessons[0].id;
        setCurrentLessonId(firstLessonId);
        navigate(`/player/${id}/${firstLessonId}`, { replace: true });
      }
    }
  }, [courseData, lessonId, id, navigate]);

  // Dans CoursePlayer.tsx, modifiez la fonction loadCourseWithProgress

  const loadCourseWithProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        throw new Error("Vous devez être connecté pour accéder à ce contenu");
      }

      console.log("🎯 Chargement du cours pour le player:", id);

      const response = await courseService.getCourseWithProgress(id!);

      if (response.success && response.data) {
        console.log("✅ Données du cours reçues:", response.data);

        // 🆕 CORRECTION : Mapper correctement les propriétés du backend
        const mappedData: CourseWithProgress = {
          course: response.data.course,
          enrolled: response.data.enrolled || false,
          progressPercentage: response.data.progressPercentage || 0,
          completedLessons: response.data.completedLessons || 0,
          totalLessons: response.data.totalLessons || 0,
          userProgress: response.data.userProgress || [],
        };

        console.log("🔄 Données mappées:", {
          enrolled: response.data.enrolled,
          isEnrolled: response.data.enrolled,
          finalIsEnrolled: mappedData.enrolled,
        });

        setCourseData(mappedData);

        // Vérifier que l'utilisateur est bien inscrit
        if (!mappedData.enrolled && user?.role !== "ADMIN") {
          throw new Error("Vous devez vous inscrire à ce cours pour y accéder");
        }
      } else {
        throw new Error(
          response.message || "Erreur lors du chargement du cours"
        );
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement:", err);
      setError(err.message || "Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLesson = (): Lesson | null => {
    if (!courseData || !currentLessonId) return null;

    for (const chapter of courseData.course.chapters || []) {
      const lesson = chapter.lessons?.find((l) => l.id === currentLessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  const getCurrentChapter = (): Chapter | null => {
    if (!courseData || !currentLessonId) return null;

    return (
      courseData.course.chapters?.find((chapter) =>
        chapter.lessons?.some((lesson) => lesson.id === currentLessonId)
      ) || null
    );
  };

  const getAllLessons = (): Lesson[] => {
    if (!courseData?.course.chapters) return [];
    return courseData.course.chapters.flatMap(
      (chapter) => chapter.lessons || []
    );
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return (
      courseData?.userProgress?.some(
        (progress) => progress.lessonId === lessonId && progress.completed
      ) || false
    );
  };

  const getLessonProgress = (lessonId: string): number => {
    const progress = courseData?.userProgress?.find(
      (p) => p.lessonId === lessonId
    );
    return progress?.progressPercentage || 0;
  };

  // Fonction pour obtenir le statut d'une leçon
  const getLessonStatus = (
    lessonId: string
  ): "completed" | "in-progress" | "not-started" => {
    if (isLessonCompleted(lessonId)) return "completed";
    const progress = getLessonProgress(lessonId);
    return progress > 0 ? "in-progress" : "not-started";
  };

  // Fonction pour obtenir le nombre de leçons terminées dans un chapitre
  const getChapterCompletedLessons = (chapter: Chapter): number => {
    if (!chapter.lessons) return 0;
    return chapter.lessons.filter((lesson) => isLessonCompleted(lesson.id))
      .length;
  };

  const navigateToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    navigate(`/player/${id}/${lessonId}`, { replace: true });
  };

  const markAsCompleted = async () => {
    if (!currentLessonId || markingComplete) return;

    try {
      setMarkingComplete(true);
      console.log("✅ Marquage de la leçon comme complétée:", currentLessonId);

      await courseService.markLessonAsCompleted(currentLessonId);

      // Recharger les données pour mettre à jour la progression
      await loadCourseWithProgress();

      console.log("✅ Leçon marquée comme complétée avec succès");
    } catch (err: any) {
      console.error("❌ Erreur lors du marquage:", err);
      alert("Erreur lors du marquage de la leçon comme complétée");
    } finally {
      setMarkingComplete(false);
    }
  };

  // Fonction pour vérifier si l'URL est une vidéo YouTube ou autre
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-textPrimary mb-4">
            {error || "Cours non trouvé"}
          </h1>
          <div className="space-y-4">
            <Link
              to={`/course/${id}`}
              className="inline-block text-primary hover:text-primary/80 transition-colors"
            >
              Retour au cours
            </Link>
            <br />
            <Link
              to="/courses"
              className="inline-block text-gray-600 hover:text-gray-800 transition-colors"
            >
              Retour aux cours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const currentChapter = getCurrentChapter();
  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex(
    (lesson) => lesson.id === currentLessonId
  );
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Vérifier si la leçon courante est terminée
  const isCurrentLessonCompleted = currentLessonId
    ? isLessonCompleted(currentLessonId)
    : false;

  if (!currentLesson || !currentChapter) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-textPrimary mb-4">
            Leçon non trouvée
          </h1>
          <Link
            to={`/course/${id}`}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Retour au cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } pt-5 transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <Link
              to={`/course/${id}`}
              className="flex items-center text-gray-600 hover:text-primary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au cours
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="font-semibold text-textPrimary truncate">
            {courseData.course.title}
          </h2>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{Math.round(courseData.progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${courseData.progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {courseData.completedLessons} / {courseData.totalLessons} leçons
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="flex-1 overflow-y-auto">
          {courseData.course.chapters?.map((chapter) => {
            const completedLessons = getChapterCompletedLessons(chapter);
            const totalLessons = chapter.lessons?.length || 0;
            const isChapterCompleted =
              totalLessons > 0 && completedLessons === totalLessons;

            return (
              <div
                key={chapter.id}
                className="border-b border-gray-100 last:border-b-0"
              >
                {/* Chapter Header avec indicateur de progression */}
                <div
                  className={`p-4 transition-colors ${
                    isChapterCompleted
                      ? "bg-green-50 border-l-4 border-l-green-500"
                      : completedLessons > 0
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        isChapterCompleted
                          ? "text-green-700"
                          : "text-textPrimary"
                      }`}
                    >
                      {chapter.title}
                    </h3>
                    {isChapterCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p
                      className={`text-sm ${
                        isChapterCompleted ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {completedLessons} / {totalLessons} leçons
                    </p>
                    {completedLessons > 0 && !isChapterCompleted && (
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (completedLessons / totalLessons) * 100
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Lessons */}
                <div>
                  {chapter.lessons?.map((lesson) => {
                    const lessonStatus = getLessonStatus(lesson.id);
                    const isCurrentLesson = currentLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(lesson.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 relative ${
                          isCurrentLesson
                            ? lessonStatus === "completed"
                              ? "bg-green-50 border-r-4 border-r-green-500"
                              : "bg-primary/5 border-r-4 border-r-primary"
                            : lessonStatus === "completed"
                            ? "bg-green-25 hover:bg-green-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {lessonStatus === "completed" ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : isCurrentLesson ? (
                              <PlayCircle className="w-5 h-5 text-primary" />
                            ) : lessonStatus === "in-progress" ? (
                              <div className="relative">
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              {lesson.contentType === "VIDEO" && (
                                <Video className="w-4 h-4 text-gray-400" />
                              )}
                              {lesson.contentType === "TEXT" && (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                              {lesson.contentType === "DOCUMENT" && (
                                <Download className="w-4 h-4 text-gray-400" />
                              )}
                              <h4
                                className={`font-medium truncate ${
                                  isCurrentLesson
                                    ? lessonStatus === "completed"
                                      ? "text-green-700"
                                      : "text-primary"
                                    : lessonStatus === "completed"
                                    ? "text-green-700"
                                    : "text-textPrimary"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  lessonStatus === "completed"
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {lesson.contentType === "VIDEO"
                                  ? "Vidéo"
                                  : lesson.contentType === "TEXT"
                                  ? "Texte"
                                  : "Document"}
                                {lessonStatus === "completed" && " • Terminée"}
                              </p>
                            </div>

                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-5">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-semibold text-textPrimary flex">
                <FolderOpen className="w-6 h-6 text-primary mr-2" />
                {currentLesson.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCurrentLessonCompleted && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Terminé
              </span>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 bg-gray-50">
          {currentLesson.contentType === "VIDEO" && currentLesson.videoUrl ? (
            // Zone vidéo avec lecteur intégré
            <div className="bg-black">
              <div className="max-w-6xl mx-auto">
                <div className="aspect-video">
                  {isYouTubeUrl(currentLesson.videoUrl) ? (
                    // Lecteur YouTube intégré
                    <iframe
                      src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                      title={currentLesson.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Lecteur vidéo HTML5 pour autres formats
                    <video
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      className="w-full h-full"
                      controls
                      preload="metadata"
                      onLoadedData={() => {
                        console.log("Vidéo chargée");
                      }}
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        const progress =
                          (video.currentTime / video.duration) * 100;
                        if (progress > 0 && progress % 10 === 0) {
                          courseService.updateLessonProgress(
                            currentLessonId!,
                            Math.floor(progress),
                            Math.floor(video.currentTime)
                          );
                        }
                      }}
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  )}
                </div>
              </div>
            </div>
          ) : currentLesson.contentType === "DOCUMENT" &&
            currentLesson.documentUrl ? (
            // 🆕 Zone document avec visualiseur intégré
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                  {/* Visualiseur de document */}
                  <div className="h-[600px] bg-gray-100">
                    {currentLesson.documentUrl
                      .toLowerCase()
                      .endsWith(".pdf") ? (
                      // Visualiseur PDF intégré
                      <iframe
                        src={`${currentLesson.documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        title={currentLesson.title}
                        className="w-full h-full border-0"
                        onLoad={() => {
                          // Marquer comme commencé quand le document se charge
                          courseService.updateLessonProgress(
                            currentLessonId!,
                            25,
                            0
                          );
                        }}
                      />
                    ) : (
                      // Autres types de documents
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Download className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-textPrimary mb-2">
                          Document disponible
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                          Ce document n'est pas prévisualisable directement.
                          Cliquez sur le bouton de téléchargement ci-dessus pour
                          l'ouvrir.
                        </p>
                        <a
                          href={currentLesson.documentUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          onClick={() => {
                            // Marquer comme consulté lors du téléchargement
                            courseService.updateLessonProgress(
                              currentLessonId!,
                              50,
                              0
                            );
                          }}
                        >
                          <Download className="w-5 h-5" />
                          <span>Ouvrir le document</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Zone de contenu texte (défaut)
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    {currentLesson.contentType === "VIDEO" && (
                      <Video className="w-6 h-6 text-primary" />
                    )}
                    {currentLesson.contentType === "TEXT" && (
                      <FileText className="w-6 h-6 text-primary" />
                    )}
                    {currentLesson.contentType === "DOCUMENT" && (
                      <Download className="w-6 h-6 text-primary" />
                    )}
                    <h2 className="text-2xl font-semibold text-textPrimary">
                      {currentLesson.title}
                    </h2>
                  </div>

                  <div className="prose max-w-none">
                    {currentLesson.content ? (
                      <div
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.content,
                        }}
                      />
                    ) : (
                      <div className="text-gray-700 leading-relaxed">
                        <p className="mb-4">
                          Dans cette leçon, nous explorerons les concepts
                          importants qui vous permettront de progresser dans
                          votre apprentissage.
                        </p>
                        <p className="mb-4">
                          Prenez le temps de bien comprendre chaque notion
                          présentée et n'hésitez pas à revoir cette leçon si
                          nécessaire.
                        </p>
                        <p>
                          Une fois que vous avez assimilé le contenu, vous
                          pouvez marquer cette leçon comme terminée et passer à
                          la suivante.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Navigation */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              {previousLesson ? (
                <button
                  onClick={() => navigateToLesson(previousLesson.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* 🎯 BOUTON CLÉ : Afficher seulement si la leçon n'est PAS déjà terminée */}
              {!isCurrentLessonCompleted && (
                <button
                  onClick={markAsCompleted}
                  disabled={markingComplete}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingComplete ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Marquage...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Marquer comme terminé</span>
                    </>
                  )}
                </button>
              )}

              {nextLesson && (
                <button
                  onClick={() => navigateToLesson(nextLesson.id)}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
