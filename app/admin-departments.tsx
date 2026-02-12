import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * Admin - Manage Departments
 * 
 * Allows admin users to:
 * - View all departments for a division
 * - Add new departments
 * - Edit existing departments
 * - Delete departments
 */
export default function AdminDepartmentsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();
  const params = useLocalSearchParams<{ divisionId: string; divisionName: string }>();
  
  const divisionId = parseInt(params.divisionId || "0");
  const divisionName = params.divisionName || "All Divisions";
  const isGlobalMode = divisionId === 0; // Show all departments across all divisions

  const [isAdding, setIsAdding] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");

  // Fetch departments (all if divisionId=0, or specific division)
  const { data: departments, isLoading } = trpc.departments.list.useQuery({ divisionId });
  
  // Fetch all divisions and companies for global mode
  const { data: divisions } = trpc.divisions.list.useQuery({ companyId: 0 }, { enabled: isGlobalMode });
  const { data: companies } = trpc.companies.list.useQuery(undefined, { enabled: isGlobalMode });

  // Create department mutation
  const createDepartment = trpc.departments.create.useMutation({
    onSuccess: () => {
      utils.departments.invalidate();
      utils.companyTeams.invalidate();
      setIsAdding(false);
      setNewDepartmentName("");
      setNewDepartmentDescription("");
      Alert.alert("Success", "Department created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create department");
    },
  });

  // Delete department mutation
  const deleteDepartment = trpc.departments.delete.useMutation({
    onSuccess: () => {
      utils.departments.invalidate();
      utils.companyTeams.invalidate();
      Alert.alert("Success", "Department deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete department");
    },
  });

  const handleCreate = () => {
    if (!newDepartmentName.trim()) {
      Alert.alert("Validation Error", "Please enter department name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createDepartment.mutate({
      divisionId,
      name: newDepartmentName.trim(),
      description: newDepartmentDescription.trim() || '',
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"? This will also delete all associated clients.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDepartment.mutate({ id }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Manage Departments</Text>
              <Text className="text-sm text-muted mt-1">{divisionName}</Text>
            </View>
          </View>
          {!isGlobalMode && (
            <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
              <IconSymbol name={isAdding ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Global Mode Info Message */}
          {isGlobalMode && (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
              <View className="flex-row items-start gap-3">
                <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
                <Text className="flex-1 text-sm text-foreground">
                  This is a read-only view of all departments across all divisions and companies. To add, edit, or delete departments, please navigate through the Companies screen.
                </Text>
              </View>
            </View>
          )}
          {/* Add New Department Form */}
          {isAdding && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">Add New Department</Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Department Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter department name"
                  placeholderTextColor={colors.muted}
                  value={newDepartmentName}
                  onChangeText={setNewDepartmentName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter description (optional)"
                  placeholderTextColor={colors.muted}
                  value={newDepartmentDescription}
                  onChangeText={setNewDepartmentDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className="bg-primary py-3 rounded-full items-center"
                onPress={handleCreate}
                disabled={createDepartment.isPending}
              >
                {createDepartment.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create Department</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Departments List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All Departments ({departments?.length || 0})</Text>
          
          {departments && departments.length > 0 ? (
            departments.map((department: any) => {
              const division = divisions?.find((d: any) => d.id === department.divisionId);
              const company = companies?.find((c: any) => c.id === division?.companyId);
              return (
              <View key={department.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{department.name}</Text>
                    {isGlobalMode && division && company && (
                      <Text className="text-sm text-primary mt-1">{company.name} → {division.name}</Text>
                    )}
                    <Text className="text-xs text-muted mt-1">ID: {department.id} | Code: {department.code}</Text>
                    {department.description && (
                      <Text className="text-sm text-muted mt-1">{department.description}</Text>
                    )}
                  </View>
                  {!isGlobalMode && (
                    <TouchableOpacity
                      onPress={() => handleDelete(department.id, department.name)}
                      disabled={deleteDepartment.isPending}
                    >
                      <IconSymbol name="trash" size={22} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <View className="flex-row gap-2 pt-3 border-t border-border">
                  <TouchableOpacity
                    className="flex-1 bg-primary/10 border border-primary py-2 rounded-xl items-center"
                    onPress={() => router.push(`/admin-organizations?departmentId=${department.id}&departmentName=${encodeURIComponent(department.name)}` as any)}
                  >
                    <Text className="text-sm font-medium text-primary">Company Teams</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
            })
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">
                {isGlobalMode ? "No departments found across all divisions." : "No departments yet. Add your first department above."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
