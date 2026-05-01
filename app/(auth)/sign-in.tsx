import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import {
  getClerkErrorMessage,
  validateEmail,
} from "@/lib/auth";
import { useAuth, useClerk, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  global?: string;
}

/**
 * Production-grade sign-in screen with email/password authentication
 */
export default function SignInScreen() {
  console.log("🚀 SignInScreen component rendering");

  let signIn;
  let setClerkActive;
  let isAuthLoaded = false;

  try {
    const signInResult = useSignIn();
    signIn = signInResult?.signIn;
    const isSignInLoaded = signInResult?.isLoaded ?? false;
    console.log("✅ useSignIn() loaded:", { isSignInLoaded });

    const clerkResult = useClerk();
    setClerkActive = clerkResult?.setActive;
    console.log("✅ useClerk() loaded:", { setClerkActive: !!setClerkActive });

    const authResult = useAuth();
    isAuthLoaded = authResult?.isLoaded ?? false;
    console.log("✅ useAuth() loaded:", { isAuthLoaded });
  } catch (error) {
    console.error("❌ Error loading Clerk hooks:", error);
    return (
      <SafeAreaView className="auth-safe-area">
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-center text-destructive mb-4">
            Error initializing authentication
          </Text>
          <Text className="text-center text-muted-foreground text-sm">
            {String(error)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Validation state
  const emailError = errors.email || "";
  const passwordError = errors.password || "";
  const globalError = errors.global || "";

  const isFormValid =
    email.trim() && password.trim() && !emailError && !passwordError;

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

  const handleSignIn = async () => {
    if (!validateForm() || !isAuthLoaded || !signIn || !setClerkActive) {
      console.warn("⚠️ Sign-in requirements not met:", {
        validated: validateForm(),
        authLoaded: isAuthLoaded,
        hasSignIn: !!signIn,
        hasSetActive: !!setClerkActive,
      });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      console.log("📤 Attempting sign-in with:", {
        email: email.toLowerCase().trim(),
      });

      const result = await signIn.password({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      console.log("📥 Sign-in result:", result);

      if (result?.error) {
        const message = getClerkErrorMessage(result.error);
        console.error("❌ Sign-in error:", message);
        setErrors({ global: message });
        return;
      }

      if (result?.createdSessionId) {
        console.log("✅ Session created, redirecting home");
        await setClerkActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("❌ Sign-in exception:", err);
      const message = getClerkErrorMessage(err);
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  };

  console.log("🎨 Rendering SignInScreen UI");

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
