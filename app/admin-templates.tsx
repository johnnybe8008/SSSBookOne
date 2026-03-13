import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Template Management
 * 
 * List, rename, and delete company structure templates.
 */
export default function AdminTemplatesScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: templates, isLoading } = trpc.templates.list.useQuery();

  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      Alert.alert("Success", "Template deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete template");
    },
  });

  const renameMutation = trpc.templates.rename.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      setEditingId(null);
      Alert.alert("Success", "Template updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update template");
    },
  });

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDescription(template.description || "");
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert("Validation Error", "Template name is required");
      return;
    }

    renameMutation.mutate({
      id: editingId!,
      name: editName.trim(),
      description: editDescription.trim(),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Company Templates</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Info Card */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <Text className="text-base text-muted leading-relaxed">
              Templates allow you to save a company's organizational structure (divisions, departments, and teams) and quickly apply it to new companies.
            </Text>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-sm text-muted mt-3">Loading templates...</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && (!templates || templates.length === 0) && (
            <View className="items-center py-12">
              <View className="w-20 h-20 bg-muted/20 rounded-full items-center justify-center mb-4">
                <IconSymbol name="doc.fill" size={40} color={colors.muted} />
              </View>
              <Text className="text-lg font-semibold text-foreground mb-2">No Templates Yet</Text>
              <Text className="text-sm text-muted text-center">
                Create a template by going to a company's detail screen and tapping "Save as Template"
              </Text>
            </View>
          )}

          {/* Template List */}
          {!isLoading && templates && templates.length > 0 && (
            <View className="gap-3">
              {templates.map((template: any) => (
                <View key={template.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  {editingId === template.id ? (
                    /* Edit Mode */
                    <View className="p-5 gap-4">
                      <View>
                        <Text className="text-sm font-medium text-foreground mb-2">Template Name</Text>
                        <TextInput
                          className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                          placeholder="Enter template name"
                          placeholderTextColor={colors.muted}
                          value={editName}
                          onChangeText={setEditName}
                        />
                      </View>

                      <View>
                        <Text className="text-sm font-medium text-foreground mb-2">Description (Optional)</Text>
                        <TextInput
                          className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground min-h-[80px]"
                          placeholder="Enter description"
                          placeholderTextColor={colors.muted}
                          value={editDescription}
                          onChangeText={setEditDescription}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                      </View>

                      <View className="flex-row gap-3">
                        <TouchableOpacity
                          className="flex-1 bg-background border border-border py-3 rounded-full items-center"
                          onPress={handleCancelEdit}
                          disabled={renameMutation.isPending}
                        >
                          <Text className="text-foreground font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 bg-primary py-3 rounded-full items-center"
                          onPress={handleSaveEdit}
                          disabled={renameMutation.isPending}
                        >
                          {renameMutation.isPending ? (
                            <ActivityIndicator size="small" color={colors.background} />
                          ) : (
                            <Text className="text-background font-bold">Save</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    /* View Mode */
                    <View className="p-5">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 mr-3">
                          <Text className="text-lg font-bold text-foreground mb-1">{template.name}</Text>
                          {template.description && (
                            <Text className="text-sm text-muted leading-relaxed">{template.description}</Text>
                          )}
                        </View>
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center"
                            onPress={() => handleEdit(template)}
                          >
                            <IconSymbol name="pencil" size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="w-10 h-10 bg-error/10 rounded-full items-center justify-center"
                            onPress={() => handleDelete(template.id, template.name)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables?.id === template.id ? (
                              <ActivityIndicator size="small" color={colors.error} />
                            ) : (
                              <IconSymbol name="trash" size={18} color={colors.error} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Template Structure Summary */}
                      {template.templateData && (
                        <View className="bg-background rounded-xl p-3 gap-2">
                          <Text className="text-xs font-semibold text-muted uppercase">Structure</Text>
                          <Text className="text-sm text-foreground">
                            • {template.templateData.divisions?.length || 0} Divisions
                          </Text>
                          <Text className="text-sm text-foreground">
                            • {template.templateData.divisions?.reduce((sum: number, div: any) => sum + (div.departments?.length || 0), 0) || 0} Departments
                          </Text>
                          <Text className="text-sm text-foreground">
                            • {template.templateData.divisions?.reduce((sum: number, div: any) => 
                                sum + (div.departments?.reduce((dSum: number, dept: any) => dSum + (dept.teams?.length || 0), 0) || 0), 0) || 0} Teams
                          </Text>
                        </View>
                      )}

                      <View className="mt-3 pt-3 border-t border-border">
                        <Text className="text-xs text-muted">
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
