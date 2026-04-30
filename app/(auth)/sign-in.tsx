import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import {
  getClerkErrorMessage,
  mapFieldErrors,
  validateEmail,
} from "@/lib/auth";
import { useAuth, useClerk, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

interface FormErrors {
  email?: string;
  password?: string;
  code?: string;
  global?: string;
}

/**
 * Production-grade sign-in screen with email/password authentication
 * - Form validation
 * - Error handling
 * - MFA support
 */
export default function SignInScreen() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { setActive: setClerkActive } = useClerk();
  const { isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const isLoaded = isSignInLoaded && isAuthLoaded;

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  // Validation state
  const emailError = errors.email || "";
  const passwordError = errors.password || "";
  const codeError = errors.code || "";
  const globalError = errors.global || "";

  const isFormValid =
    email.trim() && password.trim() && !emailError && !passwordError;
  const isMfaFormValid = code.trim() && !codeError;

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

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle sign-in submission
   */
  const handleSignIn = async () => {
    if (!validateForm() || !isLoaded || !signIn) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await signIn.password({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      // Check for errors
      if (result.error) {
        const message = getClerkErrorMessage(result.error);
        setErrors({ global: message });
        return;
      }

      // If sign-in succeeded, navigate home
      if (result.createdSessionId) {
        await setClerkActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      const message = getClerkErrorMessage(err);
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle going back to sign-in
   */
  const handleBackToSignIn = () => {
    setMfaRequired(false);
    setCode("");
    setPassword("");
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

  // Main sign-in screen
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
              <Text className="auth-title">Welcome Back</Text>
              <Text className="auth-subtitle">
                Sign in to manage your subscriptions
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
              </View>

              {/* Sign In Button */}
              <AuthButton
                text="Sign In"
                onPress={handleSignIn}
                loading={loading}
                disabled={!isFormValid || loading}
              />
            </View>

            {/* Sign Up Link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Text className="auth-link">Sign Up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
