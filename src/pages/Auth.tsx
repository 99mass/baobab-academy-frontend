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
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login successful');
      
    } else {
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

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        }
        else if (error.response?.data?.fieldErrors) {
          setFieldErrors(error.response.data.fieldErrors);
        }
        else if (error.response?.status === 401) {
          setError("Email ou mot de passe incorrect");
        } else if (error.response?.status === 400) {
          setError("Données invalides. Veuillez vérifier vos informations.");
        }
        else if (
          error.code === "NETWORK_ERROR" ||
          error.message?.includes("Network Error")
        ) {
          setError(
            "Erreur de connexion. Veuillez vérifier votre connexion internet."
          );
        }
        else {
          setError(
            error.message || "Une erreur de communication s'est produite."
          );
        }
      }
      else if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

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
    const normalClasses = "border-gray-200 focus:border-[#0096F0]";

    return `${baseClasses} ${
      fieldErrors[fieldName] ? errorClasses : normalClasses
    }`;
  };

  const getPasswordInputClassName = (fieldName: string) => {
    const baseClasses =
      "w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white";
    const errorClasses = "border-red-300 focus:border-red-500";
    const normalClasses = "border-gray-200 focus:border-[#0096F0]";

    return `${baseClasses} ${
      fieldErrors[fieldName] ? errorClasses : normalClasses
    }`;
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="max-w-md w-full">
          <div className="mb-0">
            <Link to="/" className="inline-flex items-center group">
              <img
                src="/logo_fibem_no_bg.png"
                alt="FIBEM Logo"
                className="w-24 h-16"
              />
              <span className="text-xl font-bold text-[#CD010A] pl-2">
                 Plateforme d'apprentissage
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {isLogin ? "Bon retour !" : "Rejoignez-nous"}
            </h1>
            <p className="text-gray-600 text-sm">
              {isLogin
                ? "Connectez-vous pour continuer votre apprentissage"
                : "Créez votre compte et commencez à apprendre dès aujourd'hui"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex bg-gray-50 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={toggleMode}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? "border border-[#0096F0] text-[#0096F0] shadow-sm bg-white"
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
                  ? "border border-[#0096F0] text-[#0096F0] shadow-sm bg-white"
                  : "text-gray-500 hover:text-gray-700"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#0096F0] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#0080D6] transition-colors flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            {!isLogin && (
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                En créant un compte, vous acceptez nos{" "}
                <a
                  href="#"
                  className="text-[#0096F0] hover:text-[#0080D6] transition-colors font-medium"
                >
                  Conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a
                  href="#"
                  className="text-[#0096F0] hover:text-[#0080D6] transition-colors font-medium"
                >
                  Politique de confidentialité
                </a>
              </p>
            )}
          </form>

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

      <div className="hidden lg:flex lg:flex-1 bg-gray-50">
        <div className="flex flex-col justify-center items-center px-12 py-16 text-center">
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Étudiants apprenant ensemble"
              className="rounded-2xl shadow-lg w-full max-w-md"
            />
          </div>

          <div className="max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Développez vos compétences avec FIBEM
            </h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Rejoignez des milliers d'apprenants qui transforment leur carrière
              grâce à nos formations expertes et certifiantes.
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#0096F0]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-[#0096F0]" />
                </div>
                <p className="font-bold text-2xl text-gray-900">100+</p>
                <p className="text-sm text-gray-600">Cours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#DFB216]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#DFB216]" />
                </div>
                <p className="font-bold text-2xl text-gray-900">5K+</p>
                <p className="text-sm text-gray-600">Étudiants</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-bold text-2xl text-gray-900">95%</p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}