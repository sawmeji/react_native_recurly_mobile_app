import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

/**
 * Auth group layout with redirect logic
 * - If user is signed in, redirects to home
 * - Otherwise, shows auth stack (sign-in, sign-up)
 */
export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for auth state to load
  if (!isLoaded) {
    return null;
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
