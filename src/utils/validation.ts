const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

export interface PasswordCheck {
  isValid: boolean;
  errors: string[];
}

export const checkPassword = (value: string): PasswordCheck => {
  const errors: string[] = [];
  if (value.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Za-z]/.test(value)) {
    errors.push('At least one letter');
  }
  if (!/\d/.test(value)) {
    errors.push('At least one number');
  }
  return {isValid: errors.length === 0, errors};
};
