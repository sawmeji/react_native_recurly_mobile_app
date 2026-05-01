import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import { useEffect, useState } from "react";

/**
 * Auth group layout with redirect logic
 * - If user is signed in, redirects to home
 * - Otherwise, shows auth stack (sign-in, sign-up)
 * - Has a timeout to show auth screen if loading takes too long
 */
export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [timeout, setTimedOut] = useState(false);

  useEffect(() => {
    console.log("🔑 Auth State:", { isLoaded, isSignedIn });

    // If not loaded after 5 seconds, show auth screen anyway
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.warn(
          "⚠️ Auth state loading timeout - showing auth screen anyway"
        );
        setTimedOut(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Show loading indicator while checking auth state
  if (!isLoaded && !timeout) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ea7a53" />
        <Text className="mt-4 text-foreground">Initializing auth...</Text>
      </View>
    );
  }

  // If already signed in, redirect to home
  if (isSignedIn && isLoaded) {
    console.log("✅ User is signed in, redirecting to home");
    return <Redirect href="/(tabs)" />;
  }

  // Show auth stack (either if timed out or if explicitly not signed in)
  console.log("📝 Showing auth stack");
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
