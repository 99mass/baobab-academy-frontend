/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  Star,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  Users,
  Award,
  Calendar,
  ArrowRight,
  List,
  LayoutGrid,
} from "lucide-react";
import { courseService } from "../services/courseService";
import type { Course, Category } from "../types/course";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // 🆕 NOUVEAU: État pour la vue (par défaut liste)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    const fetchCoursesAndCategories = async () => {
      try {
        setLoading(true);
        const courseResponse = await courseService.getPublishedCourses();
        if (courseResponse.success && courseResponse.data) {
          setCourses(courseResponse.data.content);
        } else {
          throw new Error(courseResponse.message || "Failed to fetch courses");
        }

        const categoryResponse = await courseService.getCategories();
        if (categoryResponse.success && categoryResponse.data) {
          setCategories(categoryResponse.data);
        } else {
          throw new Error(
            categoryResponse.message || "Failed to fetch categories"
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndCategories();
  }, []);

  // Fonction pour obtenir l'URL de l'image ou fallback
  const getImageUrl = (coverImage: string | undefined) => {
    if (!coverImage) return null;

    if (coverImage.startsWith("http")) {
      return coverImage;
    }

    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${API_BASE_URL}${
      coverImage.startsWith("/") ? "" : "/"
    }${coverImage}`;
  };

  const levels = ["all", "DEBUTANT", "INTERMEDIAIRE", "AVANCE"];
  const durations = ["all", "1-3 mois", "3-6 mois", "6+ mois"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.categoryId === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || course.level === selectedLevel;

    let matchesDuration = true;
    if (selectedDuration !== "all") {
      const durationInMonths = parseInt(course.duration);
      if (selectedDuration === "1-3 mois")
        matchesDuration = durationInMonths >= 1 && durationInMonths <= 3;
      else if (selectedDuration === "3-6 mois")
        matchesDuration = durationInMonths > 3 && durationInMonths <= 6;
      else if (selectedDuration === "6+ mois")
        matchesDuration = durationInMonths > 6;
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesDuration;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedDuration("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    selectedDuration !== "all";

  // 🆕 NOUVEAU: Composant Card pour la vue grille
  const CourseCardGrid = ({ course }: { course: Course }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
      {/* Image de couverture avec overlay */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        {course.coverImage ? (
          <>
            <img
              src={getImageUrl(course.coverImage) || ""}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                console.error("Erreur chargement image:", course.coverImage);
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              style={{ display: "none" }}
            >
              <BookOpen className="w-16 h-16 text-primary/60" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-primary/60" />
          </div>
        )}

        {/* Badge niveau */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
              course.level === "DEBUTANT"
                ? "bg-green-100/90 text-green-700"
                : course.level === "INTERMEDIAIRE"
                ? "bg-yellow-100/90 text-yellow-700"
                : "bg-red-100/90 text-red-700"
            }`}
          >
            {courseService.getLevelLabel(course.level)}
          </span>
        </div>

        {/* Badge statut */}
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              course.status === "PUBLISHED"
                ? "bg-success/90 text-white"
                : "bg-yellow-100/90 text-yellow-700"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                course.status === "PUBLISHED" ? "bg-white" : "bg-yellow-500"
              }`}
            ></div>
            {courseService.getStatusLabel(course.status)}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <Link to={`/course/${course.id}`} className="block">
        <div className="p-6">
          {/* Catégorie */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
              {course.categoryName ?? "Sans catégorie"}
            </span>
          </div>

          {/* Titre */}
          <h3 className="font-bold text-lg text-textPrimary mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Statistiques */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {course.students.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{course.duration}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold text-textPrimary">
                {course.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Date et bouton discret */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                Créé le{" "}
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "--"}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-primary opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium">Voir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>

      {/* Badge popularité */}
      {course.students > 100 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
            <Award className="w-3 h-3" />
            <span>Populaire</span>
          </div>
        </div>
      )}
    </div>
  );

  const CourseCardList = ({ course }: { course: Course }) => (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      <Link to={`/course/${course.id}`} className="block">
        <div className="flex p-3  gap-6">
          {/* Image simplifiée */}
          <div className="relative w-48 h-34 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {course.coverImage ? (
              <>
                <img
                  src={getImageUrl(course.coverImage) || ""}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error(
                      "Erreur chargement image:",
                      course.coverImage
                    );
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                  style={{ display: "none" }}
                >
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Badge niveau simple */}
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  course.level === "DEBUTANT"
                    ? "bg-green-100 text-green-700"
                    : course.level === "INTERMEDIAIRE"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {courseService.getLevelLabel(course.level)}
              </span>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col justify-between min-h-[128px]">
            {/* Section haute: Catégorie + Titre + Description */}
            <div className="space-y-3">
              {/* Catégorie */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {course.categoryName || "Sans catégorie"}
                </span>
                {course.students > 100 && (
                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Populaire
                  </span>
                )}
              </div>

              {/* Titre */}
              <h3 className="font-semibold text-xl text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Section basse: Métadonnées */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {/* Statistiques à gauche */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()} étudiants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-gray-900 font-medium">
                    {course.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Statut à droite */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Voir le cours</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Oops! Une erreur est survenue
          </h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Hero Section avec recherche */}
      <section className="bg-gradient-to-r from-neutral via-white to-neutral py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-textPrimary mb-6">
              Explorez Nos <span className="text-primary">Formations</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Découvrez des cours conçus par des experts pour faire grandir vos
              compétences et accélérer votre carrière.
            </p>

            {/* Barre de recherche améliorée */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un cours, une compétence..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg shadow-sm"
              />
            </div>

            {/* Tags catégories rapides */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.slice(0, 5).map((category) => {
                const IconComponent = BookOpen;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-white"
                        : "bg-white text-gray-700 hover:bg-primary hover:text-white border border-gray-200"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-textPrimary flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtres</span>
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Filtres par catégorie avec icônes */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Catégorie
                </h3>
                <div className="space-y-2">
                  <label
                    key="all-categories"
                    className="flex items-center group cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === "all"}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="ml-3 flex items-center space-x-2 group-hover:text-primary transition-colors">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Toutes les catégories</span>
                    </div>
                  </label>
                  {categories.map((category) => {
                    const IconComponent = BookOpen;
                    return (
                      <label
                        key={category.id}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <div className="ml-3 flex items-center space-x-2 group-hover:text-primary transition-colors">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filtre par niveau */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Niveau
                </h3>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <label
                      key={level}
                      className="flex items-center group cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={selectedLevel === level}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-3 text-sm group-hover:text-primary transition-colors">
                        {level === "all"
                          ? "Tous les niveaux"
                          : courseService.getLevelLabel(level)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Header avec résultats et TOGGLE GRILLE/LISTE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center justify-between w-full ">
                <p className="text-gray-400  text-sm  ">
                  <span className="text-textPrimary font-bold">
                    {filteredCourses.length}
                  </span>{" "}
                  cours trouvé{filteredCourses.length > 1 ? "s" : ""}
                </p>

                {/* 🆕 BOUTONS DE BASCULEMENT VUE */}
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    title="Vue liste"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    title="Vue grille"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grille</span>
                  </button>
                </div>
              </div>

              {/* Filtres actifs */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Filtres actifs:
                  </span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 hover:text-primary/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="ml-1 hover:text-accent/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedLevel !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                      {courseService.getLevelLabel(selectedLevel)}
                      <button
                        onClick={() => setSelectedLevel("all")}
                        className="ml-1 hover:text-success/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 🆕 AFFICHAGE CONDITIONNEL SELON LE MODE VUE */}
            {filteredCourses.length > 0 ? (
              <>
                {/* Vue Grille */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <CourseCardGrid key={course.id} course={course} />
                    ))}
                  </div>
                )}

                {/* Vue Liste */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <CourseCardList key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-textPrimary mb-2">
                  Aucun cours trouvé
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Essayez de modifier vos critères de recherche ou explorez
                  toutes nos catégories.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors font-semibold"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal filtres mobile */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-textPrimary">
                Filtres
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto h-full pb-24">
              {/* Filtres mobiles identiques */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Catégorie
                </h3>
                <div className="space-y-3">
                  <label
                    key="all-categories-mobile"
                    className="flex items-center"
                  >
                    <input
                      type="radio"
                      name="category-mobile"
                      value="all"
                      checked={selectedCategory === "all"}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="ml-3 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Toutes les catégories</span>
                    </div>
                  </label>
                  {categories.map((category: Category) => {
                    const IconComponent = BookOpen;
                    return (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category-mobile"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <div className="ml-3 flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Niveau
                </h3>
                <div className="space-y-3">
                  {levels.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="level-mobile"
                        value={level}
                        checked={selectedLevel === level}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-3 text-sm">
                        {level === "all"
                          ? "Tous les niveaux"
                          : courseService.getLevelLabel(level)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Durée
                </h3>
                <div className="space-y-3">
                  {durations.map((duration) => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="radio"
                        name="duration-mobile"
                        value={duration}
                        checked={selectedDuration === duration}
                        onChange={(e) => setSelectedDuration(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-3 text-sm">
                        {duration === "all" ? "Toutes durées" : duration}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Effacer
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
