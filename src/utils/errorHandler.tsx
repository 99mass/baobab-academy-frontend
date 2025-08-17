// utils/errorHandler.ts
import type { AxiosError } from 'axios';

export interface ApiError {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  data?: Record<string, string>;
  timestamp: string;
}

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    if (responseData?.message) {
      return responseData.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    if (responseData?.data && typeof responseData.data === 'object') {
      return responseData.data;
    }
  }
  
  return {};
}

// Type guard pour vérifier si c'est une erreur Axios
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'request' in error &&
    'config' in error
  );
}

// Fonction utilitaire pour extraire le message d'erreur de manière sûre
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Une erreur inconnue s\'est produite';
}

// Fonction pour vérifier si une erreur est liée à l'authentification
export function isAuthError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

// Fonction pour vérifier si une erreur est liée à la validation
export function isValidationError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 400;
  }
  return false;
}