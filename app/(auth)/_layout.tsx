import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Auth group layout with redirect logic
 * - If user is signed in, redirects to home
 * - Otherwise, shows auth stack (sign-in, sign-up)
 */
export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading indicator while checking auth state
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ea7a53" />
      </View>
    );
  }

  // If already signed in, redirect to home
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Show auth stack
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
