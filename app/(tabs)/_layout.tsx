import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import clsx from "clsx";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Image, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

const tabBar = components.tabBar;

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );
};

const TabLayout = () => {
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded } = useAuth();
  const [timeout, setTimedOut] = useState(false);

  useEffect(() => {
    console.log("📊 Tabs Auth State:", { isLoaded, isSignedIn });

    // If not loaded after 5 seconds, redirect to sign-in anyway
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.warn(
          "⚠️ Tabs auth loading timeout - redirecting to sign-in"
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
        <Text className="mt-4 text-foreground">Loading dashboard...</Text>
      </View>
    );
  }

  // Redirect to sign-in if not authenticated (or if timed out)
  if (!isSignedIn || timeout) {
    console.log("🚫 Not signed in, redirecting to sign-in");
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
