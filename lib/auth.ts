/**
 * Authentication utilities for form validation, error handling, and session management
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()-_=+[\]{};':"\\|,.<>?/`~]/,
} as const;

/**
 * Validates email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "Email is required";
  }
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

/**
 * Validates password and returns array of unmet requirements
 */
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (!password) {
    return ["Password is required"];
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
    errors.push("One uppercase letter");
  }
  if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
    errors.push("One lowercase letter");
  }
  if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
    errors.push("One number");
  }
  if (!PASSWORD_REQUIREMENTS.hasSpecial.test(password)) {
    errors.push("One special character");
  }

  return errors;
};

/**
 * Validates that passwords match
 */
export const validatePasswordMatch = (
  password: string,
  confirm: string,
): string | null => {
  if (password !== confirm) {
    return "Passwords do not match";
  }
  return null;
};

/**
 * Maps Clerk error responses to user-friendly messages
 */
export const getClerkErrorMessage = (error: any): string => {
  if (!error) return "An error occurred. Please try again.";

  // Handle Clerk error format with errors array
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const firstError = error.errors[0];
    const code = firstError.code || "";
    const message = firstError.message || "";

    // Map specific Clerk error codes
    if (code === "form_identifier_exists") {
      return "This email is already in use";
    }
    if (code === "form_password_pwned") {
      return "This password is too common. Please choose a stronger password.";
    }
    if (code === "form_password_too_short") {
      return "Password is too short";
    }
    if (code === "form_identifier_not_found") {
      return "Email or password is incorrect";
    }
    if (code === "form_code_incorrect") {
      return "Verification code is incorrect";
    }
    if (code === "form_code_expired") {
      return "Verification code expired. Please request a new one.";
    }
    if (code === "session_exists") {
      return "You are already signed in";
    }
    if (code === "rate_limit_exceeded") {
      return "Too many attempts. Please try again later.";
    }

    // Return custom message if available
    if (message) {
      return message;
    }
  }

  // Handle string error messages
  if (typeof error === "string") {
    return error;
  }

  // Fallback
  return error.message || "An error occurred. Please try again.";
};

/**
 * Maps field-level errors from Clerk to a structured object
 */
export const mapFieldErrors = (clerkErrors: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (!clerkErrors || !clerkErrors.errors) {
    return fieldErrors;
  }

  const errors = Array.isArray(clerkErrors.errors)
    ? clerkErrors.errors
    : [clerkErrors.errors];

  errors.forEach((error: any) => {
    const code = error.code || "";
    const message = error.message || "";

    // Map error codes to field names
    if (code.includes("identifier") || code.includes("email")) {
      fieldErrors.email = message || "Invalid email";
    } else if (code.includes("password")) {
      fieldErrors.password = message || "Invalid password";
    } else if (code.includes("code")) {
      fieldErrors.code = message || "Invalid verification code";
    }
  });

  return fieldErrors;
};

/**
 * Handles session tasks (e.g., MFA, profile completion)
 * Returns true if a task was handled, false otherwise
 */
export const handleSessionTasks = (session: any): boolean => {
  if (!session || !session.currentTask) {
    return false;
  }

  // Log the task for debugging
  console.log("Session task:", session.currentTask);

  // TODO: Implement specific task handlers as needed
  // For now, we just acknowledge that a task exists

  return true;
};

/**
 * Formats password requirements for display
 */
export const getPasswordRequirements = (password: string = "") => {
  return {
    minLength: {
      label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`,
      met: password.length >= PASSWORD_REQUIREMENTS.minLength,
    },
    uppercase: {
      label: "One uppercase letter (A-Z)",
      met: PASSWORD_REQUIREMENTS.hasUppercase.test(password),
    },
    lowercase: {
      label: "One lowercase letter (a-z)",
      met: PASSWORD_REQUIREMENTS.hasLowercase.test(password),
    },
    number: {
      label: "One number (0-9)",
      met: PASSWORD_REQUIREMENTS.hasNumber.test(password),
    },
    special: {
      label: "One special character (!@#$%...)",
      met: PASSWORD_REQUIREMENTS.hasSpecial.test(password),
    },
  };
};

/**
 * Checks if all password requirements are met
 */
export const isPasswordValid = (password: string): boolean => {
  const requirements = getPasswordRequirements(password);
  return Object.values(requirements).every((req) => req.met);
};
