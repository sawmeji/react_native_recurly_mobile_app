import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import {
  getClerkErrorMessage,
  getPasswordRequirements,
  isPasswordValid,
  mapFieldErrors,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/auth";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
  global?: string;
}

/**
 * Production-grade sign-up screen with email/password authentication
 * - Email validation
 * - Password strength requirements with live feedback
 * - Password confirmation
 * - Email verification code flow
 * - Error handling
 */
export default function SignUpScreen() {
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const { setActive: setClerkActive } = useClerk();
  const { isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const isLoaded = isSignUpLoaded && isAuthLoaded;

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState("");

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);

  // Validation state
  const emailError = errors.email || "";
  const passwordError = errors.password || "";
  const confirmPasswordError = errors.confirmPassword || "";
  const codeError = errors.code || "";
  const globalError = errors.global || "";

  // Password requirements
  const passwordReqs = getPasswordRequirements(password);
  const isPasswordValid_ = isPasswordValid(password);
  const isFormValid =
    email.trim() &&
    password &&
    confirmPassword &&
    isPasswordValid_ &&
    !passwordError &&
    !confirmPasswordError &&
    !emailError &&
    validatePasswordMatch(password, confirmPassword) === null;
  const isCodeFormValid = code.trim() && !codeError;

  /**
   * Clear field error when user starts typing
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/[^0-9]/g, "").slice(0, 6));
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: "" }));
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailValidation = validateEmail(email);
    if (emailValidation) {
      newErrors.email = emailValidation;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation.length > 0) {
      newErrors.password = passwordValidation[0];
    }

    const confirmPasswordValidation = validatePasswordMatch(
      password,
      confirmPassword,
    );
    if (confirmPasswordValidation) {
      newErrors.confirmPassword = confirmPasswordValidation;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle sign-up submission
   */
  const handleSignUp = async () => {
    if (!validateForm() || !isLoaded || !signUp) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await signUp.create({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      // Check for errors
      if (result.error) {
        const message = getClerkErrorMessage(result.error);
        setErrors({ global: message });
        return;
      }

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationStep(true);
      setCode("");
    } catch (err: any) {
      console.error("Sign-up error:", err);
      const message = getClerkErrorMessage(err);
      const fieldErrors = mapFieldErrors(err);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setErrors({ global: message });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle email verification
   */
  const handleVerifyEmail = async () => {
    if (!code.trim() || !isLoaded || !signUp) {
      return;
    }

    try {
      setLoading(true);
      setErrors({ code: "" });

      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Check for errors
      if (result.error) {
        const message = getClerkErrorMessage(result.error);
        setErrors({ code: message });
        return;
      }

      // Complete the sign-up
      if (result.createdSessionId) {
        await setClerkActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Email verification error:", err);
      const message = getClerkErrorMessage(err);
      setErrors({ code: message });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle resending verification code
   */
  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      return;
    }

    try {
      setLoading(true);
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setErrors({ global: "" });
    } catch (err: any) {
      console.error("Resend code error:", err);
      setErrors({ global: getClerkErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle going back to sign-up form
   */
  const handleBackToForm = () => {
    setVerificationStep(false);
    setCode("");
    setErrors({});
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="auth-safe-area">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      </SafeAreaView>
    );
  }

  // Email verification screen
  if (verificationStep) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            className="auth-screen"
          >
            <View className="auth-content">
              {/* Header */}
              <View className="auth-brand-block mb-8">
                <Text className="auth-title">Verify Your Email</Text>
                <Text className="auth-subtitle">
                  We sent a 6-digit code to {email}
                </Text>
              </View>

              {/* Form */}
              <View className="auth-card">
                {/* Global Error */}
                {globalError && (
                  <View className="mb-4 rounded-lg bg-destructive/10 p-3">
                    <Text className="text-xs font-sans-semibold text-destructive">
                      {globalError}
                    </Text>
                  </View>
                )}

                {/* Code Input */}
                <View className="auth-form">
                  <AuthInput
                    label="Verification Code"
                    placeholder="000000"
                    value={code}
                    onChangeText={handleCodeChange}
                    error={codeError}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!loading}
                  />
                </View>

                {/* Verify Button */}
                <AuthButton
                  text="Verify Email"
                  onPress={handleVerifyEmail}
                  loading={loading}
                  disabled={!isCodeFormValid || loading}
                />

                {/* Resend Button */}
                <AuthButton
                  text="Resend Code"
                  variant="secondary"
                  onPress={handleResendCode}
                  loading={loading}
                  disabled={loading}
                  className="mt-3"
                />

                {/* Back Button */}
                <AuthButton
                  text="Back to Sign Up"
                  variant="secondary"
                  onPress={handleBackToForm}
                  disabled={loading}
                  className="mt-2"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main sign-up screen
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="auth-screen"
        >
          <View className="auth-content">
            {/* Header */}
            <View className="auth-brand-block mb-8">
              <Text className="auth-title">Create Your Account</Text>
              <Text className="auth-subtitle">
                Join to manage your subscriptions
              </Text>
            </View>

            {/* Form Card */}
            <View className="auth-card">
              {/* Global Error */}
              {globalError && (
                <View className="mb-4 rounded-lg bg-destructive/10 p-3">
                  <Text className="text-xs font-sans-semibold text-destructive">
                    {globalError}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View className="auth-form">
                {/* Email Input */}
                <AuthInput
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />

                {/* Password Input */}
                <AuthInput
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={handlePasswordChange}
                  error={passwordError}
                  secureTextEntry={!showPassword}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  onPasswordToggle={setShowPassword}
                  editable={!loading}
                />

                {/* Password Requirements */}
                {password && (
                  <View className="mt-3 gap-2">
                    <PasswordRequirement
                      label={passwordReqs.minLength.label}
                      met={passwordReqs.minLength.met}
                    />
                    <PasswordRequirement
                      label={passwordReqs.uppercase.label}
                      met={passwordReqs.uppercase.met}
                    />
                    <PasswordRequirement
                      label={passwordReqs.lowercase.label}
                      met={passwordReqs.lowercase.met}
                    />
                    <PasswordRequirement
                      label={passwordReqs.number.label}
                      met={passwordReqs.number.met}
                    />
                    <PasswordRequirement
                      label={passwordReqs.special.label}
                      met={passwordReqs.special.met}
                    />
                  </View>
                )}

                {/* Confirm Password Input */}
                {password && (
                  <AuthInput
                    label="Confirm Password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    error={confirmPasswordError}
                    secureTextEntry={!showConfirmPassword}
                    showPasswordToggle={true}
                    showPassword={showConfirmPassword}
                    onPasswordToggle={setShowConfirmPassword}
                    editable={!loading}
                  />
                )}
              </View>

              {/* Sign Up Button */}
              <AuthButton
                text="Create Account"
                onPress={handleSignUp}
                loading={loading}
                disabled={!isFormValid || loading}
              />
            </View>

            {/* Sign In Link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Text className="auth-link">Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Password requirement indicator component
 */
function PasswordRequirement({
  label,
  met,
}: {
  label: string;
  met: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={clsx(
          "size-4 items-center justify-center rounded-full",
          met ? "bg-success" : "bg-muted",
        )}
      >
        {met && (
          <MaterialCommunityIcons
            name="check"
            size={12}
            color="#fff"
          />
        )}
      </View>
      <Text
        className={clsx(
          "text-xs font-sans-medium",
          met ? "text-success" : "text-muted-foreground",
        )}
      >
        {label}
      </Text>
    </View>
  );
}
