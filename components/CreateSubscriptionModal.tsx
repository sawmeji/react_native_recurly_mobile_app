import { CATEGORY_COLORS, SUBSCRIPTION_CATEGORIES } from "@/constants/data";
import { icons } from "@/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPriceInput] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState<(typeof SUBSCRIPTION_CATEGORIES)[number]>(
    SUBSCRIPTION_CATEGORIES[0],
  );

  // Validation
  const nameValid = name.trim().length > 0;
  const priceValid =
    price.length > 0 && !isNaN(parseFloat(price)) && parseFloat(price) > 0;
  const formValid = nameValid && priceValid;

  const handleSubmit = () => {
    if (!formValid) return;

    const today = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? today.add(1, "month").toISOString()
        : today.add(1, "year").toISOString();

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      icon: icons.wallet,
      name: name.trim(),
      category,
      status: "active",
      startDate: today.toISOString(),
      price: parseFloat(price),
      currency: "USD",
      billing: frequency,
      renewalDate,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    };

    onSubmit(newSubscription);
    handleReset();
  };

  const handleReset = () => {
    setName("");
    setPriceInput("");
    setFrequency("Monthly");
    setCategory(SUBSCRIPTION_CATEGORIES[0]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <StyledView className="modal-overlay">
        <StyledKeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <StyledView className="modal-container">
            {/* Header */}
            <StyledView className="modal-header flex-row items-center justify-between">
              <StyledText className="modal-title">New Subscription</StyledText>
              <StyledPressable
                onPress={handleClose}
                className="modal-close"
                hitSlop={8}
              >
                <StyledText className="modal-close-text">×</StyledText>
              </StyledPressable>
            </StyledView>

            {/* Body */}
            <StyledScrollView className="modal-body">
              {/* Name Field */}
              <StyledView className="auth-field">
                <StyledText className="auth-label">Subscription Name</StyledText>
                <StyledTextInput
                  className={clsx("auth-input", !nameValid && name && "auth-input-error")}
                  placeholder="e.g., Netflix"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                />
                {!nameValid && name && (
                  <StyledText className="auth-error">Name is required</StyledText>
                )}
              </StyledView>

              {/* Price Field */}
              <StyledView className="auth-field">
                <StyledText className="auth-label">Price (USD)</StyledText>
                <StyledTextInput
                  className={clsx("auth-input", !priceValid && price && "auth-input-error")}
                  placeholder="e.g., 9.99"
                  value={price}
                  onChangeText={setPriceInput}
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                />
                {!priceValid && price && (
                  <StyledText className="auth-error">
                    Please enter a valid price
                  </StyledText>
                )}
              </StyledView>

              {/* Frequency Picker */}
              <StyledView className="auth-field">
                <StyledText className="auth-label">Billing Frequency</StyledText>
                <StyledView className="picker-row">
                  <StyledPressable
                    onPress={() => setFrequency("Monthly")}
                    className={clsx(
                      "picker-option",
                      frequency === "Monthly" && "picker-option-active",
                    )}
                  >
                    <StyledText
                      className={clsx(
                        "picker-option-text",
                        frequency === "Monthly" && "picker-option-text-active",
                      )}
                    >
                      Monthly
                    </StyledText>
                  </StyledPressable>
                  <StyledPressable
                    onPress={() => setFrequency("Yearly")}
                    className={clsx(
                      "picker-option",
                      frequency === "Yearly" && "picker-option-active",
                    )}
                  >
                    <StyledText
                      className={clsx(
                        "picker-option-text",
                        frequency === "Yearly" && "picker-option-text-active",
                      )}
                    >
                      Yearly
                    </StyledText>
                  </StyledPressable>
                </StyledView>
              </StyledView>

              {/* Category Selection */}
              <StyledView className="auth-field">
                <StyledText className="auth-label">Category</StyledText>
                <StyledView className="category-scroll">
                  {SUBSCRIPTION_CATEGORIES.map((cat) => (
                    <StyledPressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                    >
                      <StyledText
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </StyledText>
                    </StyledPressable>
                  ))}
                </StyledView>
              </StyledView>

              {/* Submit Button */}
              <StyledPressable
                onPress={handleSubmit}
                disabled={!formValid}
                className={clsx(
                  "auth-button mt-5",
                  !formValid && "auth-button-disabled",
                )}
              >
                <StyledText className="auth-button-text">Create Subscription</StyledText>
              </StyledPressable>
            </StyledScrollView>
          </StyledView>
        </StyledKeyboardAvoidingView>
      </StyledView>
    </Modal>
  );
}
