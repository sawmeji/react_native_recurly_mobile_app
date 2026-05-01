export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/,
} as const;

export interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
  global?: string;
}

type ClerkErrorItem = {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: {
    paramName?: string;
    name?: string;
    [key: string]: unknown;
  };
};

type ClerkLikeError = {
  errors?: ClerkErrorItem[];
  message?: string;
};

type SessionActivatableResource = {
  createdSessionId?: string | null;
  existingSession?: {
    sessionId?: string;
  };
  finalize?: () => Promise<{ error: ClerkLikeError | null }>;
};

type SetActiveFn = ((params: { session: string }) => Promise<unknown>) | null;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validateEmail = (email: string): string | null => {
  const value = normalizeEmail(email);

  if (!value) {
    return "Enter your email address";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Use a valid email address";
  }

  return null;
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (!password) {
    return ["Enter a password"];
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

export const validatePasswordMatch = (
  password: string,
  confirm: string,
): string | null => {
  if (!confirm.trim()) {
    return "Confirm your password";
  }

  if (password !== confirm) {
    return "Passwords do not match";
  }

  return null;
};

export const validateVerificationCode = (code: string): string | null => {
  const value = code.trim();

  if (!value) {
    return "Enter the 6-digit code";
  }

  if (!/^\d{6}$/.test(value)) {
    return "Use the 6-digit code from your email";
  }

  return null;
};

const getErrorItems = (error: unknown): ClerkErrorItem[] => {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as ClerkLikeError).errors)
  ) {
    return (error as ClerkLikeError).errors ?? [];
  }

  return [];
};

const getFieldFromParam = (paramName?: string): keyof AuthFormErrors | null => {
  switch (paramName) {
    case "email_address":
    case "identifier":
      return "email";
    case "password":
      return "password";
    case "code":
      return "code";
    default:
      return null;
  }
};

export const getClerkErrorMessage = (error: unknown): string => {
  const [firstError] = getErrorItems(error);
  const code = firstError?.code ?? "";
  const message =
    firstError?.longMessage ?? firstError?.message ?? (error as ClerkLikeError)?.message ?? "";

  switch (code) {
    case "form_identifier_exists":
      return "That email is already registered";
    case "form_identifier_not_found":
    case "form_password_incorrect":
      return "Email or password is incorrect";
    case "form_password_pwned":
      return "Choose a password that is less common";
    case "form_password_too_short":
      return "Your password is too short";
    case "form_code_incorrect":
      return "That code doesn't look right";
    case "form_code_expired":
      return "That code has expired. Request a new one to continue";
    case "rate_limit_exceeded":
      return "Too many attempts. Please wait a moment and try again";
    case "session_exists":
      return "You're already signed in on this device";
    default:
      break;
  }

  if (message) {
    return message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message || "");
  }

  return "Something went wrong. Please try again";
};

export const mapClerkFieldErrors = (
  error: unknown,
): Partial<AuthFormErrors> => {
  const fieldErrors: Partial<AuthFormErrors> = {};

  getErrorItems(error).forEach((item) => {
    const paramField = getFieldFromParam(item.meta?.paramName);
    const friendlyMessage = getClerkErrorMessage({ errors: [item] });

    if (paramField) {
      fieldErrors[paramField] = friendlyMessage;
      return;
    }

    if (item.code?.includes("identifier") || item.code?.includes("email")) {
      fieldErrors.email = friendlyMessage;
      return;
    }

    if (item.code?.includes("password")) {
      fieldErrors.password = friendlyMessage;
      return;
    }

    if (item.code?.includes("code")) {
      fieldErrors.code = friendlyMessage;
    }
  });

  return fieldErrors;
};

export const toAuthErrors = (
  error: unknown,
  fallbackField?: keyof AuthFormErrors,
): AuthFormErrors => {
  const fieldErrors = mapClerkFieldErrors(error);
  const globalMessage = getClerkErrorMessage(error);

  if (
    fallbackField &&
    !fieldErrors[fallbackField] &&
    fallbackField !== "global"
  ) {
    fieldErrors[fallbackField] = globalMessage;
  }

  return {
    ...fieldErrors,
    global: fieldErrors.email || fieldErrors.password || fieldErrors.code
      ? undefined
      : globalMessage,
  };
};

