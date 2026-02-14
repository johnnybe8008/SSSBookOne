import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useStaffRole } from "@/hooks/use-staff-role";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

/**
 * More Screen (More Tab)
 * 
 * Displays:
 * - Profile section with staff info
 * - Settings options
 * - Admin section (for admin users only)
 * - Logout button
 */
export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { role, isAdmin, canManageStaff, canManageOrganizations } = useStaffRole();

  // Get staff record for current user
  const { data: staffRecord, refetch: refetchStaff } = trpc.staff.getByUserId.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Fix admin account mutation
  const fixAdminMutation = trpc.auth.fixAdmin.useMutation();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-xl font-semibold text-foreground mb-4">Not Logged In</Text>
        <Text className="text-base text-muted text-center mb-6">
          Please log in to access settings and profile.
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full"
          onPress={() => router.push("/login" as any)}
        >
          <Text className="text-background font-semibold">Log In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const isVipRated = staffRecord?.isVipRated === 1;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <Text className="text-2xl font-bold text-foreground">More</Text>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {/* Profile Section */}
        <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center">
              <Text className="text-2xl font-bold text-primary">
                {staffRecord?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">{staffRecord?.name || user?.name || "User"}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                {isAdmin && (
                  <View className="px-3 py-1 bg-primary/20 rounded-full">
                    <Text className="text-xs font-medium text-primary">Admin</Text>
                  </View>
                )}
                {isVipRated && (
                  <View className="px-3 py-1 bg-warning/20 rounded-full flex-row items-center gap-1">
                    <IconSymbol name="star.fill" size={12} color={colors.warning} />
                    <Text className="text-xs font-medium text-warning">VIP-rated</Text>
                  </View>
                )}
                {!isAdmin && !isVipRated && (
                  <View className="px-3 py-1 bg-muted/20 rounded-full">
                    <Text className="text-xs font-medium text-muted">Staff</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {staffRecord?.email && (
            <Text className="text-sm text-muted mt-4">{staffRecord.email}</Text>
          )}
        </View>

        {/* Settings Section */}
        <View className="bg-surface rounded-2xl border border-border mb-6 overflow-hidden">
          <Text className="text-sm font-semibold text-muted px-6 pt-4 pb-2">Settings</Text>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => {
              Alert.alert("Edit Profile", "Profile editing will be implemented in a future update");
            }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">Edit Profile</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => {
              Alert.alert("Notifications", "Notification settings will be implemented in a future update");
            }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="message.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">Notifications</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => {
              // Trigger manual sync
              Alert.alert("Sync", "Manual sync functionality will be implemented");
            }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="clock.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">Sync Data</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-success">Synced</Text>
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => {
              Alert.alert(
                "About DoH Book One",
                "Version: " + (Constants.expoConfig?.version || "1.0.7") + "\n\nA mobile counseling tracker app for managing sessions, clients, and cases."
              );
            }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">About</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={async () => {
              try {
                const result = await fixAdminMutation.mutateAsync();
                Alert.alert("Success", result.message || "Admin account fixed successfully. Please restart the app.");
                // Refetch staff record to update UI
                refetchStaff();
              } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to fix admin account");
              }
            }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="wrench.fill" size={20} color={colors.warning} />
              <Text className="text-base text-foreground">Fix Admin Account</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Admin Section (only visible to admins) */}
        {isAdmin && (
          <View className="bg-surface rounded-2xl border border-border mb-6 overflow-hidden">
            <Text className="text-sm font-semibold text-primary px-6 pt-4 pb-2">Admin Functions</Text>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-organizations" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage Staff Organizations</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-client-organizations" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage Client Organizations</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-staff" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Manage Staff</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-staff-bulk-reassign" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Bulk Reassign Staff</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-bulk-reassign" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Bulk Reassign Clients</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-lookup-org" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="building.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Organizational Lookup Tables</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-hierarchy" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="list.bullet.indent" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">View Hierarchy</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-fsms" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage FSMs</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-reports" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="chart.bar" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Reports & Analytics</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-templates" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="doc.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Company Templates</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-csv-import" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="doc.fill" size={20} color={colors.success} />
                <Text className="text-base text-foreground">CSV Import (Organizational)</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-csv-import-clients" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="doc.fill" size={20} color={colors.success} />
                <Text className="text-base text-foreground">CSV Import (Clients)</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-reset-database" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="trash" size={20} color={colors.error} />
                <Text className="text-base text-error font-semibold">Reset Database</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-error/10 py-4 rounded-xl border border-error/30 items-center"
          onPress={handleLogout}
        >
          <Text className="text-base font-semibold text-error">Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text className="text-xs text-muted text-center mt-6">
          DoH Book One v{Constants.expoConfig?.version || "1.0.7"}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
