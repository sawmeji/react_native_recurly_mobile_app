import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import { validateEmail, getClerkErrorMessage } from "@/lib/auth";
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

export default function SignInScreen() {
  console.log("🚀 SignInScreen component rendering");

  const { signIn } = useSignIn();
  const { setActive: setClerkActive } = useClerk();
  const { isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const emailError = errors.email || "";
  const passwordError = errors.password || "";
  const globalError = errors.global || "";
  const isFormValid =
    email.trim() && password.trim() && !emailError && !passwordError;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
    if (errors.global) setErrors((prev) => ({ ...prev, global: "" }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
    if (errors.global) setErrors((prev) => ({ ...prev, global: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailValidation = validateEmail(email);
    if (emailValidation) newErrors.email = emailValidation;
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm() || !isAuthLoaded || !signIn || !setClerkActive) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const result = await signIn.password({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      if (result?.error) {
        const message = getClerkErrorMessage(result.error);
        setErrors({ global: message });
        return;
      }

      if (result?.createdSessionId) {
        await setClerkActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const message = getClerkErrorMessage(err);
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9e3" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1, backgroundColor: "#fff9e3" }}
        >
          <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40 }}>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#081126",
                  marginBottom: 8,
                }}
              >
                Welcome Back
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  textAlign: "center",
                  maxWidth: 320,
                }}
              >
                Sign in to manage your subscriptions
              </Text>
            </View>

            {/* Form Card */}
            <View
              style={{
                marginTop: 32,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff8e7",
                padding: 20,
              }}
            >
              {/* Global Error */}
              {globalError && (
                <View
                  style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#dc2626",
                    }}
                  >
                    {globalError}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={{ gap: 16 }}>
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
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }}>
                Don't have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#ea7a53" }}>
                  Sign Up
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
