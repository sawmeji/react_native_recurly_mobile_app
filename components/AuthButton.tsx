import clsx from "clsx";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  View,
} from "react-native";

interface AuthButtonProps extends Omit<PressableProps, "style"> {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

/**
 * Reusable button component for authentication forms
 * Matches app design system styling
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  text,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      className={clsx(
        variant === "primary"
          ? "auth-button"
          : variant === "secondary"
            ? "auth-secondary-button"
            : "auth-button",
        isDisabled &&
          (variant === "primary" ? "auth-button-disabled" : "opacity-60"),
        className,
      )}
    >
      {loading ? (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#081126" : "#ea7a53"}
          />
          <Text
            className={
              variant === "primary"
                ? "auth-button-text"
                : "auth-secondary-button-text"
            }
          >
            {text}
          </Text>
        </View>
      ) : (
        <Text
          className={
            variant === "primary"
              ? "auth-button-text"
              : "auth-secondary-button-text"
          }
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
};

export default AuthButton;
