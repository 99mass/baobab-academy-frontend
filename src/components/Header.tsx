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

  // Fonction de déconnexion
  const handleLogout = () => {
    console.log('🔌 Déconnexion en cours...');
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-0 group">
            <img
              src="/logo.png"
              alt="Baobab Academy Logo"
              className="w-16 h-16"
            />
            <span className="text-xl font-bold text-primary">
              Baobab Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:text-primary"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>

            {/* Lien Cours simple (sans dropdown) */}
            <Link
              to="/courses"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/courses")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:text-primary"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Cours</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {userRole === "admin" && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isActive("/admin")
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    Admin
                  </Link>
                )}

                {/* Dropdown Profil */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-primary transition-colors">
                    <UserIcon className="w-4 h-4" />
                    <span>{user?.firstName?.charAt(0).toLocaleUpperCase()}{user?.lastName?.charAt(0).toLocaleUpperCase()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu Profil */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors space-x-2"
                    >
                      <UserIcon className="w-4 h-4 text-primary" />
                      <span>Mon Profil</span>
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors space-x-2"
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
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Connexion
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>

            {/* Lien Cours mobile simple */}
            <Link
              to="/courses"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive("/courses")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Cours
            </Link>

            {isAuthenticated ? (
              <>
                {userRole === "admin" && (
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      isActive("/admin")
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon Profil
                </Link>
                <Link
                  to="/my-courses"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Cours
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 bg-primary text-white rounded-lg text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}