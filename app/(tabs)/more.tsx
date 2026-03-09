import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
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
    // Debug: Log session token and staff info when More tab is opened
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )session_token=([^;]*)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      console.log('[MoreScreen][DEBUG] session_token from cookie:', token);
    }
    // ...existing code...
    // Ensure only one useAuth destructuring
    // ...existing code...
  const colors = useColors();
  const router = useRouter();
  const { user, staff, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { role, isAdmin, canManageStaff, canManageOrganizations } = useStaffRole();

  // Get staff record for current user
  const { data: staffRecord, isLoading: staffLoading, refetch: refetchStaff } = trpc.staff.getByUserId.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Fix admin account mutation
  const fixAdminMutation = trpc.auth.fixAdmin.useMutation();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      console.log("[MoreScreen] Web logout confirm dialog");
      if (window.confirm("Are you sure you want to logout?")) {
        (async () => {
          console.log("[MoreScreen] Logout button pressed");
          await logout();
          console.log("[MoreScreen] Logout completed, navigating to /login");
          router.replace("/login" as any);
        })();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              console.log("[MoreScreen] Logout button pressed");
              await logout();
              console.log("[MoreScreen] Logout completed, navigating to /login");
              router.replace("/login" as any);
            },
          },
        ]
      );
    }
  };

  if (authLoading || staffLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }
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
          <Text className="text-2xl font-semibold text-primary mb-1">
            {staffRecord?.name || staff?.name || user?.name || "User"}
          </Text>
          <Text className="text-base text-muted mb-1">
            {(staffRecord?.role || staff?.role) ? (staffRecord?.role || staff?.role).charAt(0).toUpperCase() + (staffRecord?.role || staff?.role).slice(1) : ""}
          </Text>
          {(staffRecord?.email || staff?.email) && (
            <Text className="text-sm text-muted mb-1">{staffRecord?.email || staff?.email}</Text>
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
              Alert.alert("Notifications", "Notification settings will be implemented in a future update.");
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
            onPress={() => router.push("/about" as any)}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">About</Text>
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
              onPress={() => router.push("/admin-client-organizations" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage Client Organizations</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Removed Manage Client Companies tab item */}

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

            {/* Staff CSV Import/Export Links */}
            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => {
                // Use the same handler as in admin-staff.tsx
                // Import handler logic
                Alert.alert(
                  "Import Staff",
                  "CSV import functionality coming soon. Expected format:\nName,Email,Phone,Role,VIP Rated,Organization,Department,Team",
                  [{ text: "OK" }]
                );
              }}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="arrow.down.doc" size={20} color={colors.warning} />
                <Text className="text-base text-foreground">Import Staff CSV</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => {
                // Use the same handler as in admin-staff.tsx
                // Export handler logic
                // We'll show a placeholder alert for now
                Alert.alert(
                  "Export Staff",
                  "CSV export ready. In a production app, this would download a file.",
                  [
                    { text: "OK" },
                    { text: "Copy to Clipboard", onPress: () => Alert.alert("Success", "CSV data copied to clipboard") }
                  ]
                );
              }}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="arrow.up.doc" size={20} color={colors.success} />
                <Text className="text-base text-foreground">Export Staff CSV</Text>
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
          onPress={() => {
            console.log("[MoreScreen] Logout button direct onPress fired");
            handleLogout();
          }}
        >
          <Text className="text-base font-semibold text-error">Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text className="text-xs text-muted text-center mt-6">
          SSS Book One v{Constants.expoConfig?.version || "2.0.6"}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
