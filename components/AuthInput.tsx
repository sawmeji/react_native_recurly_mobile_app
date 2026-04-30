import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import React from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

interface AuthInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
  containerClassName?: string;
  rightElement?: React.ReactNode;
  showPasswordToggle?: boolean;
  onPasswordToggle?: (show: boolean) => void;
  showPassword?: boolean;
}

/**
 * Reusable input component for authentication forms
 * Matches app design system styling
 */
export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  containerClassName = "",
  rightElement,
  showPasswordToggle = false,
  onPasswordToggle,
  showPassword = false,
  secureTextEntry,
  ...props
}) => {
  return (
    <View className={clsx("auth-field", containerClassName)}>
      <Text className="auth-label">{label}</Text>
      <View className="relative">
        <TextInput
          {...props}
          secureTextEntry={
            showPasswordToggle && !showPassword ? true : secureTextEntry
          }
          className={clsx(
            "auth-input",
            error && "auth-input-error",
            "text-base",
          )}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
        />
        {showPasswordToggle && (
          <Pressable
            onPress={() => onPasswordToggle?.(!showPassword)}
            className="absolute right-4 top-0 h-full items-center justify-center"
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#081126"
            />
          </Pressable>
        )}
        {rightElement && (
          <View className="absolute right-4 top-0 h-full items-center justify-center">
            {rightElement}
          </View>
        )}
      </View>
      {error && <Text className="auth-error">{error}</Text>}
    </View>
  );
};

export default AuthInput;
