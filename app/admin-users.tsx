import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin Users Screen
 * 
 * Manage staff/users:
 * - View all staff members
 * - Add new staff
 * - Edit staff details
 * - Assign to groups/teams
 * - Set roles (Admin, Counselor, Viewer)
 */
export default function AdminUsersScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Counselor" as "Admin" | "Counselor" | "Viewer",
  });

  // Fetch staff list (need teamId - using 1 as default for now)
  const { data: staffList, isLoading } = trpc.staff.list.useQuery({ teamId: 1 });

  // Create staff mutation
  const createStaff = trpc.staff.create.useMutation({
    onSuccess: () => {
      utils.staff.invalidate();
      Alert.alert("Success", "Staff member added successfully");
      setShowAddForm(false);
      setFormData({ name: "", email: "", phone: "", role: "Counselor" });
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to add staff member");
    },
  });

  // Delete staff mutation
  const deleteStaff = trpc.staff.delete.useMutation({
    onSuccess: () => {
      utils.staff.invalidate();
      Alert.alert("Success", "Staff member removed successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to remove staff member");
    },
  });

  const handleAdd = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter staff name");
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert("Validation Error", "Please enter staff email");
      return;
    }

    createStaff.mutate({
      teamId: 1, // Default team - should be selectable in production
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      isAdmin: formData.role === "Admin" ? 1 : 0,
      isVipRated: 0,
      createdBy: 1, // Should be current user ID
      updatedBy: 1,
    });
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to remove ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteStaff.mutate({ id }) },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      Admin: colors.error,
      Counselor: colors.primary,
      Viewer: colors.muted,
    };
    return roleColors[role] || colors.muted;
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Staff Management</Text>
          </View>
          <TouchableOpacity
            className="bg-primary w-10 h-10 rounded-full items-center justify-center"
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <IconSymbol name={showAddForm ? "xmark" : "plus"} size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {/* Add Form */}
        {showAddForm && (
          <View className="bg-surface border border-border rounded-2xl p-4 mb-4">
            <Text className="text-base font-semibold text-foreground mb-3">Add New Staff Member</Text>
            <View className="gap-3">
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Name *"
                placeholderTextColor={colors.muted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Email *"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Phone"
                placeholderTextColor={colors.muted}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              <View className="flex-row gap-2">
                {(["Admin", "Counselor", "Viewer"] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    className={`flex-1 py-3 rounded-xl border ${
                      formData.role === role ? "bg-primary border-primary" : "bg-background border-border"
                    }`}
                    onPress={() => setFormData({ ...formData, role })}
                  >
                    <Text className={`text-center font-medium ${formData.role === role ? "text-background" : "text-foreground"}`}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                className="bg-primary py-3 rounded-xl items-center mt-2"
                onPress={handleAdd}
                disabled={createStaff.isPending}
              >
                {createStaff.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Add Staff Member</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Staff List */}
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : staffList && staffList.length > 0 ? (
          <View className="gap-4">
            {staffList.map((staff: any) => (
              <View
                key={staff.id}
                className="bg-surface rounded-2xl p-5 border border-border"
              >
                {/* Header with Name and Role */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">{staff.name}</Text>
                    <Text className="text-xs text-muted mt-1">ID: {staff.id}</Text>
                    {staff.email && (
                      <Text className="text-sm text-muted mt-1">{staff.email}</Text>
                    )}
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${getRoleColor(staff.role || "Counselor")}20` }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: getRoleColor(staff.role || "Counselor") }}
                    >
                      {staff.role || "Counselor"}
                    </Text>
                  </View>
                </View>

                {/* Contact Info */}
                {staff.phone && (
                  <View className="flex-row items-center gap-2 mb-3">
                    <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                    <Text className="text-sm text-muted">{staff.phone}</Text>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-2 pt-3 border-t border-border">
                  <TouchableOpacity
                    className="flex-1 bg-background border border-border py-2 rounded-xl items-center"
                    onPress={() => Alert.alert("Coming Soon", "Edit functionality will be available in the next update")}
                  >
                    <Text className="text-sm font-medium text-foreground">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-error/10 border border-error py-2 rounded-xl items-center"
                    onPress={() => handleDelete(staff.id, staff.name)}
                  >
                    <Text className="text-sm font-medium text-error">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <IconSymbol name="person.2.fill" size={48} color={colors.muted} />
            <Text className="text-base text-muted text-center mt-4">No staff members yet</Text>
            <Text className="text-sm text-muted text-center mt-2">Add your first staff member</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
