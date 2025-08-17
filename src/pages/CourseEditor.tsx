/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  Upload,
  Plus,
  Eye,
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Settings,
  Trash2,
  GripVertical,
  Edit3,
  Send,
  Link,
  File,
  X,
  ExternalLink,
} from "lucide-react";
import { courseService } from "../services/courseService";
import type {
  Course,
  Category,
  Chapter,
  Lesson,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseLevel,
  ContentType,
} from "../types/course";

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    coverImage: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "settings">(
    "basic"
  );

  // État du formulaire de base
  const [basicForm, setBasicForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    level: "DEBUTANT" as CourseLevel,
    duration: "",
  });

  // État pour l'upload d'image
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // État pour la durée
  const [duration, setDuration] = useState({ hours: "", minutes: "" });

  // État pour les messages d'erreur
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // État pour les chapitres et leçons
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // États des modales
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  // NOUVEAUX ÉTATS pour la gestion des médias
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showVideoViewer, setShowVideoViewer] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>("");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [videoUploadType, setVideoUploadType] = useState<"local" | "url">(
    "local"
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Formulaires des modales
  const [chapterForm, setChapterForm] = useState({
    id: null as string | null,
    title: "",
  });
  const [lessonForm, setLessonForm] = useState({
    id: null as string | null,
    title: "",
    content: "",
    contentType: "TEXT" as ContentType,
    videoUrl: "",
  });

  // NOUVEAUX ÉTATS pour l'upload dans le formulaire de création
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
  const [lessonDocumentFile, setLessonDocumentFile] = useState<File | null>(
    null
  );
  const [lessonVideoType, setLessonVideoType] = useState<"url" | "file">("url");
  const [creatingLesson, setCreatingLesson] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadCategories();
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await courseService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const loadCourse = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await courseService.getCourseForEditing(id);
      if (response.success && response.data) {
        const courseData = response.data;
        setCourse(courseData);
        setBasicForm({
          title: courseData.title,
          description: courseData.description,
          categoryId: courseData.categoryId || "",
          level: courseData.level,
          duration: courseData.duration,
        });
        if (courseData.duration) {
          const parsed = parseDurationString(courseData.duration);
          setDuration({ hours: parsed.hours, minutes: parsed.minutes });
        }
        setImagePreview(courseData.coverImage || "");
        setChapters(courseData.chapters || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du cours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const formattedDurationString = formatDuration(
        duration.hours,
        duration.minutes
      );

      if (id) {
        const updateData: CourseUpdateRequest = {
          ...basicForm,
          duration: formattedDurationString,
        };
        const response = await courseService.updateCourse(id, updateData);
        if (response.success && response.data) {
          setCourse(response.data);
        }
      } else {
        const createData: CourseCreateRequest = {
          ...basicForm,
          duration: formattedDurationString,
        };
        const response = await courseService.createCourse(createData);
        if (response.success && response.data) {
          const newCourse = response.data;
          if (selectedImage) {
            await handleImageUpload(newCourse.id);
          } else {
            setCourse(newCourse);
            navigate(`/admin/course/edit/${newCourse.id}`, { replace: true });
          }
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      let errorMessageText = "Erreur lors de la sauvegarde";

      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.message) {
          errorMessageText = responseData.message;
        }
        if (responseData.data && typeof responseData.data === "object") {
          const fieldErrors = Object.values(responseData.data).filter(
            (msg) => typeof msg === "string"
          );
          if (fieldErrors.length > 0) {
            errorMessageText = fieldErrors.join("; ");
          }
        } else if (typeof responseData === "string") {
          errorMessageText = responseData;
        }
      }
      setErrorMessage(errorMessageText);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (courseId: string) => {
    if (!selectedImage) return;

    setImageUploading(true);
    try {
      const response = await courseService.uploadCourseImage(
        courseId,
        selectedImage
      );
      if (response.success && response.data) {
        if (!id) {
          setCourse(response.data);
          navigate(`/admin/course/edit/${response.data.id}`, { replace: true });
          alert("Cours créé et image uploadée avec succès !");
        } else {
          setCourse(response.data);
          alert("Image uploadée avec succès !");
        }
        setImagePreview(response.data.coverImage || "");
        setSelectedImage(null);
      }
    } catch (error: any) {
      console.error("Erreur lors de l'upload:", error);
      alert(error.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdateChapter = async () => {
    if (!course?.id || !chapterForm.title.trim()) return;

    try {
      if (chapterForm.id) {
        // Update existing chapter
        const response = await courseService.updateChapter(chapterForm.id, {
          title: chapterForm.title,
        });
        if (response.success && response.data) {
          const updatedChapter = response.data;
          setChapters((prev) =>
            prev.map((c) =>
              c.id === updatedChapter.id
                ? { ...c, title: updatedChapter.title }
                : c
            )
          );
          alert("Chapitre modifié avec succès !");
        }
      } else {
        // Add new chapter
        const response = await courseService.addChapter(course.id, {
          title: chapterForm.title.trim(),
          orderIndex: chapters.length + 1,
        });
        if (response.success && response.data) {
          const newChapter: Chapter = {
            ...response.data,
            lessons: [],
          };
          setChapters((prev) => [...prev, newChapter]);
          alert("Chapitre ajouté avec succès !");
        }
      }
      setChapterForm({ id: null, title: "" });
      setShowChapterModal(false);
    } catch (error: any) {
      console.error(
        "Erreur lors de l'ajout ou de la modification du chapitre:",
        error
      );
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setChapterForm({ id: chapter.id, title: chapter.title });
    setShowChapterModal(true);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses leçons ?"
      )
    )
      return;

    try {
      await courseService.deleteChapter(chapterId);
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      alert("Chapitre supprimé avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la suppression du chapitre:", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleAddOrUpdateLesson = async () => {
    if (!selectedChapterId || !lessonForm.title.trim()) return;

    setCreatingLesson(true);

    try {
      if (lessonForm.id) {
        // Update existing lesson
        const response = await courseService.updateLesson(lessonForm.id, {
          title: lessonForm.title,
          content: lessonForm.content,
          contentType: lessonForm.contentType,
          videoUrl: lessonForm.videoUrl,
        });

        if (response.success && response.data) {
          const updatedLesson = response.data;
          setChapters((prev) =>
            prev.map((chapter) => ({
              ...chapter,
              lessons: chapter.lessons?.map((l) =>
                l.id === updatedLesson.id ? updatedLesson : l
              ),
            }))
          );
          alert("Leçon modifiée avec succès !");
        }
      } else {
        // Add new lesson
        const currentChapter = chapters.find((c) => c.id === selectedChapterId);
        const orderIndex = (currentChapter?.lessons?.length || 0) + 1;

        const response = await courseService.addLesson(selectedChapterId, {
          title: lessonForm.title.trim(),
          content: lessonForm.content,
          contentType: lessonForm.contentType,
          videoUrl: lessonForm.videoUrl || undefined,
          orderIndex: orderIndex,
        });

        if (response.success && response.data) {
          let updatedLesson = response.data;

          if (
            lessonForm.contentType === "VIDEO" &&
            lessonVideoType === "file" &&
            lessonVideoFile
          ) {
            const videoResponse = await courseService.uploadLessonVideo(
              updatedLesson.id,
              lessonVideoFile
            );
            if (videoResponse.success && videoResponse.data) {
              updatedLesson = videoResponse.data;
            }
          }

          if (lessonForm.contentType === "DOCUMENT" && lessonDocumentFile) {
            const docResponse = await courseService.uploadLessonDocument(
              updatedLesson.id,
              lessonDocumentFile
            );
            if (docResponse.success && docResponse.data) {
              updatedLesson = docResponse.data;
            }
          }

          setChapters((prev) =>
            prev.map((chapter) =>
              chapter.id === selectedChapterId
                ? {
                    ...chapter,
                    lessons: [...(chapter.lessons || []), updatedLesson],
                  }
                : chapter
            )
          );
          alert("Leçon ajoutée avec succès !");
        }
      }

      // Reset form and close modal
      setLessonForm({
        id: null,
        title: "",
        content: "",
        contentType: "TEXT" as ContentType,
        videoUrl: "",
      });
      setLessonVideoFile(null);
      setLessonDocumentFile(null);
      setLessonVideoType("url");
      setShowLessonModal(false);
      setSelectedChapterId("");
    } catch (error: any) {
      console.error(
        "Erreur lors de l'ajout ou de la modification de la leçon:",
        error
      );
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedChapterId(lesson.chapterId);
    setLessonForm({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || "",
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl || "",
    });
    setShowLessonModal(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette leçon ?")) return;

    try {
      await courseService.deleteLesson(lessonId);
      setChapters((prev) =>
        prev.map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons?.filter((l) => l.id !== lessonId),
        }))
      );
      alert("Leçon supprimée avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la leçon:", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // NOUVELLE FONCTION : Gestion des vidéos
  const handleVideoUpload = async (file?: File) => {
    if (!selectedLessonId) return;

    setUploading(true);
    try {
      let response;

      if (videoUploadType === "local" && file) {
        // Upload vidéo locale
        response = await courseService.uploadLessonVideo(
          selectedLessonId,
          file
        );
      } else if (videoUploadType === "url" && videoUrl.trim()) {
        // URL externe
        response = await courseService.setLessonVideoUrl(
          selectedLessonId,
          videoUrl.trim()
        );
      } else {
        alert("Veuillez sélectionner un fichier ou saisir une URL");
        return;
      }

      if (response.success && response.data) {
        // Mettre à jour la leçon dans l'état
        setChapters((prev) =>
          prev.map((chapter) => ({
            ...chapter,
            lessons: chapter.lessons?.map((lesson) =>
              lesson.id === selectedLessonId
                ? { ...lesson, videoUrl: response.data!.videoUrl }
                : lesson
            ),
          }))
        );

        alert(
          `${
            videoUploadType === "local" ? "Vidéo uploadée" : "URL vidéo définie"
          } avec succès !`
        );
        setShowVideoModal(false);
        setSelectedLessonId("");
        setVideoUrl("");
      }
    } catch (error: any) {
      console.error("Erreur lors de la gestion vidéo:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    } finally {
      setUploading(false);
    }
  };

  // NOUVELLE FONCTION : Upload de documents
  const handleDocumentUpload = async (file: File) => {
    if (!selectedLessonId) return;

    setUploading(true);
    try {
      const response = await courseService.uploadLessonDocument(
        selectedLessonId,
        file
      );

      if (response.success && response.data) {
        // Mettre à jour la leçon dans l'état
        setChapters((prev) =>
          prev.map((chapter) => ({
            ...chapter,
            lessons: chapter.lessons?.map((lesson) =>
              lesson.id === selectedLessonId
                ? { ...lesson, documentUrl: response.data!.documentUrl }
                : lesson
            ),
          }))
        );

        alert("Document uploadé avec succès !");
        setShowDocumentModal(false);
        setSelectedLessonId("");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'upload du document:", error);
      alert(error.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!course?.id) return;

    if (
      !confirm(
        "Êtes-vous sûr de vouloir publier ce cours ? Il sera visible par tous les utilisateurs."
      )
    ) {
      return;
    }

    try {
      const response = await courseService.publishCourse(course.id);
      if (response.success && response.data) {
        setCourse(response.data);
        alert("Cours publié avec succès !");
      }
    } catch (error: any) {
      console.error("Erreur lors de la publication:", error);
      alert(error.response?.data?.message || "Erreur lors de la publication");
    }
  };

  const handleDeleteCourse = async () => {
    if (!course?.id) return;

    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      await courseService.deleteCourse(course.id);
      alert("Cours supprimé avec succès !");
      navigate("/admin");
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const totalDurationMinutes =
    (parseInt(duration.hours, 10) || 0) * 60 +
    (parseInt(duration.minutes, 10) || 0);
  const isFormInvalid =
    !basicForm.title.trim() ||
    !basicForm.description.trim() ||
    !basicForm.categoryId ||
    totalDurationMinutes === 0;

  // Helper function to format duration for display
  const formatDuration = (hours: string, minutes: string) => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;

    if (h === 0 && m === 0) {
      return "";
    }

    let result = "";
    if (h > 0) {
      result += `${h}h`;
    }
    if (m > 0) {
      result += `${m}mn`;
    }
    return result;
  };

  // Helper function to parse duration string
  const parseDurationString = (durationString: string) => {
    const hoursMatch = durationString.match(/(\d+)h/);
    const minutesMatch = durationString.match(/(\d+)mn/);

    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

    return { hours: hours.toString(), minutes: minutes.toString() };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center space-x-2 text-gray-600 hover:text-textPrimary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-textPrimary">
              {id ? "Modifier le cours" : "Nouveau cours"}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {course && (
              <>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === "PUBLISHED"
                      ? "bg-success/20 text-success"
                      : course.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {courseService.getStatusLabel(course.status as any)}
                </span>

                {course.status === "DRAFT" && (
                  <button
                    onClick={handlePublishCourse}
                    className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publier</span>
                  </button>
                )}

                <button
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Prévisualiser</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200 w-fit">
          {[
            { id: "basic", label: "Informations de base", icon: BookOpen },
            {
              id: "content",
              label: "Contenu",
              icon: FileText,
              disabled: !course.id,
            },
            {
              id: "settings",
              label: "Paramètres",
              icon: Settings,
              disabled: !course.id,
            },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : tab.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-textPrimary hover:bg-gray-50"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-8">
          {/* Onglet Informations de base */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {errorMessage && (
                <div
                  className="lg:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <span className="block sm:inline">{errorMessage}</span>
                  <span
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setErrorMessage(null)}
                  >
                    <svg
                      className="fill-current h-6 w-6 text-red-500"
                      role="button"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <title>Close</title>
                      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                  </span>
                </div>
              )}

              {/* Formulaire principal */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-textPrimary mb-6">
                    Informations générales
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du cours *
                      </label>
                      <input
                        type="text"
                        value={basicForm.title}
                        onChange={(e) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="Ex: Introduction à React"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={basicForm.description}
                        onChange={(e) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="Décrivez votre cours en quelques mots..."
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie *
                        </label>
                        <select
                          value={basicForm.categoryId}
                          onChange={(e) =>
                            setBasicForm((prev) => ({
                              ...prev,
                              categoryId: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                        >
                          <option value="" disabled>
                            Sélectionner une catégorie
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau *
                        </label>
                        <select
                          value={basicForm.level}
                          onChange={(e) =>
                            setBasicForm((prev) => ({
                              ...prev,
                              level: e.target.value as CourseLevel,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                        >
                          <option value="DEBUTANT">Débutant</option>
                          <option value="INTERMEDIAIRE">Intermédiaire</option>
                          <option value="AVANCE">Avancé</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={duration.hours}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^[0-9]+$/.test(value)) {
                              setDuration((prev) => ({
                                ...prev,
                                hours: value,
                              }));
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="Heures"
                        />
                        <span className="text-gray-500">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={duration.minutes}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (/^[0-9]+$/.test(value) &&
                                parseInt(value, 10) < 60)
                            ) {
                              setDuration((prev) => ({
                                ...prev,
                                minutes: value,
                              }));
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="Minutes"
                        />
                        {formatDuration(duration.hours, duration.minutes) && (
                          <span className="text-gray-500 text-sm">
                            ({formatDuration(duration.hours, duration.minutes)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveBasicInfo}
                      disabled={saving || isFormInvalid}
                      className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {saving
                          ? "Sauvegarde..."
                          : id
                          ? "Enregistrer les modifications"
                          : "Créer le cours"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar - Image de couverture */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-textPrimary mb-4">
                    Image de couverture
                  </h3>

                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="course-image"
                      />
                      <label
                        htmlFor="course-image"
                        className="flex items-center justify-center space-x-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">Choisir une image</span>
                      </label>
                    </div>

                    {selectedImage && course?.id && (
                      <button
                        onClick={() => handleImageUpload(course.id!)}
                        disabled={imageUploading}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300"
                      >
                        {imageUploading
                          ? "Upload en cours..."
                          : "Uploader l'image"}
                      </button>
                    )}

                    <p className="text-xs text-gray-500">
                      Formats acceptés: JPG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                </div>

                {course && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-textPrimary mb-4">
                      Statistiques
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Étudiants:</span>
                        <span className="font-semibold">
                          {course.students ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Note:</span>
                        <span className="font-semibold">
                          {course.rating?.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chapitres:</span>
                        <span className="font-semibold">{chapters.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Leçons:</span>
                        <span className="font-semibold">
                          {chapters.reduce(
                            (total, chapter) =>
                              total + (chapter.lessons?.length || 0),
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Contenu */}
          {activeTab === "content" && course && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-textPrimary">
                    Structure du cours
                  </h3>
                  <button
                    onClick={() => {
                      setChapterForm({ id: null, title: "" });
                      setShowChapterModal(true);
                    }}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un chapitre</span>
                  </button>
                </div>

                {/* Liste des chapitres */}
                <div className="space-y-4">
                  {chapters.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun chapitre
                      </h4>
                      <p className="text-gray-600 mb-6">
                        Commencez par ajouter un chapitre à votre cours.
                      </p>
                      <button
                        onClick={() => setShowChapterModal(true)}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Créer le premier chapitre
                      </button>
                    </div>
                  ) : (
                    chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapter.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* En-tête du chapitre */}
                        <div className="bg-gray-50 p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 cursor-grab">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-500">
                                Chapitre {chapterIndex + 1}
                              </span>
                            </div>
                            <h4 className="font-semibold text-textPrimary">
                              {chapter.title}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditChapter(chapter)}
                              className="text-gray-400 hover:text-textPrimary transition-colors"
                              title="Modifier le chapitre"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Supprimer le chapitre"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500">
                              {chapter.lessons?.length || 0} leçon(s)
                            </span>
                            <button
                              onClick={() => {
                                setSelectedChapterId(chapter.id);
                                setLessonForm({
                                  id: null,
                                  title: "",
                                  content: "",
                                  contentType: "TEXT" as ContentType,
                                  videoUrl: "",
                                });
                                setShowLessonModal(true);
                              }}
                              className="flex items-center space-x-1 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Leçon</span>
                            </button>
                            <button
                              onClick={() =>
                                setExpandedChapter(
                                  expandedChapter === chapter.id
                                    ? null
                                    : chapter.id
                                )
                              }
                              className="text-gray-600 hover:text-textPrimary transition-colors"
                            >
                              {expandedChapter === chapter.id ? "−" : "+"}
                            </button>
                          </div>
                        </div>

                        {/* Leçons du chapitre */}
                        {expandedChapter === chapter.id && (
                          <div className="p-4 border-t border-gray-200">
                            {chapter.lessons && chapter.lessons.length > 0 ? (
                              <div className="space-y-3">
                                {chapter.lessons.map((lesson, lessonIndex) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm text-gray-500">
                                        {lessonIndex + 1}.
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        {lesson.contentType === "VIDEO" && (
                                          <Video className="w-4 h-4 text-red-500" />
                                        )}
                                        {lesson.contentType === "TEXT" && (
                                          <FileText className="w-4 h-4 text-blue-500" />
                                        )}
                                        {lesson.contentType === "DOCUMENT" && (
                                          <File className="w-4 h-4 text-green-500" />
                                        )}
                                        <span className="font-medium">
                                          {lesson.title}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                        {courseService.getContentTypeLabel(
                                          lesson.contentType
                                        )}
                                      </span>

                                      {/* GESTION DES VIDÉOS */}
                                      {lesson.contentType === "VIDEO" && (
                                        <div className="flex items-center space-x-1">
                                          {lesson.videoUrl ? (
                                            <div className="flex items-center space-x-1">
                                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                {lesson.videoUrl.includes(
                                                  "youtube.com"
                                                ) ||
                                                lesson.videoUrl.includes(
                                                  "vimeo.com"
                                                )
                                                  ? "URL"
                                                  : "Fichier"}
                                              </span>
                                              {lesson.videoUrl.includes(
                                                "youtube.com"
                                              ) ||
                                              lesson.videoUrl.includes(
                                                "vimeo.com"
                                              ) ? (
                                                <a
                                                  href={lesson.videoUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-500 hover:text-blue-700"
                                                >
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              ) : (
                                                <button
                                                  onClick={() => {
                                                    setSelectedVideoUrl(
                                                      lesson.videoUrl!
                                                    );
                                                    setShowVideoViewer(true);
                                                  }}
                                                  className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                                                  title="Voir la vidéo"
                                                >
                                                  <Eye className="w-3 h-3" />
                                                </button>
                                              )}
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedLessonId(lesson.id);
                                                setShowVideoModal(true);
                                              }}
                                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded cursor-pointer hover:bg-yellow-200 transition-colors"
                                            >
                                              Ajouter vidéo
                                            </button>
                                          )}
                                        </div>
                                      )}

                                      {/* GESTION DES DOCUMENTS */}
                                      {lesson.contentType === "DOCUMENT" && (
                                        <div className="flex items-center space-x-1">
                                          {lesson.documentUrl ? (
                                            <div className="flex items-center space-x-1">
                                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                PDF
                                              </span>
                                              <button
                                                onClick={() => {
                                                  setSelectedPdfUrl(
                                                    lesson.documentUrl!
                                                  );
                                                  setShowPdfViewer(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                                                title="Voir le PDF"
                                              >
                                                <Eye className="w-3 h-3" />
                                              </button>
                                              <a
                                                href={lesson.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                                title="Ouvrir dans un nouvel onglet"
                                              >
                                                <ExternalLink className="w-3 h-3" />
                                              </a>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedLessonId(lesson.id);
                                                setShowDocumentModal(true);
                                              }}
                                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded cursor-pointer hover:bg-yellow-200 transition-colors"
                                            >
                                              Ajouter document
                                            </button>
                                          )}
                                        </div>
                                      )}

                                      <button
                                        onClick={() => handleEditLesson(lesson)}
                                        className="text-gray-400 hover:text-textPrimary transition-colors"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteLesson(lesson.id)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <p className="text-gray-500 mb-3">
                                  Aucune leçon dans ce chapitre
                                </p>
                                <button
                                  onClick={() => {
                                    setSelectedChapterId(chapter.id);
                                    setShowLessonModal(true);
                                  }}
                                  className="text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                  Ajouter la première leçon
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Paramètres */}
          {activeTab === "settings" && course && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-textPrimary mb-6">
                  Paramètres du cours
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-textPrimary mb-3">
                      Statut de publication
                    </h4>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          course.status === "PUBLISHED"
                            ? "bg-success/20 text-success"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {courseService.getStatusLabel(course.status as any)}
                      </span>
                      {course.status === "DRAFT" && (
                        <button
                          onClick={handlePublishCourse}
                          className="bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors"
                        >
                          Publier le cours
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-red-600 mb-3">
                      Zone de danger
                    </h4>
                    <p className="text-gray-600 mb-4">
                      La suppression du cours est définitive et supprimera tous
                      les contenus associés.
                    </p>
                    <button
                      onClick={handleDeleteCourse}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer le cours</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajout/Modification de chapitre */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">
              {chapterForm.id ? "Modifier le chapitre" : "Nouveau chapitre"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du chapitre *
                </label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) =>
                    setChapterForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ex: Introduction au développement web"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowChapterModal(false);
                  setChapterForm({ id: null, title: "" });
                }}
                className="px-4 py-2 text-gray-600 hover:text-textPrimary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddOrUpdateChapter}
                disabled={!chapterForm.title.trim()}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300"
              >
                {chapterForm.id ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification de leçon */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">
              {lessonForm.id ? "Modifier la leçon" : "Nouvelle leçon"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la leçon *
                </label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ex: Les bases du HTML"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contenu *
                </label>
                <select
                  value={lessonForm.contentType}
                  onChange={(e) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      contentType: e.target.value as ContentType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={!!lessonForm.id}
                >
                  <option value="TEXT">📝 Texte</option>
                  <option value="VIDEO">🎥 Vidéo</option>
                  <option value="DOCUMENT">📄 Document</option>
                </select>
              </div>

              {/* Champs conditionnels selon le type */}
              {lessonForm.contentType === "TEXT" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu du texte
                  </label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Rédigez le contenu de votre leçon..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              )}

              {lessonForm.contentType === "VIDEO" && !lessonForm.id && (
                <div className="space-y-4">
                  {/* Choix du type de vidéo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type de vidéo *
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setLessonVideoType("url")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          lessonVideoType === "url"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Link className="w-4 h-4" />
                        <span>URL externe</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLessonVideoType("file")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          lessonVideoType === "file"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Fichier local</span>
                      </button>
                    </div>
                  </div>

                  {/* Champ selon le type choisi */}
                  {lessonVideoType === "url" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL de la vidéo *
                      </label>
                      <input
                        type="url"
                        value={lessonForm.videoUrl}
                        onChange={(e) =>
                          setLessonForm((prev) => ({
                            ...prev,
                            videoUrl: e.target.value,
                          }))
                        }
                        placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fichier vidéo *
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setLessonVideoFile(e.target.files?.[0] || null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formats: MP4, MOV, AVI, MKV, WebM (max 100MB)
                      </p>
                      {lessonVideoFile && (
                        <div className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                          <Video className="w-4 h-4" />
                          <span>
                            Fichier sélectionné: {lessonVideoFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {lessonForm.contentType === "DOCUMENT" && !lessonForm.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document PDF *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(e) =>
                      setLessonDocumentFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formats: PDF, DOC, DOCX, PPT, PPTX, TXT (max 10MB)
                  </p>
                  {lessonDocumentFile && (
                    <div className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                      <File className="w-4 h-4" />
                      <span>
                        Fichier sélectionné: {lessonDocumentFile.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setLessonForm({
                    id: null,
                    title: "",
                    content: "",
                    contentType: "TEXT" as ContentType,
                    videoUrl: "",
                  });
                  setLessonVideoFile(null);
                  setLessonDocumentFile(null);
                  setLessonVideoType("url");
                  setSelectedChapterId("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-textPrimary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddOrUpdateLesson}
                disabled={
                  creatingLesson ||
                  !lessonForm.title.trim() ||
                  (lessonForm.contentType === "VIDEO" &&
                    lessonVideoType === "url" &&
                    !lessonForm.videoUrl.trim() &&
                    !lessonForm.id) ||
                  (lessonForm.contentType === "VIDEO" &&
                    lessonVideoType === "file" &&
                    !lessonVideoFile &&
                    !lessonForm.id) ||
                  (lessonForm.contentType === "DOCUMENT" &&
                    !lessonDocumentFile &&
                    !lessonForm.id)
                }
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300"
              >
                {creatingLesson
                  ? "Traitement..."
                  : lessonForm.id
                  ? "Modifier"
                  : "Créer la leçon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOUVELLE Modal Gestion Vidéo */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary">
                Ajouter une vidéo
              </h3>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setSelectedLessonId("");
                  setVideoUrl("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Choix du type */}
            <div className="mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setVideoUploadType("local")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    videoUploadType === "local"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Fichier local</span>
                </button>
                <button
                  onClick={() => setVideoUploadType("url")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    videoUploadType === "url"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Link className="w-4 h-4" />
                  <span>URL externe</span>
                </button>
              </div>
            </div>

            {/* Contenu selon le type */}
            <div className="space-y-4">
              {videoUploadType === "local" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une vidéo
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleVideoUpload(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formats acceptés: MP4, MOV, AVI, MKV, WebM (max 100MB)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la vidéo
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleVideoUpload()}
                      disabled={uploading || !videoUrl.trim()}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300"
                    >
                      {uploading ? "Traitement..." : "Définir l'URL"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-primary">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Upload en cours...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOUVELLE Modal Upload Document */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary">
                Ajouter un document
              </h3>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedLessonId("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un document
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleDocumentUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés: PDF, DOC, DOCX, PPT, PPTX, TXT (max 10MB)
                </p>
              </div>
            </div>

            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-primary">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Upload en cours...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOUVEAU : Modal Visualiseur PDF */}
      {showPdfViewer && selectedPdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl h-5/6 mx-4 flex flex-col">
            {/* Header du visualiseur */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-textPrimary flex items-center space-x-2">
                <File className="w-5 h-5" />
                <span>Aperçu du document</span>
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir</span>
                </a>
                <button
                  onClick={() => {
                    setShowPdfViewer(false);
                    setSelectedPdfUrl("");
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu du visualiseur */}
            <div className="flex-1 p-4">
              <iframe
                src={`${selectedPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border border-gray-300 rounded-lg"
                title="Aperçu PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* NOUVEAU : Modal Visualiseur Vidéo */}
      {showVideoViewer && selectedVideoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-full h-5/6 mx-4 flex flex-col">
            {/* Header du visualiseur */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-textPrimary flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Aperçu de la vidéo</span>
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir</span>
                </a>
                <button
                  onClick={() => {
                    setShowVideoViewer(false);
                    setSelectedVideoUrl("");
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu du visualiseur */}
            <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
              <video
                src={selectedVideoUrl}
                controls
                className="max-w-full max-h-full object-contain rounded-lg"
                title="Aperçu Vidéo"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