export const getPasswordRequirements = (password = "") => ({
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
    label: "One special character",
    met: PASSWORD_REQUIREMENTS.hasSpecial.test(password),
  },
});

export const isPasswordValid = (password: string): boolean => {
  return Object.values(getPasswordRequirements(password)).every(
    (requirement) => requirement.met,
  );
};

export const isVerificationPending = (signUp: {
  status?: string | null;
  unverifiedFields?: string[];
} | null) => {
  if (!signUp) {
    return false;
  }

  return (
    signUp.status === "missing_requirements" &&
    Array.isArray(signUp.unverifiedFields) &&
    signUp.unverifiedFields.includes("email_address")
  );
};

export const requiresEmailSecondFactor = (signIn: {
  status?: string | null;
} | null) =>
  signIn?.status === "needs_client_trust" ||
  signIn?.status === "needs_second_factor";

export const hasEmailSecondFactor = (signIn: {
  supportedSecondFactors?: Array<{ strategy?: string }> | null;
  mfa?: {
    sendEmailCode?: () => Promise<{ error: ClerkLikeError | null }>;
  };
} | null) =>
  Boolean(
    signIn?.mfa?.sendEmailCode ||
      signIn?.supportedSecondFactors?.some(
        (factor) => factor?.strategy === "email_code",
      ),
  );

export const startSignUp = async (
  signUp: any,
  params: { emailAddress: string; password: string },
) => {
  if (typeof signUp?.password === "function") {
    return signUp.password(params);
  }

  return signUp?.create?.(params);
};

export const sendSignUpEmailCode = async (signUp: any) => {
  if (typeof signUp?.verifications?.sendEmailCode === "function") {
    return signUp.verifications.sendEmailCode();
  }

  return signUp?.prepareEmailAddressVerification?.({
    strategy: "email_code",
  });
};

export const verifySignUpEmailCode = async (signUp: any, code: string) => {
  if (typeof signUp?.verifications?.verifyEmailCode === "function") {
    return signUp.verifications.verifyEmailCode({ code });
  }

  return signUp?.attemptEmailAddressVerification?.({ code });
};

export const startSignIn = async (
  signIn: any,
  params: { emailAddress: string; password: string },
) => {
  if (typeof signIn?.password === "function") {
    return signIn.password(params);
  }

  return signIn?.create?.({
    identifier: params.emailAddress,
    password: params.password,
  });
};

export const sendSignInEmailCode = async (signIn: any) => {
  if (typeof signIn?.mfa?.sendEmailCode === "function") {
    return signIn.mfa.sendEmailCode();
  }

  return signIn?.prepareSecondFactor?.({
    strategy: "email_code",
  });
};

export const verifySignInEmailCode = async (signIn: any, code: string) => {
  if (typeof signIn?.mfa?.verifyEmailCode === "function") {
    return signIn.mfa.verifyEmailCode({ code });
  }

  return signIn?.attemptSecondFactor?.({
    strategy: "email_code",
    code,
  });
};

export const resetAuthAttempt = async (resource: {
  reset?: () => Promise<unknown>;
} | null) => {
  if (typeof resource?.reset === "function") {
    await resource.reset();
  }
};

export const activatePendingSession = async (
  resource: SessionActivatableResource | null,
  setActive: SetActiveFn,
) => {
  if (!resource || !setActive) {
    throw new Error("We couldn't finish signing you in");
  }

  let sessionId =
    resource.createdSessionId ?? resource.existingSession?.sessionId ?? null;

  if (!sessionId && typeof resource.finalize === "function") {
    const result = await resource.finalize();
    if (result?.error) {
      throw result.error;
    }

    sessionId =
      resource.createdSessionId ?? resource.existingSession?.sessionId ?? null;
  }

  if (!sessionId) {
    throw new Error("We couldn't finish signing you in. Please try again");
  }

  await setActive({ session: sessionId });
};

export const getUserLabel = (user: {
  firstName?: string | null;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
} | null) => {
  const fallback =
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "there";

  return user?.firstName || user?.fullName || user?.username || fallback;
};
