// hooks/useAuth.tsx
import { useState, useEffect, useContext, createContext } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import { handleApiError, getFieldErrors } from "../utils/errorHandler";
import type {
  UserResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Créer le contexte avec une valeur par défaut explicite
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated: boolean = !!user;

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          await authService.verifyToken();
          const userData = JSON.parse(savedUser) as UserResponse;
          setUser(userData);
        } catch (error) {
          console.error("Token invalide:", handleApiError(error));
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Dans votre fonction login
  const login = async (data: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);

      if (response.success && response.data) {
        const { token, user: userData } = response.data;

        console.log("🔍 Token reçu:", token);
        console.log("🔍 User data reçue:", userData);
        console.log("🔍 Rôle de l'utilisateur:", userData.role);
        console.log("🔍 Type du rôle:", typeof userData.role);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);

        console.log("🔍 User state après setUser:", userData);
      } else {
        throw new Error(response.message || "Erreur de connexion");
      }
    } catch (error) {
      console.error("❌ Erreur dans login:", error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);

      if (response.success && response.data) {
        const { token, user: userData } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
      } else {
        throw new Error(response.message || "Erreur d'inscription");
      }
    } catch (error) {
      // Pour les erreurs de validation, on peut vouloir les traiter différemment
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        // Créer un objet d'erreur personnalisé avec les erreurs de champs
        const customError = new Error(handleApiError(error));
        // Ajouter les erreurs de champs à l'erreur
        (
          customError as Error & { fieldErrors?: Record<string, string> }
        ).fieldErrors = fieldErrors;
        throw customError;
      }

      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    authService.logout().catch((error) => {
      console.error("Erreur lors de la déconnexion:", handleApiError(error));
    });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error(
        "Erreur lors du rafraîchissement de l'utilisateur:",
        handleApiError(error)
      );
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
