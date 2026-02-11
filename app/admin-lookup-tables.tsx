import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

type TableType = "types" | "statuses" | "results";

/**
 * Admin - Manage Lookup Tables
 * 
 * Allows admin users to manage:
 * - Session Types
 * - Session Statuses
 * - Session Results
 */
export default function AdminLookupTablesScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  const [activeTable, setActiveTable] = useState<TableType>("types");
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // Fetch data for all tables
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: sessionResults } = trpc.sessionResults.list.useQuery();

  // Mutations for session types
  const createType = trpc.sessionTypes.create.useMutation({
    onSuccess: () => {
      utils.sessionTypes.invalidate();
      setIsAdding(false);
      setNewItemName("");
      Alert.alert("Success", "Session type created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create session type");
    },
  });

  const toggleType = trpc.sessionTypes.update.useMutation({
    onSuccess: () => {
      utils.sessionTypes.invalidate();
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
      setIsAdding(false);
      setNewItemName("");
      Alert.alert("Success", "Session status created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create session status");
    },
  });

  const toggleStatus = trpc.sessionStatuses.update.useMutation({
    onSuccess: () => {
      utils.sessionStatuses.invalidate();
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
      setIsAdding(false);
      setNewItemName("");
      Alert.alert("Success", "Session result created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create session result");
    },
  });

  const toggleResult = trpc.sessionResults.update.useMutation({
    onSuccess: () => {
      utils.sessionResults.invalidate();
      Alert.alert("Success", "Session result updated successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update session result");
    },
  });

  const handleCreate = () => {
    if (!newItemName.trim()) {
      Alert.alert("Validation Error", "Please enter a name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const input = {
      name: newItemName.trim(),
      isActive: 1,
      createdBy: user.id,
      updatedBy: user.id,
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
            if (!user?.id) return;
            const input = { id, isActive: newIsActive, updatedBy: user.id };
            switch (activeTable) {
              case "types":
                toggleType.mutate(input);
                break;
              case "statuses":
                toggleStatus.mutate(input);
                break;
              case "results":
                toggleResult.mutate(input);
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
  const isPending = createType.isPending || createStatus.isPending || createResult.isPending;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Lookup Tables</Text>
          </View>
          <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
            <IconSymbol name={isAdding ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTable === "types" ? "bg-primary" : "bg-surface"}`}
            onPress={() => {
              setActiveTable("types");
              setIsAdding(false);
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
              setIsAdding(false);
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
              setIsAdding(false);
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
          {/* Add New Item Form */}
          {isAdding && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">Add New {getTableTitle().slice(8, -1)}</Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter name"
                  placeholderTextColor={colors.muted}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                className="bg-primary py-3 rounded-full items-center"
                onPress={handleCreate}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Items List */}
          <Text className="text-lg font-semibold text-foreground mt-2">{getTableTitle()} ({data.length})</Text>
          
          {data.length > 0 ? (
            data.map((item: any) => (
              <View key={item.id} className="bg-surface border border-border rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-medium text-foreground">{item.name}</Text>
                  {item.isActive === 0 && (
                    <Text className="text-sm text-muted mt-1">Inactive</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleActive(item.id, item.name, item.isActive)}
                >
                  <IconSymbol 
                    name={item.isActive === 1 ? "xmark.circle.fill" : "checkmark.circle.fill"} 
                    size={22} 
                    color={item.isActive === 1 ? colors.error : colors.success} 
                  />
                </TouchableOpacity>
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
