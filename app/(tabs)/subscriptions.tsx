import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import "@/global.css";
import { usePostHog } from "posthog-react-native";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledView = styled(View);

export default function SubscriptionsScreen() {
  const posthog = usePostHog();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  // Filter subscriptions based on search query
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return HOME_SUBSCRIPTIONS;
    }

    const query = searchQuery.toLowerCase();
    return HOME_SUBSCRIPTIONS.filter(
      (subscription) =>
        subscription.name.toLowerCase().includes(query) ||
        subscription.category?.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    );

    if (isExpanding) {
      posthog.capture("subscription_expanded", {
        subscription_id: item.id,
        subscription_name: item.name,
        category: item.category || "Unknown",
        billing: item.billing,
      });
    } else {
      posthog.capture("subscription_collapsed", {
        subscription_id: item.id,
        subscription_name: item.name,
      });
    }
  };

  const resultsText =
    searchQuery.trim() && filteredSubscriptions.length === 0
      ? "No subscriptions match your search"
      : `${filteredSubscriptions.length} subscription${filteredSubscriptions.length !== 1 ? "s" : ""}`;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StyledView className="px-5 pt-5 pb-4 gap-4">
        <StyledTextInput
          className="auth-input"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          editable={true}
        />
        <StyledText className="text-sm font-sans-medium text-muted-foreground">
          {resultsText}
        </StyledText>
      </StyledView>
      <FlatList
        data={filteredSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <StyledView className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <StyledView className="flex-1 items-center justify-center py-12 px-5">
            <StyledText className="text-base font-sans-medium text-muted-foreground text-center">
              {searchQuery.trim()
                ? `No subscriptions match "${searchQuery}"`
                : "No subscriptions found"}
            </StyledText>
          </StyledView>
        }
        contentContainerClassName="px-5 pb-10"
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}
