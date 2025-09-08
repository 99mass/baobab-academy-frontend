import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User as UserIcon,
  BookOpen,
  Home,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { User as UserType } from "../types";

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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    console.log("🔌 Déconnexion en cours...");
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-0 group">
            <img src="/logo_fibem.png" alt="FIBEM Logo" className="w-26 h-12" />
          </Link>

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
              <span>Accueil</span>
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
              <span>Cours</span>
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
                      <span>Mon Profil</span>
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
                Connexion
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
              <span>Accueil</span>
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
                  <span>Mon Profil</span>
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
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
