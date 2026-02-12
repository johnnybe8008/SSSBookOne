import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";

/**
 * Admin - Organizational Lookup Tables
 * 
 * Submenu for managing organizational entities:
 * - Divisions
 * - Departments  
 * - Company Teams
 */
export default function AdminLookupOrgScreen() {
  const colors = useColors();
  const router = useRouter();

  const menuItems = [
    {
      title: "Divisions",
      description: "Manage all divisions across companies",
      icon: "building.2.fill" as const,
      route: "/admin-divisions" as any,
      color: colors.primary,
    },
    {
      title: "Departments",
      description: "Manage all departments across divisions",
      icon: "square.grid.2x2.fill" as const,
      route: "/admin-departments" as any,
      color: colors.success,
    },
    {
      title: "Company Teams",
      description: "Manage all company teams across departments",
      icon: "person.3.fill" as const,
      route: "/admin-organizations" as any,
      color: colors.warning,
    },
  ];

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Organizational Lookup Tables</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <Text className="text-sm text-muted">
            Manage organizational entities across the entire system. Each section provides list, add, edit, and delete capabilities for admins.
          </Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-surface border border-border rounded-2xl p-5"
              onPress={() => router.push(item.route)}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <IconSymbol name={item.icon} size={24} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
                  <Text className="text-sm text-muted mt-1">{item.description}</Text>
                </View>
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
