import type { PasswordStrength } from '../../types/auth';

/**
 * Validate username:
 * - 3 to 20 characters
 * - Only letters, numbers, underscores, and hyphens
 * - Cannot start or end with hyphen or underscore
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Username is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters.' };
  }
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username cannot exceed 20 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens.' };
  }
  if (/^[_-]|[_-]$/.test(trimmed)) {
    return { isValid: false, error: 'Username cannot start or end with an underscore or hyphen.' };
  }
  return { isValid: true };
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  // Standard robust email pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

/**
 * Validate display name
 */
export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full or display name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters.' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Display name cannot exceed 50 characters.' };
  }
  return { isValid: true };
}

/**
 * Calculate password strength with criteria breakdown
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let passedCount = 0;
  if (minLength) passedCount++;
  if (hasUppercase) passedCount++;
  if (hasLowercase) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSpecial) passedCount++;

  let score = 0;
  let label: PasswordStrength['label'] = 'Very Weak';
  let color = '#EF4444'; // Red

  if (!password) {
    score = 0;
    label = 'Very Weak';
    color = '#94A3B8';
  } else if (password.length < 8) {
    score = 1;
    label = 'Weak';
    color = '#EF4444';
  } else if (passedCount <= 2) {
    score = 1;
    label = 'Weak';
    color = '#F97316'; // Orange
  } else if (passedCount === 3) {
    score = 2;
    label = 'Medium';
    color = '#F59E0B'; // Amber
  } else if (passedCount === 4) {
    score = 3;
    label = 'Strong';
    color = '#10B981'; // Emerald
  } else {
    score = 4;
    label = 'Very Strong';
    color = '#0077C8'; // Physora Blue
  }

  return {
    score,
    label,
    color,
    requirements: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial
    }
  };
}
