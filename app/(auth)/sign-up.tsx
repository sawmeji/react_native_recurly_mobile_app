import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import {
  getClerkErrorMessage,
  getPasswordRequirements,
  isPasswordValid,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/auth";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  confirmPassword?: string;
  code?: string;
  global?: string;
}

export default function SignUpScreen() {
  console.log("🚀 SignUpScreen component rendering");

  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { setActive: setClerkActive } = useClerk();
  const { isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);

  const emailError = errors.email || "";
  const passwordError = errors.password || "";
  const confirmPasswordError = errors.confirmPassword || "";
  const codeError = errors.code || "";
  const globalError = errors.global || "";

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

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    if (errors.global) setErrors((prev) => ({ ...prev, global: "" }));
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/[^0-9]/g, "").slice(0, 6));
    if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailValidation = validateEmail(email);
    if (emailValidation) newErrors.email = emailValidation;
    const passwordValidation = validatePassword(password);
    if (passwordValidation.length > 0) newErrors.password = passwordValidation[0];
    const confirmPasswordValidation = validatePasswordMatch(password, confirmPassword);
    if (confirmPasswordValidation) newErrors.confirmPassword = confirmPasswordValidation;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm() || !isAuthLoaded || !signUp || !setClerkActive) return;

    try {
      setLoading(true);
      setErrors({});
      const result = await signUp.create({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      if (result?.error) {
        const message = getClerkErrorMessage(result.error);
        setErrors({ global: message });
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationStep(true);
      setCode("");
    } catch (err: any) {
      const message = getClerkErrorMessage(err);
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!code.trim() || !isAuthLoaded || !signUp) return;

    try {
      setLoading(true);
      setErrors({ code: "" });
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result?.error) {
        const message = getClerkErrorMessage(result.error);
        setErrors({ code: message });
        return;
      }

      if (result?.createdSessionId) {
        await setClerkActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const message = getClerkErrorMessage(err);
      setErrors({ code: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isAuthLoaded || !signUp) return;

    try {
      setLoading(true);
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setErrors({ global: "" });
    } catch (err: any) {
      setErrors({ global: getClerkErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setVerificationStep(false);
    setCode("");
    setErrors({});
  };

  // Email verification screen
  if (verificationStep) {
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
              <View style={{ alignItems: "center", marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#081126",
                    marginBottom: 8,
                  }}
                >
                  Verify Your Email
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(0, 0, 0, 0.6)",
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  We sent a 6-digit code to {email}
                </Text>
              </View>

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

                <View style={{ gap: 16 }}>
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

                <AuthButton
                  text="Verify Email"
                  onPress={handleVerifyEmail}
                  loading={loading}
                  disabled={!isCodeFormValid || loading}
                />

                <AuthButton
                  text="Resend Code"
                  variant="secondary"
                  onPress={handleResendCode}
                  loading={loading}
                  disabled={loading}
                />

                <AuthButton
                  text="Back to Sign Up"
                  variant="secondary"
                  onPress={handleBackToForm}
                  disabled={loading}
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
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#081126",
                  marginBottom: 8,
                }}
              >
                Create Your Account
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  textAlign: "center",
                  maxWidth: 320,
                }}
              >
                Join to manage your subscriptions
              </Text>
            </View>

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

                {password && (
                  <View style={{ gap: 8, marginTop: 4 }}>
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

              <AuthButton
                text="Create Account"
                onPress={handleSignUp}
                loading={loading}
                disabled={!isFormValid || loading}
              />
            </View>

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
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#ea7a53" }}>
                  Sign In
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: met ? "#16a34a" : "#f6eecf",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {met && (
          <MaterialCommunityIcons name="check" size={12} color="#fff" />
        )}
      </View>
      <Text
        style={{
          fontSize: 12,
          color: met ? "#16a34a" : "rgba(0, 0, 0, 0.6)",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
