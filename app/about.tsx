import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router } from "expo-router";
import { APP_VERSION } from "@/constants/const";

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
            Version: {APP_VERSION}
          </Text>
          <Text className="text-base text-foreground mb-2">
            SSS Book One is a mobile counseling tracker app for managing sessions, clients, and folders.
          </Text>
          <Text className="text-base text-foreground mb-2">
            Developed by SSS Book One Project for Staff Use Only!         
          </Text>
          <Text className="text-base text-foreground mb-2">
            Clearwater, FL 33755, USA - and         
          </Text>
           <Text className="text-base text-foreground mb-2">
            Lone Hill, Sandton 2192, South Africa.         
          </Text>
          <Text className="text-sm text-muted">
            Copyright (c) 2026. All rights reserved.
          </Text>
        </View>
        <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <Text className="text-2xl font-bold text-primary mb-4">Privacy Policy</Text>
          <Text className="text-base text-foreground mb-3">
            SSS Book One uses information entered into the app to support counseling workflows, including managing
            clients, sessions, and related records.
          </Text>
          <Text className="text-base text-foreground mb-3">
            Personal information is used only to operate, maintain, and improve the app and to support authorized
            administrative or service-related functions.
          </Text>
          <Text className="text-base text-foreground mb-3">
            No mobile information will be shared with third parties or affiliates for marketing or promotional
            purposes.
          </Text>
          <Text className="text-base text-foreground">
            Information may be disclosed only when needed to provide core services, comply with legal obligations,
            protect users or the app, or when otherwise authorized by the organization using the app.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
