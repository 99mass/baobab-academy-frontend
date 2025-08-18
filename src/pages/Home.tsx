/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Star,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../hooks/useAuth";
import type { Course } from "../types/course";
import "../css/animation.css";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les cours publiés
        const courseResponse = await courseService.getPublishedCourses();
        if (courseResponse.success && courseResponse.data) {
          // Prendre les 3 cours les plus populaires (plus d'étudiants)
          const popularCourses = courseResponse.data.content
            .sort((a, b) => b.students - a.students)
            .slice(0, 3);
          setCourses(popularCourses);
        }

        // Récupérer les catégories
        const categoryResponse = await courseService.getCategories();
        if (categoryResponse.success && categoryResponse.data) {
          // Utiliser toutes les catégories disponibles
          setCategories(categoryResponse.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour obtenir l'URL de l'image
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section avec Image */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
            {/* Contenu texte */}
            <div className="order-2 lg:order-1 animate-fade-in-up">
              <div className="inline-flex items-center bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-in">
                <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
                Bienvenue sur Baobab Academy
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-textPrimary mb-6 leading-tight animate-slide-in-left">
                Cultivez votre savoir avec
                <span className="text-primary block animate-text-gradient">
                  Baobab Academy
                </span>
              </h1>

              <p className="text-md text-gray-600 mb-8 leading-relaxed animate-fade-in opacity-0 animation-delay-200">
                Développez vos compétences professionnelles grâce à nos
                formations en ligne, conçues par des experts et adaptées à vos
                besoins.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in opacity-0 animation-delay-400">
                <Link
                  to="/courses"
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <span>Explorer nos cours</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Bouton Créer un compte - masqué si connecté */}
                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 text-center"
                  >
                    Créer un compte gratuit
                  </Link>
                )}
              </div>

              {/* Petites stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 animate-fade-in opacity-0 animation-delay-600">
                <div className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer group">
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>5000+ étudiants</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer group">
                  <Star className="w-4 h-4 text-accent fill-current group-hover:scale-110 transition-transform" />
                  <span>4.8/5 moyenne</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer group">
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>100+ cours</span>
                </div>
              </div>
            </div>

            {/* Image Hero */}
            <div className="order-1 lg:order-2 animate-slide-in-right">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                  alt="Étudiants apprenant ensemble"
                  className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
                />
                {/* Petites cartes flottantes */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-success animate-bounce-slow" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">95% de réussite</p>
                      <p className="text-xs text-gray-500">
                        Taux de réussite
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section de recherche */}
      <section className="py-16 bg-neutral">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-textPrimary mb-8">
            Que souhaitez-vous apprendre aujourd'hui ?
          </h2>

          {/* Tags populaires avec toutes les catégories de l'API */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {loading ? (
              // Tags de chargement (nombre variable selon l'API)
              [1, 2, 3, 4, 5, 6].map((_, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-gray-200 animate-pulse rounded-full text-sm font-medium h-8 w-24"
                />
              ))
            ) : categories.length > 0 ? (
              // Toutes les catégories de l'API
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/courses?category=${category.id}`}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      </section>

      {/* Cours populaires avec vraies données */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-textPrimary mb-4">
              Cours les plus populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rejoignez des milliers d'étudiants qui font confiance à nos
              formations certifiantes.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {courses.map((course, index) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group animate-slide-in-up opacity-0 hover:scale-105"
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  <div>
                    <div className="overflow-hidden">
                      <img
                        src={
                          getImageUrl(course.coverImage) ||
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                        }
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium group-hover:bg-accent group-hover:text-white transition-colors">
                          {course.categoryName || "Design"}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-accent fill-current group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-gray-600">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-textPrimary mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{course.students.toLocaleString()} élèves</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center animate-fade-in-up">
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <span>Voir tous les cours</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-20 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-textPrimary mb-4">
              Ils ont réussi avec Baobab Academy
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez les témoignages de nos diplômés qui ont transformé leur
              carrière.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up opacity-0 animation-delay-200">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcjzdDTlCtEXZhKsQz_E9wzaz1AYI9yc5Xjg&s"
                  alt="Aminata Diop"
                  className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-textPrimary">Aminata Diop</p>
                  <p className="text-sm text-gray-600">Développeuse Web</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Grâce à Baobab Academy, j'ai pu me reconvertir dans le
                développement web. Les cours sont bien structurés et les mentors
                très disponibles."
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-accent fill-current hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up opacity-0 animation-delay-400">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_ldG6I0PTeCLk8MouYxXfe994hLAFHa_pPA&s"
                  alt="Mamadou Sall"
                  className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-textPrimary">Mamadou Sall</p>
                  <p className="text-sm text-gray-600">UX Designer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Une expérience formidable ! J'ai acquis toutes les compétences
                nécessaires pour devenir UX Designer et j'ai trouvé un emploi 2
                mois après ma certification."
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-accent fill-current hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up opacity-0 animation-delay-600">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://plus.unsplash.com/premium_photo-1661589836910-b3b0bf644bd5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc2lvbmFsJTIwYmxhY2slMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Fatou Ndiaye"
                  className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-textPrimary">Fatou Ndiaye</p>
                  <p className="text-sm text-gray-600">Data Analyst</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Les projets pratiques m'ont permis de constituer un portfolio
                solide. Aujourd'hui, je travaille comme Data Analyst dans une
                entreprise internationale."
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-accent fill-current hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 text-primary bg-neutral">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h2 className="text-xl lg:text-4xl font-bold mb-6">
            Commencez votre transformation professionnelle dès aujourd'hui
          </h2>
          <p className="text-md mb-8 text-black/70">
            Rejoignez notre communauté d'apprenants et développez les
            compétences qui feront la différence dans votre carrière.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Bouton CTA - masqué si connecté */}
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="bg-accent text-white/90 px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center justify-center space-x-2 group"
              >
                <span>Créer mon compte gratuit</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/profile"
                className="bg-accent text-white/90 px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center justify-center space-x-2 group"
              >
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              to="/courses"
              className="border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 text-center"
            >
              Découvrir nos formations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
