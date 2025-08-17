
// utils/validation.ts
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50;
};