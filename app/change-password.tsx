import { useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

/**
 * Change Password Screen
 * 
 * Forces users to change their password on first login (when mustChangePassword flag is set).
 * Also accessible from settings for voluntary password changes.
 */
export default function ChangePasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const { staff } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const changePasswordMutation = trpc.auth.changePassword.useMutation();

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      Alert.alert(
        "Success",
        "Your password has been changed successfully",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/");
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-center max-w-md w-full self-center">
        <Text className="text-3xl font-bold text-foreground mb-2">
          Change Password
        </Text>
        <Text className="text-base text-muted mb-8">
          You must change your password before continuing
        </Text>

        {/* Current Password */}
        <Text className="text-sm font-medium text-foreground mb-2">
          Current Password
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-4"
          placeholder="Enter current password"
          placeholderTextColor={colors.muted}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* New Password */}
        <Text className="text-sm font-medium text-foreground mb-2">
          New Password
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-4"
          placeholder="Enter new password"
          placeholderTextColor={colors.muted}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Confirm Password */}
        <Text className="text-sm font-medium text-foreground mb-2">
          Confirm New Password
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-6"
          placeholder="Re-enter new password"
          placeholderTextColor={colors.muted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Change Password Button */}
        <TouchableOpacity
          className="bg-primary py-4 rounded-xl items-center"
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text className="text-base font-semibold text-background">
            {loading ? "Changing Password..." : "Change Password"}
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-muted text-center mt-4">
          Password must be at least 6 characters long
        </Text>
      </View>
    </ScreenContainer>
  );
}
