import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import Constants from "expo-constants";
import { router } from "expo-router";

export default function AboutScreen() {
  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <Text className="text-primary text-2xl font-bold">&#60;</Text>
          <Text className="text-primary text-base font-semibold">Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <Text className="text-2xl font-bold text-primary mb-2">About SSS Book One</Text>
          <Text className="text-base text-muted mb-4">
            Version: {Constants.expoConfig?.version || "2.0.0"}
          </Text>
          <Text className="text-base text-foreground mb-2">
            SSS Book One is a mobile counseling tracker app for managing sessions, clients, and cases.
          </Text>
          <Text className="text-sm text-muted">
            Copyright © 2026. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
