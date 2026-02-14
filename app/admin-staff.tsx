import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function AdminStaffScreen() {
  const colors = useColors();
  const { data: allStaff, isLoading } = trpc.staff.listAll.useQuery();

  if (isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="mt-4 text-muted">Loading staff...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-primary text-base font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Manage Staff</Text>
          <Text className="text-sm text-muted mt-1">
            {allStaff?.length || 0} staff members
          </Text>
        </View>

        {/* Add New Button */}
        <TouchableOpacity
          onPress={() => router.push("/admin-staff-add" as any)}
          className="bg-primary rounded-lg p-4 mb-4"
        >
          <Text className="text-background font-semibold text-center">+ Add New Staff</Text>
        </TouchableOpacity>

        {/* Staff List */}
        {allStaff && allStaff.length > 0 ? (
          <View className="gap-3">
            {allStaff.map((staff: any) => (
              <TouchableOpacity
                key={staff.id}
                onPress={() => router.push(`/admin-staff-edit?id=${staff.id}` as any)}
                className="bg-surface rounded-lg p-4 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {staff.name}
                    </Text>
                    <Text className="text-sm text-muted mt-1">{staff.email}</Text>
                    
                    {/* Badges */}
                    <View className="flex-row gap-2 mt-2">
                      {staff.role === "admin" && (
                        <View className="bg-error rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">ADMIN</Text>
                        </View>
                      )}
                      {staff.role === "counselor" && (
                        <View className="bg-primary rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">COUNSELOR</Text>
                        </View>
                      )}
                      {staff.role === "viewer" && (
                        <View className="bg-success rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">VIEW ONLY</Text>
                        </View>
                      )}
                      {staff.isVipRated && (
                        <View className="bg-warning rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">VIP</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text className="text-2xl text-muted">›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <Text className="text-muted text-center">No staff members found</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
