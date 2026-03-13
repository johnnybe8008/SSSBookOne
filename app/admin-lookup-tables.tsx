import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";

type TableType = "types" | "statuses" | "results";

interface EditingItem {
  id: number;
  name: string;
}

/**
 * Admin - Manage Lookup Tables
 * 
 * Allows admin staff to manage:
 * - Session Types
 * - Session Statuses
 * - Session Results
 */
export default function AdminLookupTablesScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { staff } = useAuth();

  const [activeTable, setActiveTable] = useState<TableType>("types");
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  // Fetch data for all tables
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: sessionResults } = trpc.sessionResults.list.useQuery();

  // Mutations for session types
  const createType = trpc.sessionTypes.create.useMutation({
    onSuccess: () => {
      utils.sessionTypes.invalidate();
      resetForm();
      Alert.alert("Success", "Session type created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create session type");
    },
  });

  const updateType = trpc.sessionTypes.update.useMutation({
    onSuccess: () => {
      utils.sessionTypes.invalidate();
      resetForm();
      Alert.alert("Success", "Session type updated successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update session type");
    },
  });

  // Mutations for session statuses
  const createStatus = trpc.sessionStatuses.create.useMutation({
    onSuccess: () => {
      utils.sessionStatuses.invalidate();
      resetForm();
      Alert.alert("Success", "Session status created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create session status");
    },
  });

  const updateStatus = trpc.sessionStatuses.update.useMutation({
    onSuccess: () => {
      utils.sessionStatuses.invalidate();
      resetForm();
      Alert.alert("Success", "Session status updated successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update session status");
    },
  });

  // Mutations for session results
  const createResult = trpc.sessionResults.create.useMutation({
    onSuccess: () => {
      utils.sessionResults.invalidate();
      resetForm();
      Alert.alert("Success", "Session result created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create session result");
    },
  });

  const updateResult = trpc.sessionResults.update.useMutation({
    onSuccess: () => {
      utils.sessionResults.invalidate();
      resetForm();
      Alert.alert("Success", "Session result updated successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update session result");
    },
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormData({ name: "" });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter a name");
      return;
    }
    if (!staff?.id) {
      Alert.alert("Error", "Staff not authenticated");
      return;
    }
    const input = {
      name: formData.name.trim(),
      isActive: 1,
      createdBy: staff.id,
      updatedBy: staff.id,
    };

    switch (activeTable) {
      case "types":
        createType.mutate(input);
        break;
      case "statuses":
        createStatus.mutate(input);
        break;
      case "results":
        createResult.mutate(input);
        break;
    }
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter a name");
      return;
    }
    if (!staff?.id) {
      Alert.alert("Error", "Staff not authenticated");
      return;
    }
    const input = {
      id: editingItem.id,
      name: formData.name.trim(),
      updatedBy: staff.id,
    };

    switch (activeTable) {
      case "types":
        updateType.mutate(input);
        break;
      case "statuses":
        updateStatus.mutate(input);
        break;
      case "results":
        updateResult.mutate(input);
        break;
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem({ id: item.id, name: item.name });
    setFormData({ name: item.name });
    setIsAdding(false);
  };

  const handleToggleActive = (id: number, name: string, currentIsActive: number) => {
    const newIsActive = currentIsActive === 1 ? 0 : 1;
    const action = newIsActive === 1 ? "activate" : "deactivate";
    
    Alert.alert(
      `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Are you sure you want to ${action} "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newIsActive === 0 ? "destructive" : "default",
          onPress: () => {
            if (!staff?.id) return;
            const input = { id, isActive: newIsActive, updatedBy: staff.id };
            switch (activeTable) {
              case "types":
                updateType.mutate(input);
                break;
              case "statuses":
                updateStatus.mutate(input);
                break;
              case "results":
                updateResult.mutate(input);
                break;
            }
          },
        },
      ]
    );
  };

  const getCurrentData = () => {
    switch (activeTable) {
      case "types":
        return sessionTypes || [];
      case "statuses":
        return sessionStatuses || [];
      case "results":
        return sessionResults || [];
    }
  };

  const getTableTitle = () => {
    switch (activeTable) {
      case "types":
        return "Session Types";
      case "statuses":
        return "Session Statuses";
      case "results":
        return "Session Results";
    }
  };

  const data = getCurrentData();
  const isPending = createType.isPending || createStatus.isPending || createResult.isPending ||
                    updateType.isPending || updateStatus.isPending || updateResult.isPending;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-3xl font-bold text-foreground">&lt;</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Lookup Tables</Text>
          </View>
          <TouchableOpacity onPress={() => {
            if (isAdding || editingItem) {
              resetForm();
            } else {
              setIsAdding(true);
            }
          }}>
            <IconSymbol name={(isAdding || editingItem) ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTable === "types" ? "bg-primary" : "bg-surface"}`}
            onPress={() => {
              setActiveTable("types");
              resetForm();
            }}
          >
            <Text className={`text-center font-semibold ${activeTable === "types" ? "text-background" : "text-foreground"}`}>
              Types
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTable === "statuses" ? "bg-primary" : "bg-surface"}`}
            onPress={() => {
              setActiveTable("statuses");
              resetForm();
            }}
          >
            <Text className={`text-center font-semibold ${activeTable === "statuses" ? "text-background" : "text-foreground"}`}>
              Statuses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTable === "results" ? "bg-primary" : "bg-surface"}`}
            onPress={() => {
              setActiveTable("results");
              resetForm();
            }}
          >
            <Text className={`text-center font-semibold ${activeTable === "results" ? "text-background" : "text-foreground"}`}>
              Results
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add/Edit Form */}
          {(isAdding || editingItem) && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                {editingItem ? `Edit ${getTableTitle().slice(8, -1)}` : `Add New ${getTableTitle().slice(8, -1)}`}
              </Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter name"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                />
              </View>


              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-surface border border-border py-3 rounded-full items-center"
                  onPress={resetForm}
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary py-3 rounded-full items-center"
                  onPress={editingItem ? handleUpdate : handleCreate}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="text-background font-semibold">{editingItem ? "Update" : "Create"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Items List */}
          <Text className="text-lg font-semibold text-foreground mt-2">{getTableTitle()} ({data.length})</Text>
          
          {data.length > 0 ? (
            data.map((item: any) => (
              <View key={item.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                    {item.isActive === 0 && (
                      <View className="mt-2">
                        <View className="px-2 py-1 bg-error/20 rounded self-start">
                          <Text className="text-xs font-medium text-error">Inactive</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                <View className="flex-row gap-2 pt-3 border-t border-border">
                  <TouchableOpacity
                    className="flex-1 bg-background border border-border py-2 rounded-xl items-center"
                    onPress={() => handleEdit(item)}
                  >
                    <Text className="text-sm font-medium text-foreground">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-xl items-center ${item.isActive === 1 ? "bg-error/10 border border-error" : "bg-success/10 border border-success"}`}
                    onPress={() => handleToggleActive(item.id, item.name, item.isActive)}
                  >
                    <Text className={`text-sm font-medium ${item.isActive === 1 ? "text-error" : "text-success"}`}>
                      {item.isActive === 1 ? "Deactivate" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">No items yet. Add your first item above.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
