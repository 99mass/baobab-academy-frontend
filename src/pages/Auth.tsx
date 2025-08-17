// pages/Auth.tsx
import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login, register, user, isAuthenticated  } = useAuth();
  const navigate = useNavigate();

   useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Utilisateur authentifié détecté:', user);
      console.log('Rôle de l\'utilisateur:', user.role);
      
      // Redirection selon le rôle
      if (user.role === 'ADMIN') {
        console.log('Redirection vers /admin');
        navigate('/admin');
      } else {
        console.log('Redirection vers /courses');
        navigate('/profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

   try {
    if (isLogin) {
      // Connexion
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login successful');
      
    } else {
      // Inscription
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      console.log('Registration successful');
      
    }
    } catch (error) {
      console.error("Erreur d'authentification:", error);

      // ORDRE CORRIGÉ : vérifier d'abord les erreurs Axios spécifiques
      if (error instanceof AxiosError) {
        // 1. Erreur du serveur avec message spécifique
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        }
        // 2. Erreurs de validation de champs
        else if (error.response?.data?.fieldErrors) {
          setFieldErrors(error.response.data.fieldErrors);
        }
        // 3. Erreurs HTTP spécifiques par code de statut
        else if (error.response?.status === 401) {
          setError("Email ou mot de passe incorrect");
        } else if (error.response?.status === 400) {
          setError("Données invalides. Veuillez vérifier vos informations.");
        }
        // 4. Erreur de réseau
        else if (
          error.code === "NETWORK_ERROR" ||
          error.message?.includes("Network Error")
        ) {
          setError(
            "Erreur de connexion. Veuillez vérifier votre connexion internet."
          );
        }
        // 5. Autres erreurs Axios
        else {
          setError(
            error.message || "Une erreur de communication s'est produite."
          );
        }
      }
      // 6. Erreurs génériques (non-Axios)
      else if (error instanceof Error) {
        setError(error.message);
      }
      // 7. Erreur inconnue
      else {
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    } finally {
      // IMPORTANT: Toujours réinitialiser isSubmitting
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Effacer l'erreur globale aussi
    if (error) {
      setError("");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFieldErrors({});
    setIsSubmitting(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const getInputClassName = (fieldName: string) => {
    const baseClasses =
      "w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white";
    const errorClasses = "border-red-300 focus:border-red-500";
    const normalClasses = "border-gray-200 focus:border-primary";

    return `${baseClasses} ${
      fieldErrors[fieldName] ? errorClasses : normalClasses
    }`;
  };

  const getPasswordInputClassName = (fieldName: string) => {
    const baseClasses =
      "w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white";
    const errorClasses = "border-red-300 focus:border-red-500";
    const normalClasses = "border-gray-200 focus:border-primary";

    return `${baseClasses} ${
      fieldErrors[fieldName] ? errorClasses : normalClasses
    }`;
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-0">
            <Link to="/" className="inline-flex items-center group">
              <img
                src="/logo.png"
                alt="Baobab Academy Logo"
                className="w-24 h-24"
              />
              <span className="text-2xl font-bold text-primary">
                Baobab Academy
              </span>
            </Link>
          </div>

          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-textPrimary mb-2">
              {isLogin ? "Bon retour !" : "Rejoignez-nous"}
            </h1>
            <p className="text-gray-600 text-sm">
              {isLogin
                ? "Connectez-vous pour continuer votre apprentissage"
                : "Créez votre compte et commencez à apprendre dès aujourd'hui"}
            </p>
          </div>

          {/* Affichage des erreurs globales */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Toggle moderne */}
          <div className="flex bg-neutral rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={toggleMode}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? "border border-primary text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={toggleMode}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? "border border-primary text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champs nom/prénom pour l'inscription */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={getInputClassName("firstName")}
                      placeholder="Votre prénom"
                      required={!isLogin}
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={getInputClassName("lastName")}
                      placeholder="Votre nom"
                      required={!isLogin}
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={getInputClassName("email")}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={getPasswordInputClassName("password")}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe pour l'inscription */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={getPasswordInputClassName("confirmPassword")}
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Options pour la connexion */}
            {isLogin && (
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isLogin ? "Connexion..." : "Inscription..."}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Se connecter" : "Créer mon compte"}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Conditions d'utilisation pour l'inscription */}
            {!isLogin && (
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                En créant un compte, vous acceptez nos{" "}
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Politique de confidentialité
                </a>
              </p>
            )}
          </form>

          {/* Retour à l'accueil */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Section droite - Image/Contenu visuel */}
      <div className="hidden lg:flex lg:flex-1 bg-neutral">
        <div className="flex flex-col justify-center items-center px-12 py-16 text-center">
          {/* Image principale */}
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Étudiants apprenant ensemble"
              className="rounded-2xl shadow-lg w-full max-w-md"
            />
          </div>

          {/* Contenu motivationnel */}
          <div className="max-w-md">
            <h2 className="text-xl font-bold text-textPrimary mb-4">
              Développez vos compétences avec Baobab Academy
            </h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Rejoignez des milliers d'apprenants qui transforment leur carrière
              grâce à nos formations expertes et certifiantes.
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-2xl text-textPrimary">100+</p>
                <p className="text-sm text-gray-600">Cours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <p className="font-bold text-2xl text-textPrimary">5K+</p>
                <p className="text-sm text-gray-600">Étudiants</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <p className="font-bold text-2xl text-textPrimary">95%</p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
