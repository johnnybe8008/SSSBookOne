import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Reset Database
 * 
 * Allows admin staff to clear all data from the database except admin staff accounts.
 * This is useful for starting fresh with a clean system.
 * 
 * WARNING: This action is irreversible!
 */
export default function AdminResetDatabaseScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const previewQuery = trpc.auth.previewResetDatabase.useQuery(undefined, {
    enabled: showPreview,
  });

  const resetMutation = trpc.auth.resetDatabase.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        Alert.alert(
          "Success",
          result.message,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
      setShowConfirmation(false);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to reset database");
      setShowConfirmation(false);
    },
  });

  const handleResetRequest = () => {
    setShowPreview(true);
  };

  const handleConfirmReset = () => {
    resetMutation.mutate();
    setShowPreview(false);
    setShowConfirmation(false);
  };

  const handleCancelReset = () => {
    setShowConfirmation(false);
    setShowPreview(false);
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Reset Database</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Warning Card */}
          <View className="bg-error/10 border-2 border-error rounded-2xl p-5">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 bg-error rounded-full items-center justify-center">
                <Text className="text-2xl">⚠️</Text>
              </View>
              <Text className="flex-1 text-lg font-bold text-error">Danger Zone</Text>
            </View>
            <Text className="text-base text-foreground leading-relaxed">
              This action will permanently delete <Text className="font-bold">ALL DATA</Text> from the database, including:
            </Text>
            <View className="mt-3 gap-2">
              <Text className="text-sm text-foreground">• All companies, departments, and teams</Text>
              <Text className="text-sm text-foreground">• All clients and their records</Text>
              <Text className="text-sm text-foreground">• All FSMs (Field Service Managers)</Text>
              <Text className="text-sm text-foreground">• All counseling sessions and folders</Text>
              <Text className="text-sm text-foreground">• All staff members (except admin staff)</Text>
              <Text className="text-sm text-foreground">• All groups and staff teams</Text>
              <Text className="text-sm text-foreground">• All notifications</Text>
            </View>
          </View>

          {/* What Will Be Kept */}
          <View className="bg-success/10 border border-success rounded-2xl p-5">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 bg-success rounded-full items-center justify-center">
                <Text className="text-2xl">✓</Text>
              </View>
              <Text className="flex-1 text-lg font-bold text-success">What Will Be Kept</Text>
            </View>
            <Text className="text-base text-foreground">
              Only <Text className="font-bold">admin staff accounts</Text> will be preserved. You will still be able to log in after the reset.
            </Text>
          </View>

          {/* Use Case */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <Text className="text-lg font-semibold text-foreground mb-3">When to Use This</Text>
            <Text className="text-base text-muted leading-relaxed">
              Use this feature when you want to start fresh with a clean system, typically before importing new data via CSV bulk import or when setting up a new deployment.
            </Text>
          </View>

          {!showPreview && !showConfirmation ? (
            /* Reset Button */
            <TouchableOpacity
              className="bg-error py-4 rounded-full items-center"
              onPress={handleResetRequest}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text className="text-background text-lg font-bold">Reset Database</Text>
              )}
            </TouchableOpacity>
          ) : showPreview ? (
            /* Preview Modal */
            <View className="bg-warning/10 border-2 border-warning rounded-2xl p-5 gap-4">
              <Text className="text-xl font-bold text-foreground text-center">Reset Preview</Text>
              {previewQuery.isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : previewQuery.isError ? (
                <Text className="text-error text-center">Failed to load preview: {previewQuery.error?.message}</Text>
              ) : previewQuery.data ? (
                <View className="gap-2">
                  <Text className="text-base text-foreground text-center">Preserved:</Text>
                  <Text className="text-sm text-success">• Admin staff: {previewQuery.data.adminCount}</Text>
                  <Text className="text-sm text-success">• Co-departments: {previewQuery.data.coDepartmentUniqueCount} unique</Text>
                  <Text className="text-xs text-muted">(Total: {previewQuery.data.coDepartmentCount})</Text>
                  <Text className="text-sm text-success">• Staff departments: {previewQuery.data.staffDepartmentUniqueCount} unique</Text>
                  <Text className="text-xs text-muted">(Total: {previewQuery.data.staffDepartmentCount})</Text>
                  <Text className="text-sm text-success">• Company teams: {previewQuery.data.companyTeamUniqueCount} unique</Text>
                  <Text className="text-xs text-muted">(Total: {previewQuery.data.companyTeamCount})</Text>
                  <Text className="text-sm text-success">• Staff teams: {previewQuery.data.staffTeamUniqueCount} unique</Text>
                  <Text className="text-xs text-muted">(Total: {previewQuery.data.staffTeamCount})</Text>
                  <Text className="text-base text-foreground text-center mt-2">Will be deleted:</Text>
                  <Text className="text-sm text-error">• Clients: {previewQuery.data.clientCount}</Text>
                  <Text className="text-sm text-error">• Staff: {previewQuery.data.staffCount}</Text>
                  <Text className="text-sm text-error">• Companies: {previewQuery.data.companyCount}</Text>
                  <Text className="text-sm text-error">• Organizations: {previewQuery.data.organizationCount}</Text>
                  <Text className="text-sm text-error">• Sessions: {previewQuery.data.sessionCount}</Text>
                </View>
              ) : null}
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  className="flex-1 bg-background border border-border py-3 rounded-full items-center"
                  onPress={handleCancelReset}
                  disabled={resetMutation.isPending}
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-error py-3 rounded-full items-center"
                  onPress={() => { setShowPreview(false); setShowConfirmation(true); }}
                  disabled={resetMutation.isPending}
                >
                  <Text className="text-background font-bold">Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : showConfirmation ? (
            /* Confirmation Section */
            <View className="bg-warning/10 border-2 border-warning rounded-2xl p-5 gap-4">
              <Text className="text-xl font-bold text-foreground text-center">
                Are you absolutely sure?
              </Text>
              <Text className="text-base text-foreground text-center leading-relaxed">
                This action <Text className="font-bold">CANNOT</Text> be undone. All data will be permanently deleted.
              </Text>
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  className="flex-1 bg-background border border-border py-3 rounded-full items-center"
                  onPress={handleCancelReset}
                  disabled={resetMutation.isPending}
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-error py-3 rounded-full items-center"
                  onPress={handleConfirmReset}
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="text-background font-bold">Yes, Delete Everything</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
