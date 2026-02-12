import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * Admin - Manage Divisions
 * 
 * Allows admin users to:
 * - View all divisions for a company
 * - Add new divisions
 * - Edit existing divisions
 * - Delete divisions
 */
export default function AdminDivisionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();
  const params = useLocalSearchParams<{ companyId: string; companyName: string }>();
  
  const companyId = parseInt(params.companyId || "0");
  const companyName = params.companyName || "All Companies";
  const isGlobalMode = companyId === 0; // Show all divisions across all companies

  const [isAdding, setIsAdding] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDivisionDescription, setNewDivisionDescription] = useState("");

  // Fetch divisions (all if companyId=0, or specific company)
  const { data: divisions, isLoading } = trpc.divisions.list.useQuery({ companyId });
  
  // Fetch all companies for global mode
  const { data: companies } = trpc.companies.list.useQuery(undefined, { enabled: isGlobalMode });

  // Create division mutation
  const createDivision = trpc.divisions.create.useMutation({
    onSuccess: () => {
      utils.divisions.invalidate();
      utils.departments.invalidate();
      utils.companyTeams.invalidate();
      setIsAdding(false);
      setNewDivisionName("");
      setNewDivisionDescription("");
      Alert.alert("Success", "Division created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create division");
    },
  });

  // Delete division mutation
  const deleteDivision = trpc.divisions.delete.useMutation({
    onSuccess: () => {
      utils.divisions.invalidate();
      utils.departments.invalidate();
      utils.companyTeams.invalidate();
      Alert.alert("Success", "Division deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete division");
    },
  });

  const handleCreate = () => {
    if (!newDivisionName.trim()) {
      Alert.alert("Validation Error", "Please enter division name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createDivision.mutate({
      companyId,
      name: newDivisionName.trim(),
      description: newDivisionDescription.trim() || '',
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"? This will also delete all associated departments and clients.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDivision.mutate({ id }),
        },
      ]
    );
  };

  if (companyId === 0) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-xl font-semibold text-error">Invalid Company ID</Text>
      </ScreenContainer>
    );
  }

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
              <Text className="text-2xl font-bold text-foreground">Manage Divisions</Text>
              <Text className="text-sm text-muted mt-1">{companyName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
            <IconSymbol name={isAdding ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add New Division Form */}
          {isAdding && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">Add New Division</Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Division Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter division name"
                  placeholderTextColor={colors.muted}
                  value={newDivisionName}
                  onChangeText={setNewDivisionName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter description (optional)"
                  placeholderTextColor={colors.muted}
                  value={newDivisionDescription}
                  onChangeText={setNewDivisionDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className="bg-primary py-3 rounded-full items-center"
                onPress={handleCreate}
                disabled={createDivision.isPending}
              >
                {createDivision.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create Division</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Divisions List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All Divisions ({divisions?.length || 0})</Text>
          
          {divisions && divisions.length > 0 ? (
             divisions.map((division: any) => {
              const company = companies?.find((c: any) => c.id === division.companyId);
              return (
              <View key={division.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{division.name}</Text>
                    {isGlobalMode && company && (
                      <Text className="text-sm text-primary mt-1">Company: {company.name}</Text>
                    )}
                    <Text className="text-xs text-muted mt-1">ID: {division.id} | Code: {division.code}</Text>
                    {division.description && (
                      <Text className="text-sm text-muted mt-1">{division.description}</Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => router.push(`/admin-departments?divisionId=${division.id}&divisionName=${encodeURIComponent(division.name)}` as any)}
                    >
                      <IconSymbol name="chevron.right" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(division.id, division.name)}
                      disabled={deleteDivision.isPending}
                    >
                      <IconSymbol name="trash" size={22} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
            })
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">No divisions yet. Add your first division above.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
