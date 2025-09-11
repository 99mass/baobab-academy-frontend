/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User as UserIcon,
  BookOpen,
  Home,
  ChevronDown,
  LogOut,
  Search,
  Globe,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { User as UserType } from "../types";
import { courseService } from "../services/courseService";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../utils/translations";

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: "student" | "admin";
  user?: UserType;
}

export default function Header({
  isAuthenticated = false,
  userRole = "student",
  user,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation(lang);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    console.log("🔌 Déconnexion en cours...");
    logout();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await courseService.getCategories();
        if (categoryResponse.success && categoryResponse.data) {
          setCategories(categoryResponse.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !(searchRef.current as any).contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestedCategories(filtered);
    } else {
      setSuggestedCategories([]);
    }
  };

  const handleSuggestionClick = (categoryId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSuggestedCategories([]);
    navigate(`/courses?category=${categoryId}`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 ">
      <div className="max-w-full  mx-6 sm:px-2">
        <div className="flex justify-between items-center h-24">
          {/* Logo avec description */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/logo_fibem.png" alt="FIBEM Logo" className="w-26 h-12" />
            {/* <div className="hidden sm:block">
              <span className="text-md font-bold text-[#CD010A]">
                Plateforme d'apprentissage
              </span>
            </div> */}
             <div className="hidden sm:block  bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium  animate-bounce-in">
                 {t('platformDescription')}
              </div>
          </Link>

          {/* Language Switcher and Search */}
          <div className="flex items-center justify-end flex-1 mx-4">
            {/* Language Switcher */}
            <div className="relative group mr-0">
              <button className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200 font-medium">
                <img
                  src={
                    lang === "fr"
                      ? "https://flagcdn.com/fr.svg"
                      : "https://flagcdn.com/gb.svg"
                  }
                  alt="Language"
                  className="w-5 h-auto rounded-sm"
                />
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => {
                    setLang("fr");
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors space-x-3 font-medium"
                >
                  <img
                    src="https://flagcdn.com/fr.svg"
                    alt="Français"
                    className="w-5 h-auto rounded-sm"
                  />
                  <span>Français</span>
                </button>
                <button
                  onClick={() => {
                    setLang("en");
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors space-x-3 font-medium"
                >
                  <img
                    src="https://flagcdn.com/gb.svg"
                    alt="English"
                    className="w-5 h-auto rounded-sm"
                  />
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Recherche par catégorie */}
            <div ref={searchRef} className="relative">
              <div
                className={`transition-all duration-300 ${
                  isSearchOpen ? "w-64" : "w-12"
                }`}
              >
                {isSearchOpen ? (
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-blue-500 rounded-full focus:outline-none text-sm"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus
                    />
                    {suggestedCategories.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        {suggestedCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleSuggestionClick(category.id)}
                            className="w-full text-left block px-4 py-3 text-gray-700 hover:bg-gray-50"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-3 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('home')}</span>
            </Link>

            <Link
              to="/courses"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                isActive("/courses")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('catalogCourses')}</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4">
                {userRole === "admin" && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                      isActive("/admin")
                        ? "bg-amber-50 text-amber-700 shadow-sm"
                        : "text-gray-600 hover:text-amber-600 hover:bg-gray-50"
                    }`}
                  >
                    Admin
                  </Link>
                )}

                {/* Dropdown Profil */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200 font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0).toLocaleUpperCase()}
                      {user?.lastName?.charAt(0).toLocaleUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu Profil */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors space-x-3 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>{t('profile')}</span>
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors space-x-3 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md ml-4"
              >
                {t('login')}
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link
              to="/"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>{t('home')}</span>
            </Link>

            <Link
              to="/courses"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive("/courses")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="w-5 h-5" />
              <span>Cours</span>
            </Link>

            {/* Language Switcher Mobile */}
            <div className="relative group pt-2">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-600">Langue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setLang("fr");
                      setIsMenuOpen(false);
                    }}
                    className={`p-1 rounded-full ${
                      lang === "fr" ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src="https://flagcdn.com/fr.svg"
                      alt="Français"
                      className="w-8 h-auto rounded-full"
                    />
                  </button>
                  <button
                    onClick={() => {
                      setLang("en");
                      setIsMenuOpen(false);
                    }}
                    className={`p-1 rounded-full ${
                      lang === "en" ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src="https://flagcdn.com/gb.svg"
                      alt="English"
                      className="w-8 h-auto rounded-full"
                    />
                  </button>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                {userRole === "admin" && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActive("/admin")
                        ? "bg-amber-50 text-amber-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-amber-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>{t('profile')}</span>
                </Link>

                <Link
                  to="/my-courses"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Mes Cours</span>
                </Link>

                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/auth"
                  className="block px-4 py-3 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
