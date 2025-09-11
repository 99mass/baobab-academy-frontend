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
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../utils/translations";
import type { Course } from "../types/course";
import "../css/animation.css";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const { t } = useTranslation(lang);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const courseResponse = await courseService.getPublishedCourses();
        if (courseResponse.success && courseResponse.data) {
          const popularCourses = courseResponse.data.content
            .sort((a, b) => b.students - a.students)
            .slice(0, 3);
          setCourses(popularCourses);
        }

        const categoryResponse = await courseService.getCategories();
        if (categoryResponse.success && categoryResponse.data) {
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
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
            <div className="order-2 lg:order-1 animate-fade-in-up">
              <div className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-in">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                {t('welcome')}
              </div>

              <h1 className=" text-xl lg:text-5xl font-bold text-[#CD010A] leading-tight animate-slide-in-left mb-6">
               {t('heroTitle')}
                <span className="text-transparent pl-3 bg-gradient-to-r from-[#0096F0] to-[#CD010A] bg-clip-text  animate-text-gradient">
                  FIBEM
                </span>
              </h1>

              <p className="text-md text-gray-600 mb-8 leading-relaxed animate-fade-in opacity-0 animation-delay-200">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in opacity-0 animation-delay-400">
                <Link
                  to="/courses"
                  className="bg-[#0096F0] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0080D6] transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <span>{t('exploreCourses')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    className="border-2 border-[#0096F0] text-[#0096F0] px-8 py-4 rounded-lg font-semibold hover:bg-[#0096F0] hover:text-white transition-all duration-300 hover:scale-105 text-center"
                  >
                    {t('createAccount')}
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 animate-fade-in opacity-0 animation-delay-600">
                <div className="flex items-center space-x-2 hover:text-[#0096F0] transition-colors cursor-pointer group">
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>5000+ {t('students')}</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-[#0096F0] transition-colors cursor-pointer group">
                  <Star className="w-4 h-4 text-[#DFB216] fill-current group-hover:scale-110 transition-transform" />
                  <span>4.8/5 {t('average')}</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-[#0096F0] transition-colors cursor-pointer group">
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>100+ {t('courses')}</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 animate-slide-in-right">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                  alt={lang === 'fr' ? "Étudiants apprenant ensemble" : "Students learning together"}
                  className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600 animate-bounce-slow" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-blue-500">95% {t('successRate')}</p>
                      <p className="text-xs text-gray-500">{t('successRateLabel')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section de recherche */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-[#CD010A] mb-8">
            {t('whatLearnToday')}
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((_, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-gray-200 animate-pulse rounded-full text-sm font-medium h-8 w-24"
                />
              ))
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/courses?category=${category.id}`}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-[#0096F0] hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg animate-fade-in opacity-0"
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

      {/* Cours populaires */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-[#CD010A] mb-4">
              {t('popularCourses')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('popularCoursesDescription')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0096F0]" />
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
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-medium group-hover:bg-[#DFB216] group-hover:text-white transition-colors">
                          {course.categoryName || ""}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-[#DFB216] fill-current group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-gray-600">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-blue-900 mb-2 group-hover:text-[#0096F0] transition-colors">
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
                          <span>{course.students.toLocaleString()} {t('students')}</span>
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
              className="inline-flex items-center space-x-2 bg-[#0096F0] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0080D6] transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <span>{t('seeAllCourses')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-[#CD010A] mb-4">
              {t('successStories')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('successStoriesDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up opacity-0 animation-delay-200">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcjzdDTlCtEXZhKsQz_E9wzaz1AYI9yc5Xjg&s"
                  alt="Aminata Diop"
                  className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-gray-900">Aminata Diop</p>
                  <p className="text-sm text-gray-600">{t('webDeveloper')}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "{t('testimonial1')}"
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#DFB216] fill-current hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up opacity-0 animation-delay-400">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_ldG6I0PTeCLk8MouYxXfe994hLAFHa_pPA&s"
                  alt="Mamadou Sall"
                  className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-gray-900">Mamadou Sall</p>
                  <p className="text-sm text-gray-600">{t('uxDesigner')}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "{t('testimonial2')}"
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#DFB216] fill-current hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up opacity-0 animation-delay-600">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://plus.unsplash.com/premium_photo-1661589836910-b3b0bf644bd5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc2lvbmFsJTIwYmxhY2slMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Fatou Ndiaye"
                  className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-gray-900">Fatou Ndiaye</p>
                  <p className="text-sm text-gray-600">{t('dataAnalyst')}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "{t('testimonial3')}"
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#DFB216] fill-current hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 text-[#CD010A] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h2 className="text-xl lg:text-4xl font-bold mb-6 text-[#CD010A]">
            {t('finalCta')}
          </h2>
          <p className="text-md mb-8 text-gray-700">
            {t('finalCtaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="bg-[#DFB216] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#C9A015] transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center justify-center space-x-2 group"
              >
                <span>{t('createFreeAccount')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/profile"
                className="bg-[#DFB216] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#C9A015] transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center justify-center space-x-2 group"
              >
                <span>{t('accessDashboard')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              to="/courses"
              className="border border-[#0096F0] text-[#0096F0] px-8 py-4 rounded-lg font-semibold hover:bg-[#0096F0] hover:text-white transition-all duration-300 hover:scale-105 text-center"
            >
              {t('discoverTraining')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
