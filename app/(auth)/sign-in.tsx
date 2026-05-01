import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  console.log("🚀 SignInScreen component rendering - SIMPLE VERSION");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9e3" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#081126" }}>
          Sign In Screen
        </Text>
        <Text style={{ fontSize: 16, color: "#081126", marginTop: 20 }}>
          If you can see this text, the rendering is working!
        </Text>
      </View>
    </SafeAreaView>
  );
}
